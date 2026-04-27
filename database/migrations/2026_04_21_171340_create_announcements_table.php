<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('announcements', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('content');
            $table->foreignId('posted_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();
            $table->string('status')->default('draft'); // draft, published
            $table->string('priority')->default('normal'); // low, normal, high
            $table->timestamp('published_at')->nullable();
            $table->string('target_type')->default('all'); // all, department, position, user
            $table->unsignedBigInteger('target_id')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('announcements');
    }
};
