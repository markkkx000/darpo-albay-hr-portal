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
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setLoading(false);
        }
    };




    const toggleExpand = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setExpandedIds(prev => {
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
                <div className="relative inline-flex group spring-press cursor-pointer">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="btn-ghost-specular relative h-9 w-9 border-none shadow-none pointer-events-none"
                        aria-label="Notifications"
                    >
                        <Bell className="h-5 w-5 transition-transform duration-200 group-hover:rotate-12" />
                    </Button>
                    {unreadCount > 0 && (
                        <Badge
                            variant="destructive"
                            className="absolute -right-1 -top-1 z-10 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] animate-in zoom-in pointer-events-none"
                        >
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </Badge>
                    )}
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 p-0 matte-card elev-3 border-none shadow-2xl" sideOffset={8}>
                <div className="flex items-center justify-between px-4 py-3 border-b border-sidebar-border/30">
                    <span className="text-sm font-semibold">Notifications</span>
                    {unreadCount > 0 && (
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={(e) => {
                                e.stopPropagation();
                                httpPost(NotificationActions.readAll.url(), {
                                    onSuccess: () => {
                                        router.reload({ only: ['notifications', 'appNotifications'] });
                                        fetchRecent();
                                    }
                                });
                            }}
                            className="h-7 text-[11px] px-2 text-primary hover:text-primary hover:bg-primary/10"
                        >
                            Mark all read
                        </Button>
                    )}
                </div>

                <div className="max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-muted p-1.5">
                    {loading && notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent mb-2" />
                            <span className="text-xs">Loading notifications...</span>
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground opacity-60">
                            <Bell className="h-8 w-8 mb-2" />
                            <span className="text-xs">No notifications yet</span>
                        </div>
                    ) : (
                        notifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={cn(
                                    "flex flex-col border-b border-sidebar-border/30 p-4 transition duration-200 cursor-pointer mx-1.5 my-1 rounded-xl group hover:bg-black/5 dark:hover:bg-white/5 active:scale-[0.99]",
                                    !notification.read_at ? "bg-primary/[0.05]" : ""
                                )}
                                onClick={(e) => toggleExpand(notification.id, e)}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className={cn(
                                                "text-sm font-medium leading-tight",
                                                notification.data.priority === 'high' ? "text-destructive" : "text-foreground",
                                                !notification.read_at && "font-bold"
                                            )}>
                                                {notification.data.title}
                                            </span>
                                            {notification.data.priority === 'high' && (
                                                <Badge variant="outline" className="flex h-[15px] items-center justify-center border-destructive px-1.5 py-0 text-[9px] font-bold uppercase tracking-wider text-destructive">High</Badge>
                                            )}
                                            {!notification.read_at && (
                                                <span className="flex h-2.5 w-2.5 shrink-0 rounded-full bg-primary shadow-[0_0_8px_var(--green-glow)]" />
                                            )}
                                        </div>
                                        <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                                            <span className="font-medium text-foreground/70">{notification.data.from}</span>
                                            <span>•</span>
                                            <span>{new Date(notification.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <div className="flex h-7 w-7 items-center justify-center text-muted-foreground/50">
                                            {expandedIds.has(notification.id) ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                        </div>
                                    </div>
                                </div>
                                {expandedIds.has(notification.id) && (
                                    <div className="mt-3 text-xs text-foreground/80 leading-relaxed animate-in slide-in-from-top-1 duration-200">
                                        {(() => {
                                            const body = notification.data.body ?? notification.data.message ?? '';
                                            const isHtml = /<[a-z][\s\S]*>/i.test(body);

                                            return (
                                                <div
                                                    className="overflow-hidden max-h-[6rem] notification-body-fade"
                                                >
                                                    {isHtml ? (
                                                        <div
                                                            className="prose prose-xs dark:prose-invert max-w-none [&_p]:my-0.5 [&_li]:my-0 [&_ul]:my-1 [&_ol]:my-1 [&_blockquote]:my-1 [&_img]:hidden"
                                                            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(body) }}
                                                        />
                                                    ) : (
                                                        <p className="whitespace-pre-wrap">{body}</p>
                                                    )}
                                                </div>
                                            );
                                        })()}
                                        {notification.data.url && (
                                            <div className="mt-3">
                                                <Link
                                                    href={notification.data.url}
                                                    className="inline-flex items-center text-[11px] font-semibold text-primary hover:underline gap-1 group/link"
                                                    onClick={(e) => {
                                                        e.stopPropagation();

                                                        const isDismissible = notification.data.dismissible ?? true;

                                                        if (!notification.read_at && isDismissible) {
                                                            e.preventDefault();
                                                            httpPost(NotificationActions.read.url({ id: notification.id }), {
                                                                onSuccess: () => {
                                                                    router.visit(notification.data.url!);
                                                                }
                                                            });
                                                        }
                                                    }}
                                                >
                                                    View Details
                                                    <span className="transition-transform group-hover:translate-x-0.5">→</span>
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
