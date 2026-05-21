<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('attendances', function (Blueprint $table) {
            $table->timestamp('am_clock_in')->nullable();
            $table->timestamp('am_clock_out')->nullable();
            $table->timestamp('pm_clock_in')->nullable();
            $table->timestamp('pm_clock_out')->nullable();
        });

        // Migrate existing data
        DB::table('attendances')->orderBy('id')->chunk(100, function ($rows) {
            foreach ($rows as $row) {
                if (empty($row->clock_in)) {
                    continue;
                }

                $clockIn = Carbon::parse($row->clock_in);
                $clockOut = $row->clock_out ? Carbon::parse($row->clock_out) : null;
                $dateStr = $row->date;

                $amIn = null;
                $amOut = null;
                $pmIn = null;
                $pmOut = null;

                if ($clockIn->format('H') >= 12) {
                    $pmIn = $clockIn;
                    $pmOut = $clockOut;
                } else {
                    $amIn = $clockIn;
                    if ($clockOut) {
                        if ($clockOut->format('H') <= 12) {
                            $amOut = $clockOut;
                        } else {
                            $amOut = Carbon::parse("{$dateStr} 12:00:00");
                            $pmIn = Carbon::parse("{$dateStr} 13:00:00");
                            $pmOut = $clockOut;
                        }
                    }
                }

                DB::table('attendances')->where('id', $row->id)->update([
                    'am_clock_in' => $amIn,
                    'am_clock_out' => $amOut,
                    'pm_clock_in' => $pmIn,
                    'pm_clock_out' => $pmOut,
                ]);
            }
        });

        Schema::table('attendances', function (Blueprint $table) {
            $table->dropColumn(['clock_in', 'clock_out']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('attendances', function (Blueprint $table) {
            $table->timestamp('clock_in')->nullable();
            $table->timestamp('clock_out')->nullable();
        });

        // Migrate data back
        DB::table('attendances')->orderBy('id')->chunk(100, function ($rows) {
            foreach ($rows as $row) {
                $clockIn = $row->am_clock_in ?? $row->pm_clock_in;
                $clockOut = $row->pm_clock_out ?? $row->am_clock_out;

                DB::table('attendances')->where('id', $row->id)->update([
                    'clock_in' => $clockIn,
                    'clock_out' => $clockOut,
                ]);
            }
        });

        Schema::table('attendances', function (Blueprint $table) {
            $table->dropColumn(['am_clock_in', 'am_clock_out', 'pm_clock_in', 'pm_clock_out']);
        });
    }
};
