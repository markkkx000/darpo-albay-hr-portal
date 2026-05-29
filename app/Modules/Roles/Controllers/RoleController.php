<?php

namespace App\Modules\Roles\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Roles\Requests\RoleCreateRequest;
use App\Modules\Roles\Requests\RoleUpdateRequest;
use App\Modules\Roles\Services\RoleService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class RoleController extends Controller
{
    public function __construct(protected RoleService $service) {}

    public function index(): Response
    {
        $this->authorize('roles.manage');

        return Inertia::render('Modules/Roles/RolesIndex', [
            'roles' => Role::with('permissions')->get(),
            'permissions' => $this->service->getAllPermissions(),
        ]);
    }

    public function store(RoleCreateRequest $request): RedirectResponse
    {
        $this->authorize('roles.manage');

        $this->service->createRole($request->name, $request->permissions ?? []);

        return redirect()->back()->with('success', 'Role created successfully.');
    }

    public function update(RoleUpdateRequest $request, Role $role): RedirectResponse
    {
        $this->authorize('roles.manage');

        $this->service->updateRole($role, $request->name, $request->permissions ?? []);

        return redirect()->back()->with('success', 'Role updated successfully.');
    }

    public function destroy(Role $role): RedirectResponse
    {
        $this->authorize('roles.manage');

        try {
            $this->service->deleteRole($role);

            return redirect()->back()->with('success', 'Role deleted successfully.');
        } catch (\DomainException $e) {
            return redirect()->back()->withErrors(['error' => $e->getMessage()]);
        }
    }
}
