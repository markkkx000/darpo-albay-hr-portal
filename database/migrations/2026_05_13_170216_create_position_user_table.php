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
        Schema::create('position_user', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('position_id')->constrained()->cascadeOnDelete();
            $table->boolean('is_primary')->default(false);
            $table->timestamps();
        });

        // Migrate existing data
        \Illuminate\Support\Facades\DB::statement('
            INSERT INTO position_user (user_id, position_id, is_primary, created_at, updated_at)
            SELECT id, position_id, true, NOW(), NOW()
            FROM users
            WHERE position_id IS NOT NULL
        ');

        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['position_id']);
            $table->dropColumn('position_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->unsignedBigInteger('position_id')->nullable()->after('password');
            $table->foreign('position_id')->references('id')->on('positions')->onDelete('set null');
        });

        // Migrate data back (only primary positions)
        \Illuminate\Support\Facades\DB::statement('
            UPDATE users
            SET position_id = (
                SELECT position_id
                FROM position_user
                WHERE position_user.user_id = users.id
                AND position_user.is_primary = true
                LIMIT 1
            )
        ');

        Schema::dropIfExists('position_user');
    }
};
