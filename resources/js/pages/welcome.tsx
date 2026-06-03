import { Head, Link, usePage } from '@inertiajs/react';
import { CalendarCheck, Clock, ShieldCheck, Users2, ArrowRight } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import AppLogoIcon from '@/components/app-logo-icon';
import { cn } from '@/lib/utils';
import { dashboard, login } from '@/routes';

export default function Welcome() {
    const { auth } = usePage().props;
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Custom hook for scroll animations using IntersectionObserver
    const useIntersectionObserver = (options = {}) => {
        const [isIntersecting, setIsIntersecting] = useState(false);
        const ref = useRef<HTMLDivElement>(null);

        useEffect(() => {
            const observer = new IntersectionObserver(([entry]) => {
                if (entry.isIntersecting) {
                    setIsIntersecting(true);
                    observer.disconnect();
                }
            }, { threshold: 0.1, ...options });

            if (ref.current) {
                observer.observe(ref.current);
            }

            return () => observer.disconnect();
        }, [options]);

        return [ref, isIntersecting] as const;
    };

    const [featuresRef, featuresVisible] = useIntersectionObserver();

    return (
        <div className="relative min-h-screen">
            <Head>
                <title>DARPO Albay HR Portal — Smarter Workforce Management</title>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;900&display=swap" rel="stylesheet" />
            </Head>

            {/* ── Cinematic Background ── */}
            <div className="mesh-container fixed inset-0 z-[-1]" aria-hidden="true">
                <div className="mesh-blob mesh-blob-1" />
                <div className="mesh-blob mesh-blob-2" />
                <div className="mesh-blob mesh-blob-3" />
            </div>

            <div className="relative z-10 flex min-h-screen flex-col font-sans">
                {/* ── Navbar ── */}
                <header className={cn(
                    "sticky top-0 z-50 border-b transition-colors duration-300 ease-out",
                    scrolled 
                        ? "border-border-1 bg-background/98" 
                        : "border-transparent bg-transparent"
                )}>
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
                                <Link href={login()} className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border border-border/50 hover:item-hover-gradient hover:!text-black text-foreground transition-colors duration-200">
                                    Sign In
                                </Link>
                            )}
                        </nav>
                    </div>
                </header>

                {/* ── Hero section ── */}
                <main className="flex flex-1 flex-col items-center px-6 py-20 sm:py-24 lg:py-32" id="hero">
                    <div className="text-center max-w-5xl mx-auto w-full">
                        {/* Badge */}
                        <div
                            className="animate-fade-up mb-8 inline-flex items-center gap-2 rounded-full border border-green-500/20 bg-green-500/10 px-5 py-2 text-xs font-bold text-green-600 dark:text-green-400 uppercase tracking-[0.06em] shadow-sm"
                            aria-label="Province of Albay official HR system"
                        >
                            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" aria-hidden="true" />
                            Official HR System — Province of Albay
                        </div>

                        {/* Headline */}
                        <h1 className="animate-fade-up-delay-1 t-display-green leading-[1.2] md:text-7xl lg:text-8xl pb-4" style={{ fontFamily: '"Outfit", sans-serif' }}>
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
                                <Link href={login()} className="btn-specular px-8 py-4 flex items-center justify-center min-w-[220px] text-base font-semibold" id="cta-signin">
                                    Sign In to Portal
                                    <ArrowRight className="ml-2 h-5 w-5" strokeWidth={2} aria-hidden="true" />
                                </Link>
                            )}
                        </div>

                        {/* ── Dashboard Mockup / Frame ── */}
                        <div className="animate-fade-up-delay-3 mt-20 relative mx-auto max-w-4xl rounded-2xl border border-border-1 bg-surface-2 p-2 shadow-2xl overflow-hidden ring-1 ring-white/10 dark:ring-white/5">
                            <div className="absolute top-0 left-0 right-0 h-8 bg-surface-3 flex items-center px-4 gap-2 border-b border-border-1 z-10">
                                <div className="h-3 w-3 rounded-full bg-red-500/80" />
                                <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
                                <div className="h-3 w-3 rounded-full bg-green-500/80" />
                            </div>
                            <div className="mt-8 rounded-xl overflow-hidden bg-background relative">
                                {/* Use an actual app screenshot if available, or a stylized placeholder */}
                                <div className="h-[400px] w-full bg-surface-1 flex flex-col gap-4 p-8 pointer-events-none select-none">
                                    <div className="flex items-center gap-4 border-b border-border-1 pb-4">
                                        <div className="h-10 w-48 bg-surface-3 rounded-lg" />
                                        <div className="h-10 w-24 bg-surface-3 rounded-lg" />
                                        <div className="h-10 w-10 bg-green-500/20 rounded-full ml-auto" />
                                    </div>
                                    <div className="grid grid-cols-3 gap-6 mt-4">
                                        <div className="h-32 bg-surface-2 border border-border-1 rounded-xl p-4 flex flex-col gap-2">
                                            <div className="h-4 w-20 bg-surface-3 rounded" />
                                            <div className="h-10 w-16 bg-green-500/20 rounded mt-auto" />
                                        </div>
                                        <div className="h-32 bg-surface-2 border border-border-1 rounded-xl p-4 flex flex-col gap-2">
                                            <div className="h-4 w-24 bg-surface-3 rounded" />
                                            <div className="h-10 w-20 bg-yellow-500/20 rounded mt-auto" />
                                        </div>
                                        <div className="h-32 bg-surface-2 border border-border-1 rounded-xl p-4 flex flex-col gap-2">
                                            <div className="h-4 w-16 bg-surface-3 rounded" />
                                            <div className="h-10 w-12 bg-blue-500/20 rounded mt-auto" />
                                        </div>
                                    </div>
                                    <div className="h-48 w-full bg-surface-2 border border-border-1 rounded-xl mt-4 p-4 flex flex-col gap-3">
                                        <div className="h-6 w-32 bg-surface-3 rounded" />
                                        <div className="h-4 w-full bg-surface-3/50 rounded" />
                                        <div className="h-4 w-full bg-surface-3/50 rounded" />
                                        <div className="h-4 w-3/4 bg-surface-3/50 rounded" />
                                    </div>
                                </div>
                            </div>
                            {/* Gradient overlay to fade bottom seamlessly */}
                            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-surface-2 via-surface-2/80 to-transparent z-20 pointer-events-none" />
                        </div>
                    </div>

                    {/* ── Features Header ── */}
                    <div ref={featuresRef} className={cn("text-center mt-32 md:mt-40 transition-[transform,opacity] duration-1000 ease-out", featuresVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10")}>
                        <h2 className="t-headline text-3xl md:text-4xl" style={{ fontFamily: '"Outfit", sans-serif' }}>Everything you need to manage your workforce.</h2>
                        <p className="mt-4 text-muted-foreground max-w-2xl mx-auto text-lg">Purpose-built tools designed to eliminate paperwork and streamline HR operations.</p>
                    </div>

                    {/* ── Bento Box Feature Grid ── */}
                    <div className={cn("mt-16 grid w-full max-w-6xl grid-cols-1 md:grid-cols-12 gap-6 transition-[transform,opacity] duration-1000 ease-out delay-200", featuresVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10")} role="list" aria-label="Portal features">
                        
                        {/* Primary Feature (Spans 2 columns on desktop) */}
                        <article className="matte-card elev-2 md:col-span-12 lg:col-span-8 flex flex-col md:flex-row items-center gap-8 p-8 md:p-10 text-left" role="listitem">
                            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-green-500/10 shrink-0 border border-green-500/20" aria-hidden="true">
                                <Clock className="h-8 w-8 text-green-500" strokeWidth={1.5} />
                            </div>
                            <div>
                                <h2 className="t-title text-2xl mb-3">Real-Time Attendance</h2>
                                <p className="t-body text-base text-muted-foreground max-w-lg">
                                    Clock in and out with absolute precision. Our unified ledger ensures that timekeeping is transparent, instantaneous, and strictly audited across all departments.
                                </p>
                            </div>
                        </article>

                        {/* Standard Feature */}
                        <article className="matte-card elev-2 md:col-span-6 lg:col-span-4 flex flex-col items-start gap-5 p-8 md:p-10 text-left" role="listitem">
                            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-green-500/10 shrink-0 border border-green-500/20" aria-hidden="true">
                                <CalendarCheck className="h-6 w-6 text-green-500" strokeWidth={1.5} />
                            </div>
                            <div className="flex flex-col justify-center h-full">
                                <h2 className="t-title text-2xl mb-3">Leave Management</h2>
                                <p className="t-body text-base text-muted-foreground">
                                    Submit and track leave applications with robust approval workflows, instant notifications, and automated balance calculations.
                                </p>
                            </div>
                        </article>

                        {/* Standard Feature */}
                        <article className="matte-card elev-2 md:col-span-6 lg:col-span-4 flex flex-col items-start gap-5 p-8 md:p-10 text-left" role="listitem">
                            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-green-500/10 shrink-0 border border-green-500/20" aria-hidden="true">
                                <Users2 className="h-6 w-6 text-green-500" strokeWidth={1.5} />
                            </div>
                            <div className="flex flex-col justify-center h-full">
                                <h2 className="t-title text-2xl mb-3">Personnel Directory</h2>
                                <p className="t-body text-base text-muted-foreground">
                                    A secure, centralized single source of truth for all employee profiles, organizational structures, and government IDs.
                                </p>
                            </div>
                        </article>

                        {/* Primary/Wide Feature (Spans 2 columns) */}
                        <article className="matte-card elev-2 md:col-span-12 lg:col-span-8 flex flex-col md:flex-row items-center gap-8 p-8 md:p-10 text-left" role="listitem">
                            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-green-500/10 shrink-0 border border-green-500/20" aria-hidden="true">
                                <ShieldCheck className="h-8 w-8 text-green-500" strokeWidth={1.5} />
                            </div>
                            <div>
                                <h2 className="t-title text-2xl mb-3">Role-Based Security</h2>
                                <p className="t-body text-base text-muted-foreground max-w-lg">
                                    Granular permission matrices ensure that Administrators, HR Staff, and Employees only access exactly what they are authorized to see.
                                </p>
                            </div>
                        </article>

                    </div>
                </main>

                {/* ── Footer ── */}
                <footer className="mt-20 md:mt-32 border-t border-border-1 bg-background/50">
                    <div className="mx-auto max-w-7xl px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-3">
                            <AppLogoIcon className="h-8 w-8 grayscale opacity-70" />
                            <span className="text-sm font-semibold tracking-tight text-muted-foreground">
                                DARPO Albay HR Portal
                            </span>
                        </div>
                        <div className="flex items-center gap-6 text-sm font-medium text-muted-foreground/60">
                            <Link href="#" className="hover:text-foreground transition-colors">Privacy Policy</Link>
                            <Link href="#" className="hover:text-foreground transition-colors">Terms of Service</Link>
                            <span>© {new Date().getFullYear()} All rights reserved.</span>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
}
