import { Head, Link, router, useHttp } from '@inertiajs/react';
import { Bell, ChevronDown, ChevronUp, CheckCheck, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import * as NotificationActions from '@/actions/App/Modules/Notifications/Controllers/NotificationController';
import { Pagination } from '@/components/Pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { Notification, PaginatedResponse } from '@/types';

interface Props {
    notifications: PaginatedResponse<Notification>;
}

export default function Index({ notifications }: Props) {
    const { post: httpPost } = useHttp();
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

    const toggleExpand = (id: string) => {
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


    const markAsUnread = (id: string) => {
        httpPost(NotificationActions.unread.url({ id }), {
            onSuccess: () => {
                toast.success('Notification marked as unread');
                router.reload({ only: ['notifications', 'appNotifications'] });
            },
        });
    };

    const markAllAsRead = () => {
        httpPost(NotificationActions.readAll.url(), {
            onSuccess: () => {
                toast.success('All notifications marked as read');
                router.reload({ only: ['notifications', 'appNotifications'] });
            }
        });
    };

    return (
        <>
            <Head title="Notifications" />

            <div className="flex h-full flex-col gap-4 p-4 md:gap-8 md:p-8">
                <div className="matte-card elev-1 flex items-center justify-between px-6 py-5 rounded-2xl">
                    <div className="flex items-center gap-3">
                        <h1 className="t-headline">Notifications</h1>
                        <p className="text-muted-foreground text-sm mt-2">
                            Manage your system and module notifications.
                        </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={markAllAsRead} className="gap-2">
                        <CheckCheck className="h-4 w-4" />
                        Mark all as read
                    </Button>
                </div>

                <Card className="flex-1 matte-card elev-2 border-none">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Recent Notifications</CardTitle>
                        <CardDescription>
                            All notifications delivered to your account in the last year.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-sidebar-border/30">
                            {notifications.data.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
                                    <Bell className="h-12 w-12 mb-4 opacity-20" />
                                    <p>No notifications found</p>
                                </div>
                            ) : (
                                notifications.data.map((notification) => (
                                    <div 
                                        key={notification.id} 
                                        className={cn(
                                            "flex flex-col p-4 transition-colors hover:bg-muted/10", 
                                            !notification.read_at && "bg-primary/[0.02]"
                                        )}
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1 space-y-1">
                                                <div className="flex items-center gap-3">
                                                    <span className={cn(
                                                        "text-base font-semibold leading-tight", 
                                                        notification.data.priority === 'high' ? "text-destructive" : "text-foreground",
                                                        !notification.read_at && "font-bold"
                                                    )}>
                                                        {notification.data.title}
                                                    </span>
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="outline" className="capitalize">
                                                            {notification.data.type}
                                                        </Badge>
                                                        {notification.data.priority === 'high' && (
                                                            <Badge variant="destructive" className="h-4 px-1.5 text-[10px] uppercase font-bold">High</Badge>
                                                        )}
                                                        {!notification.read_at && (
                                                            <Badge variant="default" className="h-4 px-1.5 text-[10px] uppercase font-bold">New</Badge>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    <span className="font-medium text-foreground/70">{notification.data.from}</span>
                                                    <span>•</span>
                                                    <span>{new Date(notification.created_at).toLocaleString()}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {notification.read_at && (
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm" 
                                                        className="h-8 gap-2 text-xs text-muted-foreground hover:text-primary" 
                                                        onClick={() => markAsUnread(notification.id)}
                                                    >
                                                        <RotateCcw className="h-3.5 w-3.5" />
                                                        Mark as unread
                                                    </Button>
                                                )}
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="h-8 w-8" 
                                                    onClick={() => toggleExpand(notification.id)}
                                                >
                                                    {expandedIds.has(notification.id) ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                                </Button>
                                            </div>
                                        </div>
                                        {expandedIds.has(notification.id) && (
                                            <div className="mt-4 animate-in slide-in-from-top-1 duration-200">
                                                <div className="rounded-xl bg-muted/30 p-4 text-sm leading-relaxed text-foreground/90 border border-sidebar-border/20">
                                                    {(() => {
                                                        const body = notification.data.body ?? notification.data.message ?? '';
                                                        const isHtml = /<[a-z][\s\S]*>/i.test(body);

                                                        return (
                                                            <div className="overflow-hidden max-h-[12rem] notification-body-fade">
                                                                {isHtml ? (
                                                                    <div
                                                                        className="prose prose-sm dark:prose-invert max-w-none [&_p]:my-1 [&_li]:my-0.5 [&_ul]:my-2 [&_ol]:my-2 [&_blockquote]:my-2 [&_img]:max-w-full [&_img]:rounded-lg"
                                                                        dangerouslySetInnerHTML={{ __html: body }}
                                                                    />
                                                                ) : (
                                                                    <p className="whitespace-pre-wrap">{body}</p>
                                                                )}
                                                            </div>
                                                        );
                                                    })()}
                                                    {notification.data.url && (
                                                        <div className="mt-4 pt-4 border-t border-sidebar-border/20">
                                                            <Link 
                                                                href={notification.data.url} 
                                                                className="inline-flex items-center text-sm font-semibold text-primary hover:underline gap-1 group"
                                                                onClick={(e) => {
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
                                                                View full
                                                                <span className="transition-transform group-hover:translate-x-1">→</span>
                                                            </Link>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                        <div className="px-6 border-t border-sidebar-border/30">
                            <Pagination links={notifications.links} meta={notifications} />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

Index.layout = {
    breadcrumbs: [
        { title: 'Notifications', href: NotificationActions.index().url },
    ],
};
