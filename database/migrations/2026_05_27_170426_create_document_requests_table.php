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
        Schema::create('document_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('requested_by')->constrained('users')->cascadeOnDelete();
            $table->json('requests'); // e.g. ['Service Record', 'Pay Slip']
            $table->text('purpose')->nullable();
            $table->string('specify_remittance')->nullable();
            $table->string('specify_documents')->nullable();
            $table->string('specify_other')->nullable();
            $table->string('status')->default('Pending'); // Pending, Received, Ready for Pickup, Released/Sent, Rejected, Cancelled
            $table->foreignId('received_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('released_to')->nullable();
            $table->timestamp('released_at')->nullable();
            $table->boolean('is_electronic')->default(false);
            $table->json('files')->nullable(); // For soft copies
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('document_requests');
    }
};
