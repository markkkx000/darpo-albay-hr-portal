<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('leave_requests', function (Blueprint $table) {
            $table->decimal('days_with_pay', 8, 2)->default(0)->after('days_requested');
            $table->decimal('days_without_pay', 8, 2)->default(0)->after('days_with_pay');
            $table->string('others_pay_remarks')->nullable()->after('days_without_pay');
        });

        // Migrate existing data
        DB::table('leave_requests')->get()->each(function ($request) {
            $update = [
                'days_with_pay' => 0,
                'days_without_pay' => 0,
            ];

            if ($request->pay_status === 'with_pay') {
                $update['days_with_pay'] = $request->days_requested;
            } elseif ($request->pay_status === 'without_pay') {
                $update['days_without_pay'] = $request->days_requested;
            }

            DB::table('leave_requests')->where('id', $request->id)->update($update);
        });

        Schema::table('leave_requests', function (Blueprint $table) {
            $table->dropColumn('pay_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('leave_requests', function (Blueprint $table) {
            $table->string('pay_status')->default('with_pay')->after('days_requested');
        });

        // Restore data
        DB::table('leave_requests')->get()->each(function ($request) {
            $status = 'with_pay';
            if ($request->days_without_pay > 0 && $request->days_with_pay == 0) {
                $status = 'without_pay';
            }

            DB::table('leave_requests')->where('id', $request->id)->update(['pay_status' => $status]);
        });

        Schema::table('leave_requests', function (Blueprint $table) {
            $table->dropColumn(['days_with_pay', 'days_without_pay', 'others_pay_remarks']);
        });
    }
};
