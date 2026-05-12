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
        Schema::table('tardiness_records', function (Blueprint $table) {
            $table->dropColumn(['tardiness_minutes', 'undertime_minutes']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tardiness_records', function (Blueprint $table) {
            $table->integer('tardiness_minutes')->default(0)->after('tardiness_count');
            $table->integer('undertime_minutes')->default(0)->after('undertime_count');
        });
    }
};
