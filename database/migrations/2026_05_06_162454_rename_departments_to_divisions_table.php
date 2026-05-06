<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::rename('departments', 'divisions');
    }

    public function down(): void
    {
        Schema::rename('divisions', 'departments');
    }
};
