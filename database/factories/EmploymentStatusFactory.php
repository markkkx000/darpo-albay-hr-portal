<?php

namespace Database\Factories;

use App\Modules\Personnel\Models\EmploymentStatus;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<EmploymentStatus>
 */
class EmploymentStatusFactory extends Factory
{
    protected $model = EmploymentStatus::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->unique()->word(),
            'is_active' => true,
        ];
    }
}
