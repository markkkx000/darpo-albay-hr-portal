import { Link, router, usePage, useHttp } from '@inertiajs/react';
import DOMPurify from 'dompurify';
import { Bell, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import * as NotificationActions from '@/actions/App/Modules/Notifications/Controllers/NotificationController';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import type { Notification, PageProps } from '@/types';

export default function NotificationBell() {
    const { appNotifications } = usePage<PageProps>().props;
    const { post: httpPost } = useHttp();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(false);
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

    const unreadCount = appNotifications?.unread_count ?? 0;

    const fetchRecent = async () => {
        if (loading) {
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(NotificationActions.recent.url());
            const json = await response.json();
            setNotifications(json.data);
        } catch {
            // Silently handle fetch failures
        } finally {
            setLoading(false);
        }
    };

    const toggleExpand = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setExpandedIds((prev) => {
            const next = new Set(prev);

            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }

            return next;
        });
    };

    return (
        <DropdownMenu onOpenChange={(open) => open && fetchRecent()}>
            <DropdownMenuTrigger asChild>
                <div className="group spring-press relative inline-flex cursor-pointer">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="btn-ghost-specular pointer-events-none relative h-9 w-9 border-none shadow-none"
                        aria-label="Notifications"
                    >
                        <Bell className="h-5 w-5 transition-transform duration-200 group-hover:rotate-12" />
                    </Button>
                    {unreadCount > 0 && (
                        <Badge
                            variant="destructive"
                            className="pointer-events-none absolute -top-1 -right-1 z-10 flex h-4 min-w-4 animate-in items-center justify-center rounded-full px-1 text-[10px] zoom-in"
                        >
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </Badge>
                    )}
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="end"
                className="matte-card elev-3 w-80 border-none p-0 shadow-2xl"
                sideOffset={8}
            >
                <div className="flex items-center justify-between border-b border-sidebar-border/30 px-4 py-3">
                    <span className="text-sm font-semibold">Notifications</span>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                httpPost(NotificationActions.readAll.url(), {
                                    onSuccess: () => {
                                        router.reload({
                                            only: [
                                                'notifications',
                                                'appNotifications',
                                            ],
                                        });
                                        fetchRecent();
                                    },
                                });
                            }}
                            className="h-7 px-2 text-[11px] text-primary hover:bg-primary/10 hover:text-primary"
                        >
                            Mark all read
                        </Button>
                    )}
                </div>

                <div className="scrollbar-thin scrollbar-thumb-muted max-h-[400px] overflow-y-auto p-1.5">
                    {loading && notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                            <div className="mb-2 h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                            <span className="text-xs">
                                Loading notifications...
                            </span>
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground opacity-60">
                            <Bell className="mb-2 h-8 w-8" />
                            <span className="text-xs">
                                No notifications yet
                            </span>
                        </div>
                    ) : (
                        notifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={cn(
                                    'group mx-1.5 my-1 flex cursor-pointer flex-col rounded-xl border-b border-sidebar-border/30 p-4 transition duration-200 hover:bg-black/5 active:scale-[0.99] dark:hover:bg-white/5',
                                    !notification.read_at
                                        ? 'bg-primary/[0.05]'
                                        : '',
                                )}
                                onClick={(e) =>
                                    toggleExpand(notification.id, e)
                                }
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span
                                                className={cn(
                                                    'text-sm leading-tight font-medium',
                                                    notification.data
                                                        .priority === 'high'
                                                        ? 'text-destructive'
                                                        : 'text-foreground',
                                                    !notification.read_at &&
                                                        'font-bold',
                                                )}
                                            >
                                                {notification.data.title}
                                            </span>
                                            {notification.data.priority ===
                                                'high' && (
                                                <Badge
                                                    variant="outline"
                                                    className="flex h-[15px] items-center justify-center border-destructive px-1.5 py-0 text-[9px] font-bold tracking-wider text-destructive uppercase"
                                                >
                                                    High
                                                </Badge>
                                            )}
                                            {!notification.read_at && (
                                                <span className="flex h-2.5 w-2.5 shrink-0 rounded-full bg-primary shadow-[0_0_8px_var(--green-glow)]" />
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                                            <span className="font-medium text-foreground/70">
                                                {notification.data.from}
                                            </span>
                                            <span>•</span>
                                            <span>
                                                {new Date(
                                                    notification.created_at,
                                                ).toLocaleDateString(
                                                    undefined,
                                                    {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    },
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <div className="flex h-7 w-7 items-center justify-center text-muted-foreground/50">
                                            {expandedIds.has(
                                                notification.id,
                                            ) ? (
                                                <ChevronUp className="h-4 w-4" />
                                            ) : (
                                                <ChevronDown className="h-4 w-4" />
                                            )}
                                        </div>
                                    </div>
                                </div>
                                {expandedIds.has(notification.id) && (
                                    <div className="mt-3 animate-in text-xs leading-relaxed text-foreground/80 duration-200 slide-in-from-top-1">
                                        {(() => {
                                            const body =
                                                notification.data.body ??
                                                notification.data.message ??
                                                '';
                                            const isHtml =
                                                /<[a-z][\s\S]*>/i.test(body);

                                            return (
                                                <div className="notification-body-fade max-h-[6rem] overflow-hidden">
                                                    {isHtml ? (
                                                        <div
                                                            className="prose-xs prose max-w-none dark:prose-invert [&_blockquote]:my-1 [&_img]:hidden [&_li]:my-0 [&_ol]:my-1 [&_p]:my-0.5 [&_ul]:my-1"
                                                            dangerouslySetInnerHTML={{
                                                                __html: DOMPurify.sanitize(
                                                                    body,
                                                                ),
                                                            }}
                                                        />
                                                    ) : (
                                                        <p className="whitespace-pre-wrap">
                                                            {body}
                                                        </p>
                                                    )}
                                                </div>
                                            );
                                        })()}
                                        {notification.data.url && (
                                            <div className="mt-3">
                                                <Link
                                                    href={notification.data.url}
                                                    className="group/link inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
                                                    onClick={(e) => {
                                                        e.stopPropagation();

                                                        const isDismissible =
                                                            notification.data
                                                                .dismissible ??
                                                            true;

                                                        if (
                                                            !notification.read_at &&
                                                            isDismissible
                                                        ) {
                                                            e.preventDefault();
                                                            httpPost(
                                                                NotificationActions.read.url(
                                                                    {
                                                                        id: notification.id,
                                                                    },
                                                                ),
                                                                {
                                                                    onSuccess:
                                                                        () => {
                                                                            router.visit(
                                                                                notification
                                                                                    .data
                                                                                    .url!,
                                                                            );
                                                                        },
                                                                },
                                                            );
                                                        }
                                                    }}
                                                >
                                                    View Details
                                                    <span className="transition-transform group-hover:translate-x-0.5">
                                                        →
                                                    </span>
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
                <DropdownMenuSeparator className="m-0 border-sidebar-border/30" />
                <div className="p-2">
                    <Link
                        href={NotificationActions.index.url()}
                        className="btn-specular flex w-full items-center justify-center py-2.5 text-sm font-bold shadow-lg"
                    >
                        View All Notifications
                    </Link>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
