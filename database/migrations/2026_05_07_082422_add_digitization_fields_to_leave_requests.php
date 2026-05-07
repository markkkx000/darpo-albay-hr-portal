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
            $table->decimal('salary', 12, 2)->after('id')->nullable();
            $table->date('date_filed')->after('salary')->nullable();
            $table->string('pay_status')->default('with_pay')->after('days_requested');
            $table->string('approved_by_official')->nullable()->after('approved_by_id');
            $table->string('leave_detail_type')->nullable()->after('leave_details');
            $table->text('leave_detail_remarks')->nullable()->after('leave_detail_type');
            $table->decimal('vl_balance_at_filing', 8, 3)->nullable()->after('leave_detail_remarks');
            $table->decimal('sl_balance_at_filing', 8, 3)->nullable()->after('vl_balance_at_filing');
            $table->boolean('has_attachments')->default(false)->after('sl_balance_at_filing');
            $table->json('supporting_documents')->nullable()->after('has_attachments');
            $table->string('maternity_allocation_details')->nullable()->after('supporting_documents');
            $table->renameColumn('attachment_path', 'attachment_url');
        });

        // Data Migration: Split leave_details into leave_detail_type and leave_detail_remarks
        DB::table('leave_requests')->get()->each(function ($request) {
            if ($request->leave_details && str_contains($request->leave_details, ': ')) {
                [$type, $remarks] = explode(': ', $request->leave_details, 2);
                DB::table('leave_requests')
                    ->where('id', $request->id)
                    ->update([
                        'leave_detail_type' => $type,
                        'leave_detail_remarks' => $remarks,
                    ]);
            } else {
                DB::table('leave_requests')
                    ->where('id', $request->id)
                    ->update([
                        'leave_detail_type' => $request->leave_details,
                    ]);
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('leave_requests', function (Blueprint $table) {
            $table->renameColumn('attachment_url', 'attachment_path');
            $table->dropColumn([
                'salary',
                'date_filed',
                'pay_status',
                'approved_by_official',
                'leave_detail_type',
                'leave_detail_remarks',
                'vl_balance_at_filing',
                'sl_balance_at_filing',
                'has_attachments',
                'supporting_documents',
                'maternity_allocation_details',
            ]);
        });
    }
};
