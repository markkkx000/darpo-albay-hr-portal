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
        Schema::table('positions', function (Blueprint $table) {
            $table->renameColumn('department_id', 'division_id');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->renameColumn('department_id', 'division_id');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->unsignedBigInteger('unit_id')->nullable();

            $table->string('sex')->nullable();
            $table->date('date_of_birth')->nullable();
            $table->integer('years_in_service')->nullable();
            $table->string('plantilla_number')->nullable();
            $table->string('gsis_bp_number')->nullable();
            $table->string('philhealth')->nullable();
            $table->string('hdmf_pagibig_no')->nullable();
            $table->string('tin_number')->nullable();
            $table->string('prc_id_no')->nullable();
            $table->date('prc_expiration')->nullable();
            $table->date('orig_date_of_appointment')->nullable();
            $table->date('date_of_latest_appointment')->nullable();
            $table->date('date_of_assumption')->nullable();

            $table->foreign('unit_id')->references('id')->on('units');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['unit_id']);
            $table->dropColumn([
                'unit_id', 'sex', 'date_of_birth', 'years_in_service',
                'plantilla_number', 'gsis_bp_number', 'philhealth',
                'hdmf_pagibig_no', 'tin_number', 'prc_id_no', 'prc_expiration',
                'orig_date_of_appointment', 'date_of_latest_appointment', 'date_of_assumption',
            ]);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->renameColumn('division_id', 'department_id');
        });

        Schema::table('positions', function (Blueprint $table) {
            $table->renameColumn('division_id', 'department_id');
        });
    }
};
