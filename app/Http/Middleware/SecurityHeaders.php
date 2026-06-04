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

        $response->headers->set('X-Frame-Options', 'DENY');
        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');
        $response->headers->set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
        $response->headers->set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

        // CSP: Secure defaults with nonce for dynamic scripts/styles
        if (app()->isProduction()) {
            $nonce = Vite::cspNonce();

            $response->headers->set('Content-Security-Policy',
                "default-src 'self'; ".
                "script-src 'self' 'nonce-{$nonce}' 'strict-dynamic'; ".
                "style-src 'self' 'unsafe-inline'; ". // Many UI libraries (Tiptap, etc) require inline styles
                "img-src 'self' data: blob: https:; ". // allow external images
                "font-src 'self' data:; ".
                "connect-src 'self'; ".
                "frame-ancestors 'none';"
            );
        }

        return $response;
    }
}
