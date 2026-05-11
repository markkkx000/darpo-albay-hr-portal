import { Link, router, usePage, useHttp } from '@inertiajs/react';
import { Bell, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import * as NotificationActions from '@/actions/App/Modules/Notifications/Controllers/NotificationController';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
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
                <div className="relative inline-flex transition-transform hover:scale-110">
                    <Button
                        size="icon"
                        className="btn-ghost-specular relative h-9 w-9 border-none shadow-none"
                        aria-label="Notifications"
                    >
                        <Bell className="h-5 w-5" />
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
            <DropdownMenuContent align="end" className="w-80 p-1.5 matte-card elev-3 border-none shadow-2xl" sideOffset={8}>

                <div className="max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-muted">
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
                                    "flex flex-col border-b border-sidebar-border/30 p-4 transition-all duration-200 cursor-pointer mx-1.5 my-1 rounded-xl group",
                                    !notification.read_at ? "bg-primary/[0.03] hover:item-hover-gradient" : "hover:item-hover-gradient"
                                )}
                                onClick={(e) => toggleExpand(notification.id, e)}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className={cn(
                                                "text-sm font-medium leading-tight group-hover:text-black",
                                                notification.data.priority === 'high' ? "text-destructive" : "text-foreground",
                                                !notification.read_at && "font-bold"
                                            )}>
                                                {notification.data.title}
                                            </span>
                                            {notification.data.priority === 'high' && (
                                                <Badge variant="outline" className="h-3 px-1 border-destructive text-destructive text-[9px] uppercase tracking-wider font-bold group-hover:border-black group-hover:text-black">High</Badge>
                                            )}
                                            {!notification.read_at && (
                                                <span className="flex h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_8px_var(--green-glow)] group-hover:bg-white group-hover:shadow-none" />
                                            )}
                                        </div>
                                        <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 group-hover:text-black/70">
                                            <span className="font-medium text-foreground/70 group-hover:text-black/90">{notification.data.from}</span>
                                            <span>•</span>
                                            <span>{new Date(notification.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <div className="flex h-7 w-7 items-center justify-center text-muted-foreground/50 group-hover:text-black/60">
                                            {expandedIds.has(notification.id) ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                        </div>
                                    </div>
                                </div>
                                {expandedIds.has(notification.id) && (
                                    <div className="mt-3 text-xs text-foreground/80 leading-relaxed animate-in slide-in-from-top-1 duration-200 group-hover:text-black/90">
                                        {(() => {
                                            const snippet = notification.data.body ?? notification.data.message ?? '';
                                            const isLong = snippet.length > 150;

                                            return (
                                                <div
                                                    className="overflow-hidden max-h-[6rem]"
                                                    style={isLong ? {
                                                        maskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)',
                                                        WebkitMaskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)',
                                                    } : undefined}
                                                >
                                                    <p className="whitespace-pre-wrap">{snippet}{isLong ? '...' : ''}</p>
                                                </div>
                                            );
                                        })()}
                                        {notification.data.url && (
                                            <div className="mt-3">
                                                <Link
                                                    href={notification.data.url}
                                                    className="inline-flex items-center text-[11px] font-semibold text-primary hover:underline gap-1 group/link group-hover:text-white"
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
                <DropdownMenuSeparator className="m-0" />
                <DropdownMenuItem asChild className="p-0 focus:bg-transparent hover:bg-transparent">
                    <Link
                        href={NotificationActions.index.url()}
                        className="flex w-full items-center justify-center py-3 text-xs font-semibold text-primary transition-colors"
                    >
                        View All Notifications
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
