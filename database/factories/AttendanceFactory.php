<?php

namespace Database\Factories;

use App\Models\User;
use App\Modules\Attendance\Models\Attendance;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Attendance>
 */
class AttendanceFactory extends Factory
{
    protected $model = Attendance::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'date' => now()->toDateString(),
            'am_clock_in' => now(),
            'am_clock_out' => null,
            'pm_clock_in' => null,
            'pm_clock_out' => null,
        ];
    }
}
