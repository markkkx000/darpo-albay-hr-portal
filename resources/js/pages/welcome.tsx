import { Head, Link, usePage } from '@inertiajs/react';
import { CalendarCheck, Clock, ShieldCheck, Users2, ArrowRight } from 'lucide-react';
import AppLogoIcon from '@/components/app-logo-icon';
import { dashboard, login } from '@/routes';

export default function Welcome() {
    const { auth } = usePage().props;

    return (
        <div className="relative min-h-screen">
            <Head title="DARPO Albay HR Portal — Smarter Workforce Management" />

            {/* ── Cinematic Background ── */}
            <div className="mesh-bg" aria-hidden="true">
                <div className="mesh-halo" />
            </div>

            <div className="relative z-10 flex min-h-screen flex-col font-sans">
                {/* ── Navbar ── */}
                <header className="sticky top-0 z-50 border-b border-border-1 bg-background/60 backdrop-blur-xl saturate-[1.8]">
                    <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                        <div className="flex items-center gap-2.5">
                            <AppLogoIcon className="h-9 w-9 shrink-0" />
                            <span className="text-sm font-semibold tracking-tight text-foreground">
                                DARPO Albay
                                <span className="ml-1 text-muted-foreground font-normal">HR Portal</span>
                            </span>
                        </div>
                        <nav aria-label="Primary navigation">
                            {auth.user ? (
                                <Link href={dashboard()} className="text-sm font-medium hover:text-green-600 dark:hover:text-green-400 transition-colors">
                                    Dashboard
                                </Link>
                            ) : (
                                <Link href={login()} className="btn-specular px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider">
                                    Sign In
                                </Link>
                            )}
                        </nav>
                    </div>
                </header>

                {/* ── Hero section ── */}
                <main className="flex flex-1 flex-col items-center px-6 py-20 sm:py-32 lg:py-40" id="hero">
                    <div className="text-center max-w-5xl mx-auto w-full">
                        {/* Badge */}
                        <div
                            className="animate-fade-up mb-8 inline-flex items-center gap-2 rounded-full border border-green-500/20 bg-green-500/10 px-5 py-2 text-xs font-bold text-green-600 dark:text-green-400 uppercase tracking-[0.06em] shadow-sm backdrop-blur-md"
                            aria-label="Province of Albay official HR system"
                        >
                            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" aria-hidden="true" />
                            Official HR System — Province of Albay
                        </div>

                        {/* Headline */}
                        <h1 className="animate-fade-up-delay-1 t-display-green leading-[1.05] md:text-7xl lg:text-8xl">
                            Smarter Workforce <br className="hidden md:block" /> Management
                        </h1>

                        {/* Subheadline */}
                        <p className="animate-fade-up-delay-2 mt-8 text-lg md:text-xl font-medium text-muted-foreground max-w-2xl mx-auto tracking-tight">
                            A unified platform for attendance tracking, leave management, and personnel administration — designed exclusively for DARPO Albay.
                        </p>

                        {/* CTAs */}
                        <div className="animate-fade-up-delay-3 mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
                            {auth.user ? (
                                <Link href={dashboard()} className="btn-specular px-8 py-4 flex items-center justify-center min-w-[220px] text-base font-semibold" id="cta-dashboard">
                                    Open Dashboard
                                    <ArrowRight className="ml-2 h-5 w-5" strokeWidth={2} aria-hidden="true" />
                                </Link>
                            ) : (
                                <>
                                    <Link href={login()} className="btn-specular px-8 py-4 flex items-center justify-center min-w-[220px] text-base font-semibold" id="cta-signin">
                                        Sign In to Portal
                                        <ArrowRight className="ml-2 h-5 w-5" strokeWidth={2} aria-hidden="true" />
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>

                    {/* ── Bento Box Feature Grid ── */}
                    <div className="animate-fade-up-delay-3 mt-24 md:mt-32 grid w-full max-w-6xl grid-cols-1 md:grid-cols-12 gap-6" role="list" aria-label="Portal features">
                        
                        {/* Primary Feature (Spans 2 columns on desktop) */}
                        <article className="matte-card elev-2 md:col-span-12 lg:col-span-8 flex flex-col md:flex-row items-center gap-8 p-8 md:p-10 text-left spring-hover" role="listitem">
                            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-green-500/10 shrink-0" aria-hidden="true">
                                <Clock className="h-8 w-8 text-green-500" strokeWidth={1.5} />
                            </div>
                            <div>
                                <h2 className="t-title text-2xl md:text-3xl mb-3">Real-Time Attendance</h2>
                                <p className="t-body text-base text-muted-foreground max-w-lg">
                                    Clock in and out with absolute precision. Our unified ledger ensures that timekeeping is transparent, instantaneous, and strictly audited.
                                </p>
                            </div>
                        </article>

                        {/* Standard Feature */}
                        <article className="matte-card elev-2 md:col-span-6 lg:col-span-4 flex flex-col items-start gap-5 p-8 text-left spring-hover" role="listitem">
                            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-yellow-500/10" aria-hidden="true">
                                <CalendarCheck className="h-6 w-6 text-yellow-500" strokeWidth={1.5} />
                            </div>
                            <div>
                                <h2 className="t-headline text-xl mb-2">Leave Management</h2>
                                <p className="t-body text-sm text-muted-foreground">
                                    Submit and track leave applications with robust approval workflows.
                                </p>
                            </div>
                        </article>

                        {/* Standard Feature */}
                        <article className="matte-card elev-2 md:col-span-6 lg:col-span-4 flex flex-col items-start gap-5 p-8 text-left spring-hover" role="listitem">
                            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-green-500/10" aria-hidden="true">
                                <Users2 className="h-6 w-6 text-green-500" strokeWidth={1.5} />
                            </div>
                            <div>
                                <h2 className="t-headline text-xl mb-2">Personnel Directory</h2>
                                <p className="t-body text-sm text-muted-foreground">
                                    A single source of truth for all employee profiles, departments, and positions.
                                </p>
                            </div>
                        </article>

                        {/* Primary/Wide Feature (Spans 2 columns) */}
                        <article className="matte-card elev-2 md:col-span-12 lg:col-span-8 flex flex-col md:flex-row items-center gap-8 p-8 md:p-10 text-left spring-hover" role="listitem">
                            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-yellow-500/10 shrink-0" aria-hidden="true">
                                <ShieldCheck className="h-8 w-8 text-yellow-500" strokeWidth={1.5} />
                            </div>
                            <div>
                                <h2 className="t-title text-2xl md:text-3xl mb-3">Role-Based Security</h2>
                                <p className="t-body text-base text-muted-foreground max-w-lg">
                                    Granular permission matrices ensure that Admins, HR Staff, and Employees only access exactly what they are authorized to see.
                                </p>
                            </div>
                        </article>

                    </div>
                </main>

                {/* ── Footer ── */}
                <footer className="border-t border-border-1 py-10 text-center text-sm font-medium text-muted-foreground/60 backdrop-blur-md">
                    © {new Date().getFullYear()} DARPO Albay. All rights reserved.
                </footer>
            </div>
        </div>
    );
}
