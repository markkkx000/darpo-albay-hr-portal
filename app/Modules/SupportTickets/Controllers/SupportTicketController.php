<?php

namespace App\Modules\SupportTickets\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\SupportTickets\Models\SupportTicket;
use App\Modules\SupportTickets\Requests\SupportTicketRequest;
use App\Modules\SupportTickets\Services\GitHubSupportService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class SupportTicketController extends Controller
{
    public function __construct(
        protected GitHubSupportService $github
    ) {}

    /**
     * Display a listing of the user's tickets.
     */
    public function index()
    {

        $tickets = SupportTicket::where('user_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Modules/SupportTickets/Index', [
            'tickets' => $tickets,
        ]);
    }

    /**
     * Store a newly created ticket in storage and GitHub.
     */
    public function store(SupportTicketRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $user = Auth::user();

        $attachmentLinks = [];
        if ($request->hasFile('attachments')) {
            foreach ($request->file('attachments') as $file) {
                // Store in public disk to be accessible (ensure config/filesystems.php is set up for this)
                // Using a signed url or generic storage path.
                $path = $file->store('support', 'public');
                $url = Storage::disk('public')->url($path);
                $attachmentLinks[] = $url;
            }
        }

        $markdownBody = "**Submitted by:** {$user->name} ({$user->email})\n";
        $markdownBody .= "**Type:** {$validated['type']}\n";

        if (! empty($validated['urlContext'])) {
            $markdownBody .= "**URL Context:** {$validated['urlContext']}\n";
        }
        if (! empty($validated['browserContext'])) {
            $markdownBody .= "**Browser:** {$validated['browserContext']}\n";
        }

        $markdownBody .= "\n---\n\n**Description:**\n".$validated['description']."\n";

        if (! empty($attachmentLinks)) {
            $markdownBody .= "\n**Attachments:**\n";
            foreach ($attachmentLinks as $link) {
                $markdownBody .= "![Attachment]({$link})\n";
            }
        }

        $githubIssue = $this->github->createIssue(
            title: $validated['title'],
            body: $markdownBody,
            labels: [$validated['type']]
        );

        if (! $githubIssue) {
            return back()->with('error', 'Failed to submit the support ticket. Please try again later.');
        }

        SupportTicket::create([
            'user_id' => $user->id,
            'github_issue_id' => $githubIssue['number'],
            'title' => $validated['title'],
            'type' => $validated['type'],
            'status' => 'open',
        ]);

        return back()->with('success', 'Support ticket submitted successfully!');
    }

    /**
     * Display the specified ticket and fetch its thread from GitHub.
     */
    public function show(SupportTicket $ticket)
    {
        if ($ticket->user_id !== Auth::id()) {
            abort(403);
        }

        $cacheKeyIssue = "github_issue_{$ticket->github_issue_id}";
        $issue = Cache::get($cacheKeyIssue);

        if (! $issue) {
            $apiIssue = $this->github->getIssue($ticket->github_issue_id);
            if ($apiIssue) {
                $issue = $apiIssue;
                Cache::put($cacheKeyIssue, $issue, 15);
            }
        }

        if ($issue && isset($issue['state']) && $issue['state'] !== $ticket->status) {
            $ticket->update(['status' => $issue['state']]);
        }

        $cacheKeyTimeline = "github_timeline_{$ticket->github_issue_id}";
        $events = Cache::get($cacheKeyTimeline);

        if ($events === null) {
            $apiEvents = $this->github->getTimeline($ticket->github_issue_id);
            if ($apiEvents !== null) {
                $events = $apiEvents;
                Cache::put($cacheKeyTimeline, $events, 15);
            } else {
                $events = []; // Fallback if API fails and cache is empty
            }
        }

        $filteredEvents = collect($events)->filter(function ($e) {
            return in_array($e['event'] ?? null, ['commented', 'closed', 'reopened']);
        })->values()->toArray();

        // Create a mock comment for the original issue description
        $issueComment = [
            'id' => 'issue-'.$ticket->github_issue_id,
            'body' => $issue['body'] ?? '',
            'created_at' => $issue['created_at'] ?? $ticket->created_at,
            'user' => $issue['user'] ?? ['login' => 'User', 'avatar_url' => ''],
            'event' => 'commented',
        ];

        array_unshift($filteredEvents, $issueComment);

        return Inertia::render('Modules/SupportTickets/Show', [
            'ticket' => $ticket,
            'comments' => $filteredEvents,
        ]);
    }

    /**
     * Post a reply to the ticket's GitHub issue thread.
     */
    public function reply(Request $request, SupportTicket $ticket): RedirectResponse
    {
        if ($ticket->user_id !== Auth::id()) {
            abort(403);
        }

        $validated = $request->validate([
            'body' => ['required', 'string', 'max:5000'],
            'attachments' => ['nullable', 'array', 'max:10'],
            'attachments.*' => ['file', 'mimes:jpg,jpeg,png,gif,webp', 'max:5120'], // 5MB max
        ]);

        $user = Auth::user();
        $replyBody = "**Reply from {$user->name} ({$user->email}):**\n\n".$validated['body'];

        $attachmentLinks = [];
        if ($request->hasFile('attachments')) {
            foreach ($request->file('attachments') as $file) {
                $path = $file->store('support', 'public');
                $url = Storage::disk('public')->url($path);
                $attachmentLinks[] = $url;
            }
        }

        if (! empty($attachmentLinks)) {
            $replyBody .= "\n\n**Attachments:**\n";
            foreach ($attachmentLinks as $link) {
                $replyBody .= "![Attachment]({$link})\n";
            }
        }

        $result = $this->github->postComment($ticket->github_issue_id, $replyBody);

        if (! $result) {
            return back()->with('error', 'Failed to post reply.');
        }

        return back()->with('success', 'Reply posted successfully!');
    }

    /**
     * Manually refresh ticket statuses.
     */
    public function refresh(Request $request): RedirectResponse
    {
        $userId = Auth::id();
        $cacheKey = "support_tickets_sync_{$userId}";

        if (Cache::has($cacheKey)) {
            return back()->with('error', 'Please wait a few minutes before refreshing again.');
        }

        $openTickets = SupportTicket::where('user_id', $userId)
            ->where('status', 'open')
            ->get();

        foreach ($openTickets as $openTicket) {
            $issue = $this->github->getIssue($openTicket->github_issue_id);
            if ($issue && isset($issue['state']) && $issue['state'] !== $openTicket->status) {
                $openTicket->update(['status' => $issue['state']]);
            }
        }

        Cache::put($cacheKey, true, now()->addMinutes(5));

        return back()->with('success', 'Tickets refreshed successfully.');
    }
}
