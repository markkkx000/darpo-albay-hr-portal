<?php

namespace App\Modules\Roles\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Modules\Roles\Requests\UserRoleSyncRequest;
use App\Modules\Roles\Services\RoleService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UserRoleController extends Controller
{
    public function __construct(protected RoleService $service) {}

    public function index(Request $request): Response
    {
        return Inertia::render('Modules/Roles/UserRolesIndex', [
            'users' => $this->service->getPaginatedUsersWithRoles($request->search),
            'allUsers' => User::select(['id', 'first_name', 'last_name', 'employee_number'])->get(),
            'roles' => $this->service->getAssignableRoles(),
            'filters' => $request->only(['search']),
        ]);
    }

    public function assign(UserRoleSyncRequest $request, User $user): RedirectResponse
    {
        try {
            $this->service->syncUserRole($user, $request->role);

            return redirect()->back()->with('success', "Role assigned successfully to {$user->name}.");
        } catch (\DomainException $e) {
            return redirect()->back()->withErrors(['error' => $e->getMessage()]);
        }
    }
}
