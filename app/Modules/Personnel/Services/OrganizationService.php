<?php

namespace App\Modules\Personnel\Services;

use App\Modules\Personnel\Models\Division;
use App\Modules\Personnel\Models\Position;
use App\Modules\Personnel\Models\Unit;
use Illuminate\Database\Eloquent\Collection;

class OrganizationService
{
    /**
     * Get all divisions with their units and positions.
     */
    public function getOrganizationData(): Collection
    {
        return Division::with(['units', 'positions'])->get();
    }

    /**
     * Create a new division.
     */
    public function createDivision(array $data): Division
    {
        return Division::create($data);
    }

    /**
     * Update an existing division.
     */
    public function updateDivision(Division $division, array $data): Division
    {
        $division->update($data);

        return $division;
    }

    /**
     * Create a new unit.
     */
    public function createUnit(array $data): Unit
    {
        return Unit::create($data);
    }

    /**
     * Update an existing unit.
     */
    public function updateUnit(Unit $unit, array $data): Unit
    {
        $unit->update($data);

        return $unit;
    }

    /**
     * Create a new position.
     */
    public function createPosition(array $data): Position
    {
        return Position::create($data);
    }

    /**
     * Update an existing position.
     */
    public function updatePosition(Position $position, array $data): Position
    {
        $position->update($data);

        return $position;
    }
}
