import { Head, Link, usePage } from '@inertiajs/react';
import { CalendarCheck, Clock, ShieldCheck, Users2 } from 'lucide-react';
import AppLogoIcon from '@/components/app-logo-icon';
import { dashboard, login } from '@/routes';
import { cn } from '@/lib/utils';

export default function Welcome() {
    const { auth } = usePage().props;

    return (
        <div className="dark">
            <Head title="DARPO Albay HR Portal — Smarter Workforce Management">
                <style>{`
                    .mesh-bg {
                        position: fixed;
                        inset: 0;
                        z-index: 0;
                        background: var(--background);
                        overflow: hidden;
                    }

                    @media (prefers-reduced-motion: no-preference) {
                        @keyframes fade-up {
                            from { opacity: 0; transform: translateY(24px); }
                            to   { opacity: 1; transform: translateY(0); }
                        }
                        .animate-fade-up {
                            animation: fade-up 0.7s var(--ease-out) forwards;
                        }
                        .animate-fade-up-delay-1 { opacity: 0; animation: fade-up 0.7s var(--ease-out) 0.15s forwards; }
                        .animate-fade-up-delay-2 { opacity: 0; animation: fade-up 0.7s var(--ease-out) 0.3s forwards; }
                        .animate-fade-up-delay-3 { opacity: 0; animation: fade-up 0.7s var(--ease-out) 0.45s forwards; }
                        .animate-fade-up-delay-4 { opacity: 0; animation: fade-up 0.7s var(--ease-out) 0.6s forwards; }
                    }

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
            <div className="mesh-bg" aria-hidden="true">
                <div 
                    className="mesh-blob" 
                    style={{ width: '400px', height: '400px', top: '-10%', left: '-5%', background: 'rgba(34, 197, 94, 0.25)', animationDelay: '0s' }} 
                />
                <div 
                    className="mesh-blob" 
                    style={{ width: '300px', height: '300px', bottom: '10%', right: '5%', background: 'rgba(250, 204, 21, 0.15)', animationDelay: '-4s' }} 
                />
                <div 
                    className="mesh-blob" 
                    style={{ width: '250px', height: '250px', top: '40%', left: '30%', background: 'rgba(22, 163, 74, 0.15)', animationDelay: '-8s' }} 
                />
            </div>

            {/* ── Page wrapper — sits above the background ── */}
            <div className="relative z-10 flex min-h-screen flex-col font-sans">

                {/* ── Navbar ── */}
                <header className="sticky top-0 z-50 border-b border-border-2 bg-background/80">
                    <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                        {/* Logo */}
                        <div className="flex items-center gap-2.5">
                            <AppLogoIcon className="h-10 w-10 shrink-0" />
                            <span className="text-sm font-semibold tracking-tight text-foreground shadow-black/40 drop-shadow-sm">
                                DARPO Albay
                                <span className="ml-1 text-muted-foreground font-normal">HR Portal</span>
                            </span>
                        </div>

                        {/* Nav CTA */}
                        <nav aria-label="Primary navigation">
                            {auth.user ? (
                                <Link href={dashboard()} className="text-sm font-medium hover:text-primary transition-colors">
                                    Go to Dashboard
                                </Link>
                            ) : (
                                <Link href={login()} className="text-sm font-medium hover:text-primary transition-colors">
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
                        className="animate-fade-up mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-black text-primary uppercase tracking-widest shadow-sm"
                        aria-label="Province of Albay official HR system"
                    >
                        <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" aria-hidden="true" />
                        Province of Albay — Official HR System
                    </div>

                    {/* Headline */}
                    <h1 className="animate-fade-up-delay-1 t-display mx-auto max-w-4xl text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-500">
                        Smarter{' '}
                        <span className="text-primary">Workforce</span>
                        {' '}Management
                    </h1>

                    {/* Subheadline */}
                    <p className="animate-fade-up-delay-2 t-body mx-auto mt-6 max-w-xl text-lg">
                        A unified platform for attendance tracking, leave management, and personnel administration — designed for DARPO Albay's team.
                    </p>

                    {/* CTAs */}
                    <div className="animate-fade-up-delay-3 mt-10 flex flex-col items-center gap-3 sm:flex-row">
                        {auth.user ? (
                            <Link href={dashboard()} className="btn-specular flex items-center justify-center min-w-[200px]" id="cta-dashboard">
                                Open Dashboard
                                <svg xmlns="http://www.w3.org/2000/svg" className="ml-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                    <path d="M5 12h14M12 5l7 7-7 7" />
                                </svg>
                            </Link>
                        ) : (
                            <Link href={login()} className="btn-specular flex items-center justify-center min-w-[200px]" id="cta-signin">
                                Sign In to Portal
                                <svg xmlns="http://www.w3.org/2000/svg" className="ml-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                    <path d="M5 12h14M12 5l7 7-7 7" />
                                </svg>
                            </Link>
                        )}
                    </div>

                    {/* ── Feature cards ── */}
                    <div className="animate-fade-up-delay-4 mt-20 grid w-full max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4" role="list" aria-label="Portal features">

                        {/* Card: Attendance */}
                        <article className="matte-card elev-2 flex flex-col items-start gap-3 p-5 text-left transition-all duration-300 hover:elev-3 hover:-translate-y-1" role="listitem">
                            <div className="sqicon bg-primary/10 text-primary border border-primary/20 shrink-0" style={{ width: '40px', height: '40px', borderRadius: '10px' }} aria-hidden="true">
                                <Clock className="h-5 w-5" strokeWidth={1.75} />
                            </div>
                            <div>
                                <h2 className="text-sm font-semibold text-foreground">Attendance</h2>
                                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                                    Clock in and out with a single tap. Accurate, real-time records.
                                </p>
                            </div>
                        </article>

                        {/* Card: Leave Requests */}
                        <article className="matte-card elev-2 flex flex-col items-start gap-3 p-5 text-left transition-all duration-300 hover:elev-3 hover:-translate-y-1" role="listitem">
                            <div className="sqicon bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 shrink-0" style={{ width: '40px', height: '40px', borderRadius: '10px' }} aria-hidden="true">
                                <CalendarCheck className="h-5 w-5" strokeWidth={1.75} />
                            </div>
                            <div>
                                <h2 className="text-sm font-semibold text-foreground">Leave Requests</h2>
                                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                                    Submit and track leave applications with approval workflows.
                                </p>
                            </div>
                        </article>

                        {/* Card: Personnel */}
                        <article className="matte-card elev-2 flex flex-col items-start gap-3 p-5 text-left transition-all duration-300 hover:elev-3 hover:-translate-y-1" role="listitem">
                            <div className="sqicon bg-primary/10 text-primary border border-primary/20 shrink-0" style={{ width: '40px', height: '40px', borderRadius: '10px' }} aria-hidden="true">
                                <Users2 className="h-5 w-5" strokeWidth={1.75} />
                            </div>
                            <div>
                                <h2 className="text-sm font-semibold text-foreground">Personnel</h2>
                                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                                    Manage employee profiles, departments, and positions.
                                </p>
                            </div>
                        </article>

                        {/* Card: Role-Based Access */}
                        <article className="matte-card elev-2 flex flex-col items-start gap-3 p-5 text-left transition-all duration-300 hover:elev-3 hover:-translate-y-1" role="listitem">
                            <div className="sqicon bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 shrink-0" style={{ width: '40px', height: '40px', borderRadius: '10px' }} aria-hidden="true">
                                <ShieldCheck className="h-5 w-5" strokeWidth={1.75} />
                            </div>
                            <div>
                                <h2 className="text-sm font-semibold text-foreground">Role-Based Access</h2>
                                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                                    Granular permissions for Admins, HR Staff, and Employees.
                                </p>
                            </div>
                        </article>

                    </div>
                </main>

                {/* ── Footer ── */}
                <footer className="border-t border-border-1 py-6 text-center text-xs text-muted-foreground">
                    © {new Date().getFullYear()} DARPO Albay. All rights reserved.
                </footer>
            </div>
        </div>
    );
}
