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
        // 1. Rename table first
        Schema::rename('employment_statuses', 'appointment_statuses');

        Schema::table('users', function (Blueprint $table) {
            // 2. Drop the old foreign key constraint
            $table->dropForeign(['employment_status_id']);

            // 3. Rename the column
            $table->renameColumn('employment_status_id', 'appointment_status_id');
        });

        Schema::table('users', function (Blueprint $table) {
            // 4. Add the new foreign key constraint
            $table->foreign('appointment_status_id')
                ->references('id')
                ->on('appointment_statuses')
                ->onDelete('set null');

            // 5. Add the 11 new fields
            $table->date('date_of_separation')->nullable();
            $table->date('date_hired_government')->nullable();
            $table->text('present_address')->nullable();
            $table->string('civil_status')->nullable();
            $table->string('fund_code')->nullable();
            $table->string('func_activity_code')->nullable();
            $table->string('item_number')->nullable();
            $table->string('office_per_appointment')->nullable();
            $table->string('plantilla_position')->nullable();
            $table->string('lbp_account_number')->nullable();
            $table->string('profile_picture')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // 1. Drop foreign key
            $table->dropForeign(['appointment_status_id']);

            // 2. Drop all new fields
            $table->dropColumn([
                'date_of_separation',
                'date_hired_government',
                'present_address',
                'civil_status',
                'fund_code',
                'func_activity_code',
                'item_number',
                'office_per_appointment',
                'plantilla_position',
                'lbp_account_number',
                'profile_picture',
            ]);

            // 3. Rename column back
            $table->renameColumn('appointment_status_id', 'employment_status_id');
        });

        // 4. Rename table back BEFORE adding foreign key referencing it
        Schema::rename('appointment_statuses', 'employment_statuses');

        Schema::table('users', function (Blueprint $table) {
            // 5. Restore foreign key referencing the old table name
            $table->foreign('employment_status_id')
                ->references('id')
                ->on('employment_statuses')
                ->onDelete('set null');
        });
    }
};
