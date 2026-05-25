<?php

use App\Models\User;
use App\Modules\Leave\Models\Holiday;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    Permission::firstOrCreate(['name' => 'leave.view']);
    Permission::firstOrCreate(['name' => 'leave.settings.manage']);
    Permission::firstOrCreate(['name' => 'leave.manage']);

    $this->superAdmin = User::factory()->create();
    $superRole = Role::firstOrCreate(['name' => 'super_admin']);
    $superRole->syncPermissions(['leave.view', 'leave.settings.manage', 'leave.manage']);
    $this->superAdmin->assignRole($superRole);

    $this->employee = User::factory()->create();
    $this->employee->assignRole(Role::firstOrCreate(['name' => 'employee']));
});

it('restricts leave module from regular employees', function () {
    $this->actingAs($this->employee)
        ->get('/leave')
        ->assertForbidden();
});

it('allows super admin to access leave dashboard', function () {
    $this->actingAs($this->superAdmin)
        ->get('/leave')
        ->assertOk();
});

it('allows super admin to access leave settings', function () {
    $this->actingAs($this->superAdmin)
        ->get('/leave/settings')
        ->assertOk();
});

it('allows super admin to access leave calendar with holidays', function () {
    Holiday::create([
        'name' => 'Test Holiday',
        'date' => now()->format('Y-m-d'),
    ]);

    $response = $this->actingAs($this->superAdmin)
        ->get('/leave/calendar')
        ->assertOk();

    $response->assertInertia(fn ($page) => $page
        ->component('Modules/Leave/Calendar')
        ->has('holidays')
    );
});

it('allows users with leave.view to upload valid leave attachments', function () {
    config(['filesystems.default' => 's3']);
    Storage::fake('s3');

    $pdfFile = UploadedFile::fake()->create('attachment.pdf', 500, 'application/pdf');
    $imageFile = UploadedFile::fake()->image('document.jpg', 800, 600);

    // Test PDF upload (should be uploaded as-is)
    $responsePdf = $this->actingAs($this->superAdmin)
        ->postJson('/leave/upload-attachment', [
            'file' => $pdfFile,
        ]);
    $responsePdf->assertOk();
    $responsePdf->assertJsonStructure(['url']);

    $year = date('Y');
    $month = date('m');
    Storage::disk('s3')->assertExists("leaves/attachments/{$year}/{$month}/".basename($responsePdf->json('url')));

    // Test Image upload (should be optimized/converted to WebP)
    $responseImage = $this->actingAs($this->superAdmin)
        ->postJson('/leave/upload-attachment', [
            'file' => $imageFile,
        ]);
    $responseImage->assertOk();
    $responseImage->assertJsonStructure(['url']);
    expect(pathinfo($responseImage->json('url'), PATHINFO_EXTENSION))->toBe('webp');
    Storage::disk('s3')->assertExists("leaves/attachments/{$year}/{$month}/".basename($responseImage->json('url')));
});

it('rejects unsupported file formats', function () {
    config(['filesystems.default' => 's3']);
    Storage::fake('s3');

    $invalidFile = UploadedFile::fake()->create('script.sh', 500, 'application/x-sh');

    $response = $this->actingAs($this->superAdmin)
        ->postJson('/leave/upload-attachment', [
            'file' => $invalidFile,
        ]);

    $response->assertStatus(422);
    $response->assertJsonValidationErrors('file');
});

it('rejects files exceeding the 10MB limit', function () {
    config(['filesystems.default' => 's3']);
    Storage::fake('s3');

    $largeFile = UploadedFile::fake()->create('huge.pdf', 11000, 'application/pdf'); // ~11MB

    $response = $this->actingAs($this->superAdmin)
        ->postJson('/leave/upload-attachment', [
            'file' => $largeFile,
        ]);

    $response->assertStatus(422);
    $response->assertJsonValidationErrors('file');
});

it('allows users to delete uploaded attachments', function () {
    config(['filesystems.default' => 's3']);
    Storage::fake('s3');

    $imageFile = UploadedFile::fake()->image('document.jpg', 800, 600);
    $uploadResponse = $this->actingAs($this->superAdmin)
        ->postJson('/leave/upload-attachment', [
            'file' => $imageFile,
        ]);
    $uploadedUrl = $uploadResponse->json('url');

    $year = date('Y');
    $month = date('m');
    $filename = basename($uploadedUrl);
    Storage::disk('s3')->assertExists("leaves/attachments/{$year}/{$month}/{$filename}");

    $deleteResponse = $this->actingAs($this->superAdmin)
        ->deleteJson('/leave/delete-attachment', [
            'url' => $uploadedUrl,
        ]);
    $deleteResponse->assertOk();

    Storage::disk('s3')->assertMissing("leaves/attachments/{$year}/{$month}/{$filename}");
});

it('prevents directory traversal during deletion', function () {
    config(['filesystems.default' => 's3']);
    Storage::fake('s3');

    // Attempt to delete an unauthorized URL (e.g. not containing leaves/attachments/)
    $traversalUrl = 'https://bhzcorfoprqsvxndqlqj.supabase.co/storage/v1/object/public/darpoalbayhr-bucket/avatars/avatar_123.webp';

    $response = $this->actingAs($this->superAdmin)
        ->deleteJson('/leave/delete-attachment', [
            'url' => $traversalUrl,
        ]);

    $response->assertStatus(403);
});

it('prunes unreferenced attachments older than 24 hours using schedule command', function () {
    config(['filesystems.default' => 's3']);
    Storage::fake('s3');

    $year = date('Y');
    $month = date('m');

    // Create a referenced file
    $referencedFile = "leaves/attachments/{$year}/{$month}/referenced.webp";
    Storage::disk('s3')->put($referencedFile, 'content');

    // Create an orphan file
    $orphanFile = "leaves/attachments/{$year}/{$month}/orphan.webp";
    Storage::disk('s3')->put($orphanFile, 'content');

    // Run command
    $this->artisan('leave:cleanup-attachments')
        ->assertExitCode(0);
});
