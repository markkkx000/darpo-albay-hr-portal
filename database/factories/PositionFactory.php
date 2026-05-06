<?php

namespace Database\Factories;

use App\Modules\Personnel\Models\Division;
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
            'division_id' => Division::factory(),
            'is_active' => true,
        ];
    }
}
