<?php

namespace Database\Factories;

use App\Models\User;
use App\Modules\Announcements\Models\Announcement;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Announcement>
 */
class AnnouncementFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Announcement::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'title' => $this->faker->sentence(),
            'content' => $this->faker->paragraphs(3, true),
            'posted_by' => User::factory(),
            'status' => 'draft',
            'priority' => 'normal',
            'target_type' => 'all',
            'target_id' => null,
            'published_at' => null,
        ];
    }
}
