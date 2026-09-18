import { Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LinkItem {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginationProps {
    links: LinkItem[] | any;
    meta?: any;
}

export function Pagination({ links, meta }: PaginationProps) {
    // If it's an API Resource, the pagination meta might be nested under meta.meta
    const normalizedMeta = meta?.meta ? meta.meta : meta;

    // The links array is normally links. If links is an object (API Resource root links),
    // the actual array of links is inside normalizedMeta.links
    const normalizedLinks = Array.isArray(links)
        ? links
        : normalizedMeta?.links || [];

    const showNavigation = normalizedLinks.length > 3;

    if (!showNavigation && !normalizedMeta) {
        return null;
    }

    return (
        <div className="flex flex-col items-center justify-between gap-4 px-2 py-4 sm:flex-row">
            {normalizedMeta &&
                normalizedMeta.from !== undefined &&
                normalizedMeta.from !== null &&
                normalizedMeta.to !== null && (
                    <div className="text-sm whitespace-nowrap text-muted-foreground">
                        Showing{' '}
                        <span className="font-semibold text-foreground">
                            {normalizedMeta.from}
                        </span>{' '}
                        to{' '}
                        <span className="font-semibold text-foreground">
                            {normalizedMeta.to}
                        </span>{' '}
                        of{' '}
                        <span className="font-semibold text-foreground">
                            {normalizedMeta.total}
                        </span>{' '}
                        results
                    </div>
                )}

            {showNavigation && (
                <nav
                    className="flex flex-wrap items-center justify-center gap-1 select-none"
                    aria-label="Pagination Navigation"
                >
                    {normalizedLinks.map((link: any, index: number) => {
                        const isPrev = link.label.includes('Previous');
                        const isNext = link.label.includes('Next');
                        const label = isPrev ? (
                            <ChevronLeft className="h-4 w-4" />
                        ) : isNext ? (
                            <ChevronRight className="h-4 w-4" />
                        ) : (
                            link.label
                        );

                        const cleanLabel =
                            typeof label === 'string'
                                ? label
                                      .replace(/&laquo;/g, '«')
                                      .replace(/&raquo;/g, '»')
                                : label;

                        if (link.url === null) {
                            return (
                                <span
                                    key={index}
                                    className={cn(
                                        'flex h-11 min-w-11 cursor-not-allowed items-center justify-center rounded-full border border-transparent px-3 text-sm text-muted-foreground opacity-50',
                                        (isPrev || isNext) && 'px-2',
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
                                aria-label={
                                    isPrev
                                        ? 'Go to previous page'
                                        : isNext
                                          ? 'Go to next page'
                                          : `Go to page ${link.label}`
                                }
                                aria-current={link.active ? 'page' : undefined}
                                className={cn(
                                    'flex h-11 min-w-11 items-center justify-center rounded-full border text-sm font-bold transition duration-300',
                                    link.active
                                        ? 'btn-specular border-none text-black shadow-lg'
                                        : 'border-border-1 bg-surface-1 text-muted-foreground hover:border-transparent hover:item-hover-gradient hover:text-black',
                                    (isPrev || isNext) && 'px-2',
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
