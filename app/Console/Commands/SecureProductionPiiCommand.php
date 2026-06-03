<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;

class SecureProductionPiiCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:secure-production-pii';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Encrypt existing plaintext PII in production and truncate the activity log.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting PII encryption process...');

        $fields = ['monthly_salary', 'tin_number', 'gsis_bp_number', 'philhealth', 'hdmf_pagibig_no', 'prc_id_no'];
        $encryptedCount = 0;

        DB::table('users')->orderBy('id')->chunk(100, function ($users) use ($fields, &$encryptedCount) {
            foreach ($users as $user) {
                $update = [];
                foreach ($fields as $field) {
                    $value = $user->$field;
                    // Check if not empty and NOT already a Laravel encrypted payload (which starts with 'eyJ')
                    if (! empty($value) && ! str_starts_with($value, 'eyJ')) {
                        $update[$field] = Crypt::encryptString($value);
                    }
                }
                if (! empty($update)) {
                    DB::table('users')->where('id', $user->id)->update($update);
                    $encryptedCount++;
                }
            }
        });

        $this->info("Successfully encrypted PII for {$encryptedCount} users.");

        $this->info('Truncating activity_log table...');
        DB::table('activity_log')->truncate();
        $this->info('Activity log truncated successfully.');

        $this->info('All secure tasks completed successfully! You can now safely delete this command.');
    }
}
