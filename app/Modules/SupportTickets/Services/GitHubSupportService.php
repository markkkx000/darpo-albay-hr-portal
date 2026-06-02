<?php

namespace App\Modules\SupportTickets\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GitHubSupportService
{
    protected string $token;

    protected string $repo;

    public function __construct()
    {
        $this->token = config('services.github.token');
        $this->repo = config('services.github.repo');
    }

    /**
     * Create a new issue on GitHub.
     *
     * @return array|null The issue data, or null on failure.
     */
    public function createIssue(string $title, string $body, array $labels = []): ?array
    {
        if (empty($this->token) || empty($this->repo)) {
            Log::error('GitHub Support Service: Missing token or repo configuration.');

            return null;
        }

        $response = Http::withToken($this->token)
            ->withHeaders([
                'Accept' => 'application/vnd.github.v3+json',
                'X-GitHub-Api-Version' => '2022-11-28',
            ])
            ->post("https://api.github.com/repos/{$this->repo}/issues", [
                'title' => $title,
                'body' => $body,
                'labels' => $labels,
            ]);

        if ($response->successful()) {
            return $response->json();
        }

        Log::error('GitHub issue creation failed', [
            'status' => $response->status(),
            'response' => $response->json(),
        ]);

        return null;
    }

    /**
     * Post a comment to an existing issue.
     */
    public function postComment(string $issueNumber, string $body): ?array
    {
        if (empty($this->token) || empty($this->repo)) {
            return null;
        }

        $response = Http::withToken($this->token)
            ->withHeaders([
                'Accept' => 'application/vnd.github.v3+json',
                'X-GitHub-Api-Version' => '2022-11-28',
            ])
            ->post("https://api.github.com/repos/{$this->repo}/issues/{$issueNumber}/comments", [
                'body' => $body,
            ]);

        if ($response->successful()) {
            return $response->json();
        }

        return null;
    }

    /**
     * Get comments for a specific issue.
     */
    public function getComments(string $issueNumber): array
    {
        if (empty($this->token) || empty($this->repo)) {
            return [];
        }

        $response = Http::withToken($this->token)
            ->withHeaders([
                'Accept' => 'application/vnd.github.v3+json',
                'X-GitHub-Api-Version' => '2022-11-28',
            ])
            ->get("https://api.github.com/repos/{$this->repo}/issues/{$issueNumber}/comments");

        if ($response->successful()) {
            return $response->json();
        }

        return [];
    }

    /**
     * Get details for a specific issue.
     */
    public function getIssue(string $issueNumber): ?array
    {
        if (empty($this->token) || empty($this->repo)) {
            return null;
        }

        $response = Http::withToken($this->token)
            ->withHeaders([
                'Accept' => 'application/vnd.github.v3+json',
                'X-GitHub-Api-Version' => '2022-11-28',
            ])
            ->get("https://api.github.com/repos/{$this->repo}/issues/{$issueNumber}");

        if ($response->successful()) {
            return $response->json();
        }

        return null;
    }

    /**
     * Check if an issue exists on GitHub.
     *
     * @return bool|null Returns true if it exists, false if it's 404, or null if there's an API error.
     */
    public function issueExists(string $issueNumber): ?bool
    {
        if (empty($this->token) || empty($this->repo)) {
            return null;
        }

        $response = Http::withToken($this->token)
            ->withHeaders([
                'Accept' => 'application/vnd.github.v3+json',
                'X-GitHub-Api-Version' => '2022-11-28',
            ])
            ->get("https://api.github.com/repos/{$this->repo}/issues/{$issueNumber}");

        if ($response->successful()) {
            return true;
        }

        if ($response->status() === 404 || $response->status() === 410) {
            return false;
        }

        return null;
    }
}
