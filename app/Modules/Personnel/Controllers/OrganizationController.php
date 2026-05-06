<?php

namespace App\Modules\Personnel\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Personnel\Models\Division;
use App\Modules\Personnel\Models\Position;
use App\Modules\Personnel\Models\Unit;
use App\Modules\Personnel\Requests\StoreDivisionRequest;
use App\Modules\Personnel\Requests\StorePositionRequest;
use App\Modules\Personnel\Requests\StoreUnitRequest;
use App\Modules\Personnel\Requests\UpdateDivisionRequest;
use App\Modules\Personnel\Requests\UpdatePositionRequest;
use App\Modules\Personnel\Requests\UpdateUnitRequest;
use App\Modules\Personnel\Services\OrganizationService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class OrganizationController extends Controller
{
    public function __construct(
        protected OrganizationService $organizationService
    ) {}

    public function index(): Response
    {
        $this->authorize('personnel.update');

        return Inertia::render('Modules/Personnel/Organization/Index', [
            'divisions' => $this->organizationService->getOrganizationData(),
        ]);
    }

    public function storeDivision(StoreDivisionRequest $request): RedirectResponse
    {
        $this->organizationService->createDivision($request->validated());

        return back()->with('success', 'Division created successfully.');
    }

    public function updateDivision(UpdateDivisionRequest $request, Division $division): RedirectResponse
    {
        $this->organizationService->updateDivision($division, $request->validated());

        return back()->with('success', 'Division updated successfully.');
    }

    public function storeUnit(StoreUnitRequest $request): RedirectResponse
    {
        $this->organizationService->createUnit($request->validated());

        return back()->with('success', 'Unit created successfully.');
    }

    public function updateUnit(UpdateUnitRequest $request, Unit $unit): RedirectResponse
    {
        $this->organizationService->updateUnit($unit, $request->validated());

        return back()->with('success', 'Unit updated successfully.');
    }

    public function storePosition(StorePositionRequest $request): RedirectResponse
    {
        $this->organizationService->createPosition($request->validated());

        return back()->with('success', 'Position created successfully.');
    }

    public function updatePosition(UpdatePositionRequest $request, Position $position): RedirectResponse
    {
        $this->organizationService->updatePosition($position, $request->validated());

        return back()->with('success', 'Position updated successfully.');
    }
}
