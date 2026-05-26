<?php

use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::unprepared("
            DO $$
            BEGIN
                IF EXISTS (
                    SELECT 1
                    FROM pg_proc p
                    JOIN pg_namespace n ON n.oid = p.pronamespace
                    WHERE p.proname = 'rls_auto_enable'
                      AND n.nspname = 'public'
                ) THEN
                    EXECUTE 'REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM anon, public';
                END IF;
            END $$;
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::unprepared("
            DO $$
            BEGIN
                IF EXISTS (
                    SELECT 1
                    FROM pg_proc p
                    JOIN pg_namespace n ON n.oid = p.pronamespace
                    WHERE p.proname = 'rls_auto_enable'
                      AND n.nspname = 'public'
                ) THEN
                    EXECUTE 'GRANT EXECUTE ON FUNCTION public.rls_auto_enable() TO anon, public';
                END IF;
            END $$;
        ");
    }
};
