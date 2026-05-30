import { Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LinkItem {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginationProps {
    links: LinkItem[];
    meta?: {
        from: number | null;
        to: number | null;
        total: number;
        current_page: number;
        last_page: number;
    };
}

export function Pagination({ links, meta }: PaginationProps) {
    const showNavigation = links.length > 3;

    if (!showNavigation && !meta) {
        return null;
    }

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-2">
            {meta && meta.from !== null && meta.to !== null && (
                <div className="text-sm text-muted-foreground whitespace-nowrap">
                    Showing <span className="font-semibold text-foreground">{meta.from}</span> to <span className="font-semibold text-foreground">{meta.to}</span> of <span className="font-semibold text-foreground">{meta.total}</span> results
                </div>
            )}
            
            {showNavigation && (
                <nav className="flex items-center gap-1 select-none flex-wrap justify-center" aria-label="Pagination Navigation">
                    {links.map((link, index) => {
                        const isPrev = link.label.includes('Previous');
                        const isNext = link.label.includes('Next');
                        const label = isPrev ? <ChevronLeft className="h-4 w-4" /> : isNext ? <ChevronRight className="h-4 w-4" /> : link.label;

                        const cleanLabel = typeof label === 'string' 
                            ? label.replace(/&laquo;/g, '«').replace(/&raquo;/g, '»')
                            : label;

                        if (link.url === null) {
                            return (
                                <span
                                    key={index}
                                    className={cn(
                                        "flex h-11 min-w-11 items-center justify-center rounded-full border border-transparent px-3 text-sm text-muted-foreground opacity-50 cursor-not-allowed",
                                        (isPrev || isNext) && "px-2"
                                    )}
                                    aria-disabled="true"
                                >
                                    {cleanLabel}
                                </span>
                            );
                        }

                        return (
                            <Link
                                key={index}
                                href={link.url}
                                preserveScroll
                                preserveState
                                aria-label={isPrev ? 'Go to previous page' : isNext ? 'Go to next page' : `Go to page ${link.label}`}
                                aria-current={link.active ? 'page' : undefined}
                                className={cn(
                                    "flex h-11 min-w-11 items-center justify-center rounded-full border text-sm transition duration-300 font-bold",
                                    link.active 
                                        ? "btn-specular border-none shadow-lg text-black" 
                                        : "bg-surface-1 border-border-1 text-muted-foreground hover:item-hover-gradient hover:border-transparent hover:text-black",
                                    (isPrev || isNext) && "px-2"
                                )}
                            >
                                {cleanLabel}
                            </Link>
                        );
                    })}
                </nav>
            )}
        </div>
    );
}
