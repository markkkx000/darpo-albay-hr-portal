<?php

namespace Database\Factories;

use App\Modules\Personnel\Models\AppointmentStatus;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<AppointmentStatus>
 */
class AppointmentStatusFactory extends Factory
{
    protected $model = AppointmentStatus::class;

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
