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
            $table->unsignedBigInteger('position_id')->nullable()->after('password');
            $table->unsignedBigInteger('department_id')->nullable()->after('position_id');
            $table->unsignedBigInteger('employment_status_id')->nullable()->after('department_id');
            $table->date('hire_date')->nullable()->after('employment_status_id');
            $table->string('contact_number')->nullable()->after('hire_date');
            $table->text('address')->nullable()->after('contact_number');

            $table->foreign('position_id')->references('id')->on('positions')->onDelete('set null');
            $table->foreign('department_id')->references('id')->on('departments')->onDelete('set null');
            $table->foreign('employment_status_id')->references('id')->on('employment_statuses')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['position_id']);
            $table->dropForeign(['department_id']);
            $table->dropForeign(['employment_status_id']);

            $table->dropColumn([
                'position_id',
                'department_id',
                'employment_status_id',
                'hire_date',
                'contact_number',
                'address',
            ]);
        });
    }
};
