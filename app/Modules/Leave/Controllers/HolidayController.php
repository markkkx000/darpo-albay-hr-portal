<?php

namespace App\Modules\Leave\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Leave\Models\Holiday;
use App\Modules\Leave\Requests\StoreHolidayRequest;
use App\Modules\Leave\Requests\UpdateHolidayRequest;

class HolidayController extends Controller
{
    public function store(StoreHolidayRequest $request)
    {
        $this->authorize('leave.settings.manage');

        Holiday::create($request->validated());

        return redirect()->back()->with('success', 'Holiday added successfully.');
    }

    public function update(UpdateHolidayRequest $request, Holiday $holiday)
    {
        $this->authorize('leave.settings.manage');

        $holiday->update($request->validated());

        return redirect()->back()->with('success', 'Holiday updated successfully.');
    }

    public function destroy(Holiday $holiday)
    {
        $this->authorize('leave.settings.manage');

        $holiday->delete();

        return redirect()->back()->with('success', 'Holiday deleted successfully.');
    }
}
