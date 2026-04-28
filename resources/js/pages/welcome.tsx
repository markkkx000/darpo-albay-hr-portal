import { Head, Link, usePage } from '@inertiajs/react';
import { CalendarCheck, Clock, ShieldCheck, Users2 } from 'lucide-react';
import AppLogoIcon from '@/components/app-logo-icon';
import { dashboard, login } from '@/routes';

export default function Welcome() {
    const { auth } = usePage().props;

    return (
        <>
            <Head title="DARPO Albay HR Portal — Smarter Workforce Management">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700"
                    rel="stylesheet"
                />
                <style>{`
                    /* ═══════════════════════════════════════════
                       Animated gradient blob background
                       Adapted from: codepen.io/wilvander/pen/KKQrGgP
                       Colours: Green → Yellow
                    ═══════════════════════════════════════════ */

                    .welcome-bg {
                        position: fixed;
                        inset: 0;
                        background-color: #030f04;
                        overflow: hidden;
                        z-index: 0;
                    }

                    .blob {
                        --size: 350px;
                        --speed: 40s;
                        --easing: cubic-bezier(0.8, 0.2, 0.2, 0.8);
                        position: absolute;
                        top: 50%;
                        left: 50%;
                        translate: -50% -50%;
                        width: var(--size);
                        height: var(--size);
                        filter: blur(calc(var(--size) / 5));
                        background-image: linear-gradient(
                            hsl(142, 85%, 45%),
                            hsl(52, 100%, 55%)
                        );
                        border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;
                        will-change: transform;
                        opacity: 0.4;
                    }

                    .blob-offset-1 {
                        position: absolute;
                        top: 15%;
                        left: 75%;
                        width: 300px;
                        height: 300px;
                        filter: blur(80px);
                        background-image: linear-gradient(hsl(52, 100%, 55%), hsl(142, 70%, 40%));
                        border-radius: 50% 30% 70% 40% / 40% 60% 30% 60%;
                        opacity: 0.2;
                    }

                    .blob-offset-2 {
                        position: absolute;
                        top: 70%;
                        left: 10%;
                        width: 260px;
                        height: 260px;
                        filter: blur(70px);
                        background-image: linear-gradient(hsl(142, 85%, 45%), hsl(180, 60%, 40%));
                        border-radius: 40% 60% 30% 70% / 60% 40% 60% 30%;
                        opacity: 0.18;
                    }

                    @media (min-width: 1024px) {
                        .blob { 
                            --size: 650px; 
                            opacity: 0.6;
                        }
                        .blob-offset-1 { width: 420px; height: 420px; opacity: 0.25; }
                        .blob-offset-2 { width: 360px; height: 360px; opacity: 0.22; }
                    }

                    /* Grain noise overlay for premium texture */
                    .grain-overlay {
                        position: fixed;
                        inset: 0;
                        z-index: 1;
                        opacity: 0.04;
                        pointer-events: none;
                        background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E");
                        background-size: 200px 200px;
                    }

                    /* Glassmorphism card — dark-tinted */
                    .glass-card {
                        background: rgba(0, 0, 0, 0.42);
                        border: 1px solid rgba(255, 255, 255, 0.09);
                        backdrop-filter: blur(16px);
                        -webkit-backdrop-filter: blur(16px);
                        transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1),
                                    border-color 0.25s cubic-bezier(0.4, 0, 0.2, 1),
                                    box-shadow 0.25s cubic-bezier(0.4, 0, 0.2, 1);
                    }

                    /* Primary CTA button — Enhanced Shadow */
                    .btn-primary {
                        display: inline-flex;
                        align-items: center;
                        gap: 0.5rem;
                        padding: 0.875rem 2rem;
                        border-radius: 0.625rem;
                        font-weight: 600;
                        font-size: 1rem;
                        line-height: 1;
                        color: #030f04;
                        background: linear-gradient(135deg, hsl(142, 70%, 48%), hsl(52, 95%, 55%));
                        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                        box-shadow: 
                            0 10px 15px -3px rgba(0, 0, 0, 0.5), 
                            0 4px 6px -2px rgba(0, 0, 0, 0.3),
                            0 0 30px rgba(110, 210, 100, 0.4),
                            inset 0 1px 0 rgba(255, 255, 255, 0.2);
                        white-space: nowrap;
                    }

                    /* Nav button — solid dark, high contrast */
                    .btn-ghost {
                        display: inline-flex;
                        align-items: center;
                        gap: 0.5rem;
                        padding: 0.625rem 1.25rem;
                        border-radius: 0.5rem;
                        font-weight: 600;
                        font-size: 0.875rem;
                        line-height: 1;
                        color: #ffffff;
                        border: 1px solid rgba(255,255,255,0.15);
                        background: rgba(0, 0, 0, 0.55);
                        backdrop-filter: blur(8px);
                        -webkit-backdrop-filter: blur(8px);
                        transition: background 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
                        white-space: nowrap;
                        box-shadow: 0 2px 8px rgba(0,0,0,0.4);
                    }
                    .btn-ghost:hover {
                        background: rgba(0, 0, 0, 0.72);
                        border-color: rgba(255,255,255,0.28);
                        box-shadow: 0 4px 16px rgba(0,0,0,0.5);
                    }

                    /* Highlight text — Clean, high-contrast light green with sharp shadow */
                    .text-highlight {
                        color: #f0fdf4;
                        text-shadow: 
                            0 4px 12px rgba(0, 0, 0, 1),
                            0 0 40px rgba(0, 0, 0, 0.6);
                    }

                    /* Feature icon ring */
                    .icon-ring {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        width: 3rem;
                        height: 3rem;
                        border-radius: 0.875rem;
                        background: linear-gradient(135deg, rgba(110, 210, 100, 0.2), rgba(250, 220, 60, 0.2));
                        border: 1px solid rgba(110, 210, 100, 0.25);
                        flex-shrink: 0;
                    }

                    /* Text shadow for better readability on moving gradients */
                    .text-shadow-glow {
                        text-shadow: 
                            0 2px 10px rgba(0, 0, 0, 0.8), 
                            0 0 25px rgba(0, 0, 0, 0.4);
                    }

                    /* ── Motion-safe animations ── */
                    @media (prefers-reduced-motion: no-preference) {
                        @keyframes blob-rotate {
                            0%   { transform: rotate(0deg); }
                            100% { transform: rotate(360deg); }
                        }
                        @keyframes blob-float {
                            0%, 100% { transform: translateY(0px) scale(1); }
                            50%       { transform: translateY(-20px) scale(1.03); }
                        }
                        @keyframes fade-up {
                            from { opacity: 0; transform: translateY(24px); }
                            to   { opacity: 1; transform: translateY(0); }
                        }

                        .blob {
                            animation: blob-rotate var(--speed) var(--easing) alternate infinite;
                        }
                        .blob-offset-1 {
                            animation: blob-float 18s ease-in-out infinite;
                        }
                        .blob-offset-2 {
                            animation: blob-float 22s ease-in-out infinite reverse;
                        }
                        .animate-fade-up {
                            animation: fade-up 0.7s ease forwards;
                        }
                        .animate-fade-up-delay-1 {
                            opacity: 0;
                            animation: fade-up 0.7s ease 0.15s forwards;
                        }
                        .animate-fade-up-delay-2 {
                            opacity: 0;
                            animation: fade-up 0.7s ease 0.3s forwards;
                        }
                        .animate-fade-up-delay-3 {
                            opacity: 0;
                            animation: fade-up 0.7s ease 0.45s forwards;
                        }
                        .animate-fade-up-delay-4 {
                            opacity: 0;
                            animation: fade-up 0.7s ease 0.6s forwards;
                        }
                        .glass-card:hover {
                            transform: translateY(-6px);
                            border-color: rgba(74, 222, 128, 0.32);
                            box-shadow:
                                0 20px 60px rgba(0, 0, 0, 0.4),
                                0 0 30px rgba(74, 222, 128, 0.12),
                                inset 0 1px 0 rgba(255, 255, 255, 0.15);
                        }
                        .btn-primary:hover {
                            filter: brightness(1.1);
                            transform: translateY(-3px) scale(1.02);
                            box-shadow: 
                                0 25px 30px -5px rgba(0, 0, 0, 0.6), 
                                0 15px 15px -5px rgba(0, 0, 0, 0.4),
                                0 0 50px rgba(110, 210, 100, 0.6);
                        }
                        .btn-primary:active { transform: translateY(0); }
                    }

                    /* Non-animated fallback states */
                    .animate-fade-up,
                    .animate-fade-up-delay-1,
                    .animate-fade-up-delay-2,
                    .animate-fade-up-delay-3,
                    .animate-fade-up-delay-4 {
                        opacity: 1;
                    }
                `}</style>
            </Head>

            {/* ── Animated background ── */}
            <div className="welcome-bg" aria-hidden="true">
                <div className="blob" />
                <div className="blob-offset-1" />
                <div className="blob-offset-2" />
            </div>
            <div className="grain-overlay" aria-hidden="true" />

            {/* ── Page wrapper — sits above the background ── */}
            <div className="relative z-10 flex min-h-screen flex-col font-sans">

                {/* ── Navbar ── */}
                <header className="sticky top-0 z-50 border-b border-white/10 bg-black/20 backdrop-blur-md">
                    <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                        {/* Logo */}
                        <div className="flex items-center gap-2.5">
                            <AppLogoIcon className="h-10 w-10 shrink-0" />
                            <span className="text-sm font-semibold tracking-tight text-white shadow-black/40 drop-shadow-sm">
                                DARPO Albay
                                <span className="ml-1 text-white/70 font-normal">HR Portal</span>
                            </span>
                        </div>

                        {/* Nav CTA */}
                        <nav aria-label="Primary navigation">
                            {auth.user ? (
                                <Link href={dashboard()} className="btn-ghost text-sm">
                                    Go to Dashboard
                                </Link>
                            ) : (
                                <Link href={login()} className="btn-ghost text-sm">
                                    Sign In
                                </Link>
                            )}
                        </nav>
                    </div>
                </header>

                {/* ── Hero section ── */}
                <main className="flex flex-1 flex-col items-center justify-center px-6 py-16 sm:py-24 text-center lg:py-32" id="hero">
                    {/* Badge / pill */}
                    <div
                        className="animate-fade-up mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-white/70 backdrop-blur-sm"
                        aria-label="Province of Albay official HR system"
                    >
                        <span className="h-1.5 w-1.5 rounded-full bg-[hsl(142,70%,55%)]" aria-hidden="true" />
                        Province of Albay — Official HR System
                    </div>

                    {/* Headline */}
                    <h1 className="animate-fade-up-delay-1 text-shadow-glow mx-auto max-w-4xl text-3xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-7xl">
                        Smarter{' '}
                        <span className="text-highlight">Workforce</span>
                        {' '}Management
                    </h1>

                    {/* Subheadline */}
                    <p className="animate-fade-up-delay-2 text-shadow-glow mx-auto mt-6 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg">
                        A unified platform for attendance tracking, leave management, and personnel administration — designed for DARPO Albay's team.
                    </p>

                    {/* CTAs */}
                    <div className="animate-fade-up-delay-3 mt-10 flex flex-col items-center gap-3 sm:flex-row">
                        {auth.user ? (
                            <Link href={dashboard()} className="btn-primary" id="cta-dashboard">
                                Open Dashboard
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                    <path d="M5 12h14M12 5l7 7-7 7" />
                                </svg>
                            </Link>
                        ) : (
                            <Link href={login()} className="btn-primary" id="cta-signin">
                                Sign In to Portal
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                    <path d="M5 12h14M12 5l7 7-7 7" />
                                </svg>
                            </Link>
                        )}
                    </div>

                    {/* ── Feature cards ── */}
                    <div className="animate-fade-up-delay-4 mt-20 grid w-full max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4" role="list" aria-label="Portal features">

                        {/* Card: Attendance */}
                        <article className="glass-card flex flex-col items-start gap-3 rounded-xl p-5 text-left" role="listitem">
                            <div className="icon-ring" aria-hidden="true">
                                <Clock className="h-5 w-5 text-[hsl(142,70%,65%)]" strokeWidth={1.75} />
                            </div>
                            <div>
                                <h2 className="text-sm font-semibold text-white">Attendance</h2>
                                <p className="mt-1 text-sm leading-relaxed text-white/60">
                                    Clock in and out with a single tap. Accurate, real-time records.
                                </p>
                            </div>
                        </article>

                        {/* Card: Leave Requests */}
                        <article className="glass-card flex flex-col items-start gap-3 rounded-xl p-5 text-left" role="listitem">
                            <div className="icon-ring" aria-hidden="true">
                                <CalendarCheck className="h-5 w-5 text-[hsl(52,95%,65%)]" strokeWidth={1.75} />
                            </div>
                            <div>
                                <h2 className="text-sm font-semibold text-white">Leave Requests</h2>
                                <p className="mt-1 text-sm leading-relaxed text-white/60">
                                    Submit and track leave applications with approval workflows.
                                </p>
                            </div>
                        </article>

                        {/* Card: Personnel */}
                        <article className="glass-card flex flex-col items-start gap-3 rounded-xl p-5 text-left" role="listitem">
                            <div className="icon-ring" aria-hidden="true">
                                <Users2 className="h-5 w-5 text-[hsl(142,70%,65%)]" strokeWidth={1.75} />
                            </div>
                            <div>
                                <h2 className="text-sm font-semibold text-white">Personnel</h2>
                                <p className="mt-1 text-sm leading-relaxed text-white/60">
                                    Manage employee profiles, departments, and positions.
                                </p>
                            </div>
                        </article>

                        {/* Card: Role-Based Access */}
                        <article className="glass-card flex flex-col items-start gap-3 rounded-xl p-5 text-left" role="listitem">
                            <div className="icon-ring" aria-hidden="true">
                                <ShieldCheck className="h-5 w-5 text-[hsl(52,95%,65%)]" strokeWidth={1.75} />
                            </div>
                            <div>
                                <h2 className="text-sm font-semibold text-white">Role-Based Access</h2>
                                <p className="mt-1 text-sm leading-relaxed text-white/60">
                                    Granular permissions for Admins, HR Staff, and Employees.
                                </p>
                            </div>
                        </article>

                    </div>
                </main>

                {/* ── Footer ── */}
                <footer className="border-t border-white/8 py-6 text-center text-xs text-white/30">
                    © {new Date().getFullYear()} DARPO Albay. All rights reserved.
                </footer>
            </div>
        </>
    );
}
