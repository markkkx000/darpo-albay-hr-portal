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
            $table->text('monthly_salary')->nullable()->change();
            $table->text('tin_number')->nullable()->change();
            $table->text('gsis_bp_number')->nullable()->change();
            $table->text('philhealth')->nullable()->change();
            $table->text('hdmf_pagibig_no')->nullable()->change();
            $table->text('prc_id_no')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->decimal('monthly_salary', 10, 2)->nullable()->change();
            $table->string('tin_number', 50)->nullable()->change();
            $table->string('gsis_bp_number', 50)->nullable()->change();
            $table->string('philhealth', 50)->nullable()->change();
            $table->string('hdmf_pagibig_no', 50)->nullable()->change();
            $table->string('prc_id_no', 50)->nullable()->change();
        });
    }
};
