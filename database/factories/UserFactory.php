<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends Factory<User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'employee_number' => fake()->unique()->numerify('##########'),
            'first_name' => fake()->firstName(),
            'middle_name' => fake()->firstName(),
            'last_name' => fake()->lastName(),
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('password'),
            'is_active' => true,
            'remember_token' => Str::random(10),
            'division_id' => null,
            'unit_id' => null,
            'appointment_status_id' => null,
            'hire_date' => fake()->date(),
            'sex' => fake()->randomElement(['Male', 'Female']),
            'date_of_birth' => fake()->date('Y-m-d', '-20 years'),
            'contact_number' => fake()->phoneNumber(),
            'address' => fake()->address(),
            'salary_grade' => fake()->numberBetween(1, 33),
            'salary_step' => fake()->numberBetween(1, 8),
            'monthly_salary' => fake()->randomFloat(2, 15000, 150000),
        ];
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }
}
