<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Faker\Factory as Faker;
use Illuminate\Support\Facades\Hash;
use Spatie\Activitylog\Models\Activity;

class AnonymizeDatabaseCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:anonymize-data {--force : Force anonymization without confirmation}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Anonymizes sensitive PII data in the database for non-production environments.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        if (app()->environment('production')) {
            $this->error('Data anonymization cannot be run in a production environment!');
            return self::FAILURE;
        }

        if (!$this->option('force') && !$this->confirm('This will IRREVERSIBLY overwrite user PII in this environment with fake data. Are you sure?')) {
            $this->info('Anonymization cancelled.');
            return self::SUCCESS;
        }

        $this->info('Starting database anonymization...');
        $faker = Faker::create();
        
        $users = User::all();
        $bar = $this->output->createProgressBar($users->count());

        $bar->start();

        DB::beginTransaction();

        try {
            foreach ($users as $user) {
                // Determine sex for fake name generation if available
                $gender = strtolower($user->sex ?? '') === 'female' ? 'female' : 'male';
                
                $user->first_name = $faker->firstName($gender);
                $user->last_name = $faker->lastName();
                $user->middle_name = $faker->optional(0.7)->lastName();
                
                $user->email = "user_{$user->id}@example.com";
                $user->contact_number = $faker->numerify('09#########');
                $user->address = $faker->address();
                $user->present_address = $faker->address();
                $user->date_of_birth = $faker->dateTimeBetween('-60 years', '-20 years')->format('Y-m-d');
                $user->employee_number = 'EMP-' . str_pad((string)$user->id, 4, '0', STR_PAD_LEFT);
                
                // Anonymize encrypted fields
                $user->gsis_bp_number = $faker->numerify('##########');
                $user->philhealth = $faker->numerify('##-#########-#');
                $user->hdmf_pagibig_no = $faker->numerify('####-####-####');
                $user->tin_number = $faker->numerify('###-###-###');
                $user->prc_id_no = $faker->numerify('#######');
                $user->lbp_account_number = $faker->numerify('##########');
                
                // Anonymize passwords for easier local testing
                $user->password = Hash::make('password');
                
                // Clear profile picture
                $user->profile_picture = null;

                // Important: Disable model events to prevent flooding the activity log 
                // and to prevent updating 'updated_at' unnecessarily, or save quietly.
                $user->saveQuietly();

                $bar->advance();
            }
            
            // Optionally clear activity log if it contains PII 
            // We just clear descriptions or old logs if necessary, 
            // but for a dev anonymization, truncating the activity log might be safest.
            Activity::truncate();

            DB::commit();
            $bar->finish();
            $this->newLine(2);
            $this->info('Database anonymization completed successfully.');
            $this->info('All passwords have been reset to "password".');
            $this->info('Activity log has been truncated to clear historical PII.');
            
            return self::SUCCESS;
        } catch (\Exception $e) {
            DB::rollBack();
            $this->error('An error occurred during anonymization: ' . $e->getMessage());
            return self::FAILURE;
        }
    }
}
