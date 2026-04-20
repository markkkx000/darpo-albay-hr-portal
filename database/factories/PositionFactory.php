<?php

namespace Database\Factories;

use App\Modules\Personnel\Models\Department;
use App\Modules\Personnel\Models\Position;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Position>
 */
class PositionFactory extends Factory
{
    protected $model = Position::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->jobTitle(),
            'department_id' => Department::factory(),
            'is_active' => true,
        ];
    }
}
