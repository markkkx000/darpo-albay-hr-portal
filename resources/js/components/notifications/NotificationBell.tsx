import { Link, router, usePage } from '@inertiajs/react';
import { Bell, ChevronDown, ChevronUp, X } from 'lucide-react';
import { useState } from 'react';
import * as NotificationActions from '@/actions/App/Modules/Notifications/Controllers/NotificationController';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import type { Notification } from '@/types';

export default function NotificationBell() {
    const { notifications: sharedNotifications } = usePage().props;
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(false);
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

    const unreadCount = sharedNotifications?.unread_count ?? 0;

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

    const markAsRead = async (id: string) => {
        try {
            const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content;
            await fetch(NotificationActions.read.url({ id }), { 
                method: 'POST', 
                headers: { 
                    'X-CSRF-TOKEN': csrfToken,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                } 
            });
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n));
            router.reload({ only: ['notifications'] });
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content;
            await fetch(NotificationActions.readAll.url(), { 
                method: 'POST', 
                headers: { 
                    'X-CSRF-TOKEN': csrfToken,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                } 
            });
            setNotifications(prev => prev.map(n => n.data.dismissible ? { ...n, read_at: new Date().toISOString() } : n));
            router.reload({ only: ['notifications'] });
        } catch (error) {
            console.error('Failed to mark all as read:', error);
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
                <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-full" aria-label="Notifications">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <Badge variant="destructive" className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] animate-in zoom-in">
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 p-0 shadow-xl border-sidebar-border/50" sideOffset={8}>
                <DropdownMenuLabel className="flex items-center justify-between p-4 bg-muted/30">
                    <span className="font-semibold text-sm">Notifications</span>
                    {unreadCount > 0 && (
                        <Button variant="ghost" size="sm" onClick={markAllAsRead} className="h-auto p-0 text-xs text-primary hover:bg-transparent hover:underline">
                            Mark all as read
                        </Button>
                    )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="m-0" />
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
                                    "flex flex-col border-b border-sidebar-border/30 p-4 transition-colors hover:bg-muted/20 cursor-pointer", 
                                    !notification.read_at && "bg-primary/[0.03]"
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
                                                <Badge variant="outline" className="h-3 px-1 border-destructive text-destructive text-[9px] uppercase tracking-wider font-bold">High</Badge>
                                            )}
                                            {!notification.read_at && (
                                                <span className="flex h-2 w-2 rounded-full bg-primary" />
                                            )}
                                        </div>
                                        <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                                            <span className="font-medium text-foreground/70">{notification.data.from}</span>
                                            <span>•</span>
                                            <span>{new Date(notification.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        {notification.data.dismissible && !notification.read_at && (
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="h-7 w-7 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted" 
                                                aria-label="Dismiss notification"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    markAsRead(notification.id);
                                                }}
                                            >
                                                <X className="h-3.5 w-3.5" />
                                            </Button>
                                        )}
                                        <div className="flex h-7 w-7 items-center justify-center text-muted-foreground/50">
                                            {expandedIds.has(notification.id) ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                        </div>
                                    </div>
                                </div>
                                {expandedIds.has(notification.id) && (
                                    <div className="mt-3 text-xs text-foreground/80 leading-relaxed animate-in slide-in-from-top-1 duration-200">
                                        <p className="whitespace-pre-wrap">{notification.data.body}</p>
                                        {notification.data.url && (
                                            <div className="mt-3">
                                                <Link 
                                                    href={notification.data.url} 
                                                    className="inline-flex items-center text-[11px] font-semibold text-primary hover:underline gap-1 group"
                                                    onClick={(e) => e.stopPropagation()}
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
                <DropdownMenuItem asChild className="p-0 focus:bg-muted/50">
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
