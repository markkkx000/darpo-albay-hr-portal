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
        Schema::table('leave_requests', function (Blueprint $table) {
            $table->dropColumn([
                'vl_balance_at_filing',
                'sl_balance_at_filing',
            ]);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('leave_requests', function (Blueprint $table) {
            $table->decimal('vl_balance_at_filing', 8, 3)->nullable()->after('leave_detail_remarks');
            $table->decimal('sl_balance_at_filing', 8, 3)->nullable()->after('vl_balance_at_filing');
        });
    }
};
