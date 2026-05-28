<?php

namespace App\Modules\DocumentRequests\Controllers;

use App\Core\Services\NotificationService;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Modules\DocumentRequests\Models\DocumentRequest;
use App\Modules\DocumentRequests\Requests\ReleaseDocumentRequest;
use App\Modules\DocumentRequests\Requests\StoreDocumentRequest;
use App\Modules\DocumentRequests\Services\DocumentRequestService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DocumentRequestController extends Controller
{
    public function __construct(
        private DocumentRequestService $service,
        private NotificationService $notificationService
    ) {}

    public function index(Request $request)
    {
        $user = Auth::user();
        $isHr = $user->can('document_requests.manage');

        $filters = $request->only(['status', 'date_from', 'date_to', 'document', 'sort_date']);

        $query = DocumentRequest::with(['user', 'requester', 'receiver'])
            ->when($request->status && $request->status !== 'all', function ($q) use ($request) {
                $q->where('status', $request->status);
            }, function ($q) {
                $q->whereNotIn('status', ['Cancelled', 'Rejected']);
            })
            ->when($request->date_from, function ($q, $dateFrom) {
                $q->whereDate('created_at', '>=', $dateFrom);
            })
            ->when($request->date_to, function ($q, $dateTo) {
                $q->whereDate('created_at', '<=', $dateTo);
            })
            ->when($request->document, function ($q, $document) {
                if ($document !== 'all') {
                    $q->whereJsonContains('requests', $document);
                }
            })
            ->orderBy('created_at', $request->sort_date === 'asc' ? 'asc' : 'desc');

        if (! $isHr) {
            $query->where('user_id', $user->id);
        }

        $requests = $query->paginate(15)->withQueryString();

        $users = [];
        if ($isHr) {
            $users = User::where('is_active', true)
                ->select('id', 'first_name', 'last_name', 'employee_number')
                ->orderBy('first_name')
                ->get();
        }

        return Inertia::render('Modules/DocumentRequests/Index', [
            'documentRequests' => $requests,
            'isHr' => $isHr,
            'users' => $users,
            'filters' => $filters,
        ]);
    }

    public function create()
    {
        $users = User::where('is_active', true)
            ->select('id', 'first_name', 'last_name', 'employee_number')
            ->orderBy('first_name')
            ->get();

        return Inertia::render('Modules/DocumentRequests/Create', [
            'users' => $users,
        ]);
    }

    public function store(StoreDocumentRequest $request)
    {
        $validated = $request->validated();
        $validated['requested_by'] = Auth::id();

        $documentRequest = DocumentRequest::create($validated);

        // Notify HR Admin and HR Staff
        $hrUsers = User::role(['hr_admin', 'hr_staff'])->get();
        foreach ($hrUsers as $hr) {
            $this->notificationService->notifyUser($hr, [
                'title' => 'New Document Request',
                'message' => "A new document request has been submitted for {$documentRequest->user->first_name} {$documentRequest->user->last_name}.",
                'action_url' => route('documentrequests.index'),
                'icon' => 'FileText',
                'color' => 'blue',
            ]);
        }

        return redirect()->route('documentrequests.index')->with('success', 'Document request submitted successfully.');
    }

    public function markAsReceived(DocumentRequest $documentRequest)
    {
        if (! Auth::user()->can('document_requests.manage')) {
            abort(403);
        }

        $documentRequest->update([
            'status' => 'Received',
            'received_by' => Auth::id(),
        ]);

        $this->notificationService->notifyUser($documentRequest->user, [
            'title' => 'Document Request Received',
            'message' => 'Your document request is now being processed by HR.',
            'icon' => 'CheckCircle',
            'color' => 'indigo',
        ]);

        return back()->with('success', 'Request marked as received.');
    }

    public function release(ReleaseDocumentRequest $request, DocumentRequest $documentRequest)
    {
        $validated = $request->validated();

        $data = [
            'is_electronic' => $validated['is_electronic'],
        ];

        if ($validated['is_electronic']) {
            if ($request->hasFile('files')) {
                $paths = $this->service->storeAttachments($request->file('files'));
                $data['files'] = $paths;
            }
            $data['status'] = 'Released/Sent';
            $data['released_to'] = $documentRequest->user->first_name.' '.$documentRequest->user->last_name;
            $data['released_at'] = now();

            $documentRequest->update($data);

            $this->notificationService->notifyUser($documentRequest->user, [
                'title' => 'Document Request Sent',
                'message' => 'Your requested documents have been sent electronically.',
                'action_url' => route('documentrequests.index'),
                'icon' => 'Send',
                'color' => 'green',
            ]);
        } else {
            $data['status'] = 'Ready for Pickup';
            $documentRequest->update($data);

            $this->notificationService->notifyUser($documentRequest->user, [
                'title' => 'Documents Ready for Pickup',
                'message' => 'Your requested documents are ready to be picked up at the HR office.',
                'action_url' => route('documentrequests.index'),
                'icon' => 'Box',
                'color' => 'orange',
            ]);
        }

        return back()->with('success', 'Request processed successfully.');
    }

    public function markAsPickedUp(Request $request, DocumentRequest $documentRequest)
    {
        if (! Auth::user()->can('document_requests.manage')) {
            abort(403);
        }

        $request->validate([
            'released_to' => ['required', 'string', 'max:255'],
        ]);

        $documentRequest->update([
            'status' => 'Released/Sent',
            'released_to' => $request->released_to,
            'released_at' => now(),
        ]);

        return back()->with('success', 'Request marked as picked up.');
    }

    public function updateStatus(Request $request, DocumentRequest $documentRequest)
    {
        $request->validate([
            'status' => ['required', 'in:Rejected,Cancelled'],
        ]);

        // Only requester can cancel their own, or HR can cancel/reject
        $isHr = Auth::user()->can('document_requests.manage');
        if (! $isHr && $request->status === 'Rejected') {
            abort(403, 'You cannot reject a request.');
        }

        if (! $isHr && Auth::id() !== $documentRequest->requested_by && Auth::id() !== $documentRequest->user_id) {
            abort(403, 'Unauthorized.');
        }

        $documentRequest->update([
            'status' => $request->status,
        ]);

        if ($request->status === 'Rejected') {
            $this->notificationService->notifyUser($documentRequest->user, [
                'title' => 'Document Request Rejected',
                'message' => 'Your document request has been rejected by HR.',
                'icon' => 'XCircle',
                'color' => 'red',
            ]);
        }

        return back()->with('success', "Request status updated to {$request->status}.");
    }

    public function show(DocumentRequest $documentRequest)
    {
        $isHr = Auth::user()->can('document_requests.manage');

        if (! $isHr && Auth::id() !== $documentRequest->user_id && Auth::id() !== $documentRequest->requested_by) {
            abort(403);
        }

        $documentRequest->load(['user', 'requester', 'receiver']);
        $users = [];
        if ($isHr) {
            $users = User::where('is_active', true)
                ->select('id', 'first_name', 'last_name', 'employee_number')
                ->orderBy('first_name')
                ->get();
        }

        return Inertia::render('Modules/DocumentRequests/Show', [
            'documentRequest' => $documentRequest,
            'isHr' => $isHr,
            'users' => $users,
        ]);
    }

    public function acknowledge(Request $request, DocumentRequest $documentRequest)
    {
        if (Auth::id() !== $documentRequest->user_id && Auth::id() !== $documentRequest->requested_by) {
            abort(403, 'Only the requesting employee can acknowledge receipt.');
        }

        if ($documentRequest->status !== 'Released/Sent') {
            abort(400, 'Request is not in a state to be acknowledged.');
        }

        $documentRequest->update([
            'status' => 'Completed',
            'acknowledged_at' => now(),
            'acknowledged_ip' => $request->ip(),
        ]);

        if ($documentRequest->received_by) {
            $this->notificationService->notifyUser($documentRequest->receiver, [
                'title' => 'Document Receipt Acknowledged',
                'message' => $documentRequest->user->first_name.' has acknowledged receipt of their documents.',
                'action_url' => route('documentrequests.show', $documentRequest->id),
                'icon' => 'CheckCircle',
                'color' => 'green',
            ]);
        }

        return back()->with('success', 'You have successfully acknowledged receipt of the documents.');
    }
}
