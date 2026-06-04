<?php

use Illuminate\Contracts\Encryption\DecryptException;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::table('users')->whereNotNull('lbp_account_number')->orderBy('id')->chunk(100, function ($users) {
            foreach ($users as $user) {
                // Check if it's already an encrypted payload to avoid double encryption
                $payload = json_decode(base64_decode($user->lbp_account_number), true);
                if ($payload && isset($payload['iv'], $payload['value'], $payload['mac'])) {
                    continue; // Already encrypted
                }

                DB::table('users')
                    ->where('id', $user->id)
                    ->update(['lbp_account_number' => Crypt::encryptString($user->lbp_account_number)]);
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('users')->whereNotNull('lbp_account_number')->orderBy('id')->chunk(100, function ($users) {
            foreach ($users as $user) {
                try {
                    $decrypted = Crypt::decryptString($user->lbp_account_number);
                    DB::table('users')
                        ->where('id', $user->id)
                        ->update(['lbp_account_number' => $decrypted]);
                } catch (DecryptException $e) {
                    // Not encrypted or invalid payload, skip
                }
            }
        });
    }
};
