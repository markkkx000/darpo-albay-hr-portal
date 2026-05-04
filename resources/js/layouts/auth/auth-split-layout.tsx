import { Link, usePage } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSplitLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    const { name } = usePage().props;

    return (
        <div className="relative grid h-dvh flex-col items-center justify-center px-8 sm:px-0 lg:max-w-none lg:grid-cols-2 lg:px-0">
            {/* ── Left panel: Glassmorphism animated background ── */}
            <div className="relative hidden h-full flex-col p-10 text-white lg:flex dark:border-r overflow-hidden">
                <style>{`
                    .auth-left-bg {
                        position: absolute;
                        inset: 0;
                        background: linear-gradient(135deg, #030f04 0%, #051a0a 50%, #0d1a05 100%);
                        overflow: hidden;
                    }
                    .auth-blob {
                        --size: 420px;
                        --speed: 40s;
                        --easing: cubic-bezier(0.8, 0.2, 0.2, 0.8);
                        position: absolute;
                        top: 50%;
                        left: 50%;
                        translate: -50% -50%;
                        width: var(--size);
                        height: var(--size);
                        filter: blur(calc(var(--size) / 5));
                        background-image: linear-gradient(hsl(142, 85%, 45%), hsl(52, 100%, 55%));
                        border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;
                        will-change: transform;
                        opacity: 0.45;
                    }
                    .auth-blob-2 {
                        --size: 280px;
                        --speed: 28s;
                        position: absolute;
                        top: 20%;
                        left: 70%;
                        width: var(--size);
                        height: var(--size);
                        filter: blur(calc(var(--size) / 4));
                        background-image: linear-gradient(hsl(52, 100%, 55%), hsl(142, 85%, 45%));
                        border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
                        opacity: 0.25;
                    }
                    .auth-grain {
                        position: absolute;
                        inset: 0;
                        z-index: 1;
                        opacity: 0.04;
                        pointer-events: none;
                        background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E");
                        background-size: 200px 200px;
                    }
                    @media (prefers-reduced-motion: no-preference) {
                        .auth-blob {
                            animation: auth-blob-rotate var(--speed) var(--easing) alternate infinite;
                        }
                        .auth-blob-2 {
                            animation: auth-blob-rotate calc(var(--speed) * 0.8) var(--easing) alternate-reverse infinite;
                        }
                        @keyframes auth-blob-rotate {
                            0%   { transform: rotate(0deg) scale(1); }
                            100% { transform: rotate(360deg) scale(1.05); }
                        }
                    }
                `}</style>

                <div className="auth-left-bg" aria-hidden="true">
                    <div className="auth-blob" />
                    <div className="auth-blob-2" />
                    <div className="auth-grain" />
                </div>

                <Link
                    href={home()}
                    className="relative z-20 flex items-center text-lg font-semibold tracking-tight text-white drop-shadow-sm"
                >
                    <AppLogoIcon className="mr-2.5 size-8" />
                    {name}
                </Link>

                <div className="relative z-20 mt-auto">
                    <blockquote className="space-y-2">
                        <p className="text-sm leading-relaxed text-white/60">
                            A unified platform for attendance tracking, leave management, and personnel administration — designed for DARPO Albay.
                        </p>
                    </blockquote>
                </div>
            </div>

            {/* ── Right panel: form ── */}
            <div className="w-full lg:p-8">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                    <Link
                        href={home()}
                        className="relative z-20 flex items-center justify-center lg:hidden"
                    >
                        <AppLogoIcon className="h-10 sm:h-12" />
                    </Link>
                    <div className="flex flex-col items-start gap-2 text-left sm:items-center sm:text-center">
                        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
                        <p className="text-sm text-balance text-muted-foreground">
                            {description}
                        </p>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}
