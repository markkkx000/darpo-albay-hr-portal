<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Vite;
use Symfony\Component\HttpFoundation\Response;

class SecurityHeaders
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // The following headers are handled by Laravel Cloud Edge Network Settings:
        // X-Frame-Options, X-Content-Type-Options, Strict-Transport-Security

        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');
        $response->headers->set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

        // CSP: Secure defaults with nonce for dynamic scripts/styles
        if (app()->isProduction()) {
            $nonce = Vite::cspNonce();

            $response->headers->set('Content-Security-Policy',
                "default-src 'self'; ".
                "script-src 'self' 'nonce-{$nonce}' 'strict-dynamic'; ".
                "style-src 'self' 'unsafe-inline' https://fonts.bunny.net https://fonts.googleapis.com; ". // allow external fonts and UI libraries
                "img-src 'self' data: blob: https:; ". // allow external images
                "font-src 'self' data: https://fonts.bunny.net https://fonts.gstatic.com; ".
                "connect-src 'self'; ".
                "frame-ancestors 'none';"
            );
        }

        return $response;
    }
}
