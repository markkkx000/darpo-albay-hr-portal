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
        Schema::table('users', function (Blueprint $table) {
            $table->unsignedInteger('salary_grade')->nullable()->after('func_activity_code');
            $table->unsignedInteger('salary_step')->nullable()->after('salary_grade');
            $table->decimal('monthly_salary', 12, 2)->nullable()->after('salary_step');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['salary_grade', 'salary_step', 'monthly_salary']);
        });
    }
};
