<?php

namespace App\Modules\Announcements\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Modules\Announcements\Models\Announcement;
use App\Modules\Announcements\Requests\AnnouncementCreateRequest;
use App\Modules\Announcements\Requests\AnnouncementPublishRequest;
use App\Modules\Announcements\Requests\AnnouncementUpdateRequest;
use App\Modules\Announcements\Services\AnnouncementService;
use App\Modules\Personnel\Models\Division;
use App\Modules\Personnel\Models\Position;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AnnouncementController extends Controller
{
    public function __construct(
        protected AnnouncementService $announcementService
    ) {}

    /**
     * Display a listing of published announcements.
     */
    public function index(Request $request): Response
    {
        return Inertia::render('Modules/Announcements/Index', [
            'announcements' => $this->announcementService->getPublishedForUser($request->user()),
        ]);
    }

    /**
     * Display the specified announcement.
     */
    public function show(Announcement $announcement, Request $request): Response
    {
        // Check visibility
        if ($announcement->status !== 'published') {
            abort_unless($request->user()->can('announcements.manage'), 403);
        }

        if ($announcement->status === 'published') {
            // Verify targeting
            abort_unless($this->isTargeted($announcement, $request->user()), 403);
        }

        return Inertia::render('Modules/Announcements/Show', [
            'announcement' => $announcement->load('author'),
        ]);
    }

    /**
     * Display management view for HR/Dept Heads.
     */
    public function manage(Request $request): Response
    {
        abort_unless($request->user()->can('announcements.manage'), 403);

        return Inertia::render('Modules/Announcements/Manage', [
            'announcements' => $this->announcementService->getAllForHR(),
        ]);
    }

    /**
     * Show create form.
     */
    public function create(Request $request): Response
    {
        abort_unless($request->user()->can('announcements.manage'), 403);

        return Inertia::render('Modules/Announcements/Create', [
            'divisions' => Division::all(['id', 'name']),
            'positions' => Position::all(['id', 'name']),
            'users' => User::select(['id', 'first_name', 'last_name'])->get()->map(fn ($u) => ['id' => $u->id, 'name' => $u->name]),
        ]);
    }

    /**
     * Store a new draft.
     */
    public function store(AnnouncementCreateRequest $request): RedirectResponse
    {
        $this->announcementService->create($request->validated(), $request->user());

        return redirect()->route('announcements.manage')
            ->with('success', 'Announcement draft created successfully.');
    }

    /**
     * Show edit form.
     */
    public function edit(Announcement $announcement, Request $request): Response
    {
        abort_unless($request->user()->can('announcements.manage'), 403);
        abort_if($announcement->status === 'published', 403, 'Published announcements cannot be edited.');

        return Inertia::render('Modules/Announcements/Edit', [
            'announcement' => $announcement,
            'divisions' => Division::all(['id', 'name']),
            'positions' => Position::all(['id', 'name']),
            'users' => User::select(['id', 'first_name', 'last_name'])->get()->map(fn ($u) => ['id' => $u->id, 'name' => $u->name]),
        ]);
    }

    /**
     * Update draft.
     */
    public function update(AnnouncementUpdateRequest $request, Announcement $announcement): RedirectResponse
    {
        $this->announcementService->update($announcement, $request->validated());

        return redirect()->route('announcements.manage')
            ->with('success', 'Announcement updated successfully.');
    }

    /**
     * Publish announcement.
     */
    public function publish(AnnouncementPublishRequest $request, Announcement $announcement): RedirectResponse
    {
        $this->announcementService->publish($announcement, $request->user());

        return back()->with('success', 'Announcement published successfully.');
    }

    /**
     * Soft delete announcement.
     */
    public function destroy(Announcement $announcement, Request $request): RedirectResponse
    {
        abort_unless($request->user()->can('announcements.manage'), 403);

        $this->announcementService->delete($announcement);

        return back()->with('success', 'Announcement deleted successfully.');
    }

    /**
     * Helper to check if a user is targeted by an announcement.
     */
    protected function isTargeted(Announcement $announcement, User $user): bool
    {
        if ($announcement->target_type === 'all') {
            return true;
        }

        if ($announcement->target_type === 'division') {
            return (int) $announcement->target_id === (int) $user->division_id;
        }

        if ($announcement->target_type === 'position') {
            return $user->positions->contains('id', (int) $announcement->target_id);
        }

        if ($announcement->target_type === 'user') {
            return (int) $announcement->target_id === (int) $user->id;
        }

        return false;
    }
}
