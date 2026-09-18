import { Head, Link, router } from '@inertiajs/react';
import {
    Plus,
    Edit2,
    Trash2,
    Send,
    Eye,
    MoreHorizontal,
    Megaphone,
    Calendar,
    Users,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import PageHeader from '@/components/page-header';
import { Pagination } from '@/components/Pagination';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn, formatDate } from '@/lib/utils';
import {
    create,
    edit,
    show,
    publish,
    destroy,
    index,
} from '@/routes/announcements';

interface Props {
    announcements: {
        data: any[];
        links: any[];
        meta: any;
    };
}

export default function Manage({ announcements }: Props) {
    const [announcementToDelete, setAnnouncementToDelete] = useState<
        any | null
    >(null);
    const [announcementToPublish, setAnnouncementToPublish] = useState<
        any | null
    >(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleDelete = () => {
        if (announcementToDelete) {
            router.delete(destroy(announcementToDelete.id).url, {
                onStart: () => setIsProcessing(true),
                onFinish: () => setIsProcessing(false),
                onSuccess: () => {
                    toast.success('Announcement deleted');
                    setAnnouncementToDelete(null);
                    router.clearHistory();
                },
                onError: () => {
                    toast.error('Failed to delete announcement');
                    setAnnouncementToDelete(null);
                },
            });
        }
    };

    const handlePublish = () => {
        if (announcementToPublish) {
            router.post(
                publish(announcementToPublish.id).url,
                {},
                {
                    onStart: () => setIsProcessing(true),
                    onFinish: () => setIsProcessing(false),
                    onSuccess: () => {
                        toast.success('Announcement published');
                        setAnnouncementToPublish(null);
                        router.clearHistory();
                    },
                    onError: () => {
                        toast.error('Failed to publish announcement');
                        setAnnouncementToPublish(null);
                    },
                },
            );
        }
    };

    return (
        <>
            <Head title="Manage Announcements" />

            <div className="w-full space-y-6 p-4">
                <PageHeader
                    title="Manage Announcements"
                    description="Create, edit, and publish announcements for the organization."
                    actions={
                        <Button
                            asChild
                            className="btn-ghost-specular gap-2 border-none px-6"
                        >
                            <Link href={create().url}>
                                <Plus className="h-4 w-4" />
                                Create Announcement
                            </Link>
                        </Button>
                    }
                />

                <Card className="matte-card elev-2 overflow-hidden border-none">
                    <CardHeader className="border-b border-muted/20 pb-4">
                        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                            <div className="sqicon sqicon-green rounded-xl p-2">
                                <Megaphone className="h-4 w-4" />
                            </div>
                            All Announcements
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="border-b border-muted/20 font-medium text-muted-foreground">
                                    <tr>
                                        <th className="px-6 py-4">Title</th>
                                        <th className="px-6 py-4 whitespace-nowrap">
                                            Target
                                        </th>
                                        <th className="px-6 py-4 text-center whitespace-nowrap">
                                            Status
                                        </th>
                                        <th className="px-6 py-4 text-center whitespace-nowrap">
                                            Priority
                                        </th>
                                        <th className="px-6 py-4 whitespace-nowrap">
                                            Created By
                                        </th>
                                        <th className="px-6 py-4 text-right whitespace-nowrap">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-muted/30">
                                    {announcements.data.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={6}
                                                className="px-6 py-16 text-center text-muted-foreground"
                                            >
                                                <div className="flex flex-col items-center gap-3">
                                                    <div className="sqicon sqicon-grey rounded-2xl p-4 opacity-40">
                                                        <Megaphone className="h-8 w-8" />
                                                    </div>
                                                    <p className="text-sm font-medium">
                                                        No announcements yet
                                                    </p>
                                                    <p className="max-w-[220px] text-xs opacity-60">
                                                        Create your first
                                                        announcement to notify
                                                        the organization.
                                                    </p>
                                                    <Link href={create().url}>
                                                        <Button
                                                            size="sm"
                                                            className="btn-specular mt-2 gap-2 rounded-full border-none px-4 py-4 shadow-md"
                                                        >
                                                            <Plus className="h-3.5 w-3.5" />
                                                            Create Announcement
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        announcements.data.map(
                                            (announcement) => (
                                                <tr
                                                    key={announcement.id}
                                                    className="transition-colors hover:bg-muted/10"
                                                >
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-wrap items-center gap-2 font-medium">
                                                            {announcement.title}
                                                            {announcement.is_event &&
                                                                announcement.event_date && (
                                                                    <span className="inline-flex items-center gap-1 rounded-sm bg-primary/10 px-1.5 py-0.5 text-[9px] font-bold tracking-wider whitespace-nowrap text-primary uppercase">
                                                                        EVENT:{' '}
                                                                        {formatDate(
                                                                            announcement.event_date,
                                                                        )}
                                                                    </span>
                                                                )}
                                                        </div>
                                                        <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                                                            <Calendar className="h-3 w-3" />
                                                            {formatDate(
                                                                announcement.created_at,
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center gap-1.5">
                                                            <Users className="h-3.5 w-3.5 text-muted-foreground" />
                                                            <span className="capitalize">
                                                                {
                                                                    announcement.target_type
                                                                }
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-center whitespace-nowrap">
                                                        <span
                                                            className={cn(
                                                                'rounded-full px-3 py-1 text-[10px] font-bold tracking-wider capitalize',
                                                                announcement.status ===
                                                                    'published'
                                                                    ? 'status-badge-permanent shadow-[0_0_15px_rgba(34,197,94,0.3)]'
                                                                    : 'status-badge-unknown opacity-80',
                                                            )}
                                                        >
                                                            {
                                                                announcement.status
                                                            }
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-center whitespace-nowrap">
                                                        {announcement.priority ===
                                                        'high' ? (
                                                            <span className="status-badge-danger animate-pulse rounded-full px-3 py-0.5 text-[10px] font-bold tracking-wider whitespace-nowrap uppercase">
                                                                High Priority
                                                            </span>
                                                        ) : (
                                                            <span className="text-xs font-medium text-muted-foreground capitalize">
                                                                Normal
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
                                                        {announcement.author
                                                            ?.name || 'Unknown'}
                                                    </td>
                                                    <td className="px-6 py-4 text-right whitespace-nowrap">
                                                        <div className="flex items-center justify-end gap-2">
                                                            {announcement.status ===
                                                                'draft' && (
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() =>
                                                                        setAnnouncementToPublish(
                                                                            announcement,
                                                                        )
                                                                    }
                                                                    className="gap-2 border-green-600/20 text-green-600 hover:bg-green-600/10 hover:text-green-700"
                                                                >
                                                                    <Send className="h-3.5 w-3.5" />{' '}
                                                                    Publish
                                                                </Button>
                                                            )}
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger
                                                                    asChild
                                                                >
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        aria-label={`Actions for ${announcement.title}`}
                                                                    >
                                                                        <MoreHorizontal className="h-4 w-4" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end">
                                                                    <DropdownMenuItem
                                                                        asChild
                                                                    >
                                                                        <Link
                                                                            href={
                                                                                show(
                                                                                    announcement.id,
                                                                                )
                                                                                    .url
                                                                            }
                                                                            className="gap-2"
                                                                        >
                                                                            <Eye className="h-4 w-4" />{' '}
                                                                            View
                                                                        </Link>
                                                                    </DropdownMenuItem>

                                                                    {announcement.status ===
                                                                        'draft' && (
                                                                        <DropdownMenuItem
                                                                            asChild
                                                                        >
                                                                            <Link
                                                                                href={
                                                                                    edit(
                                                                                        announcement.id,
                                                                                    )
                                                                                        .url
                                                                                }
                                                                                className="gap-2 text-primary"
                                                                            >
                                                                                <Edit2 className="h-4 w-4" />{' '}
                                                                                Edit
                                                                            </Link>
                                                                        </DropdownMenuItem>
                                                                    )}

                                                                    <DropdownMenuItem
                                                                        onClick={() =>
                                                                            setAnnouncementToDelete(
                                                                                announcement,
                                                                            )
                                                                        }
                                                                        className="gap-2 text-destructive"
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />{' '}
                                                                        Delete
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ),
                                        )
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="border-t border-muted/30 px-6">
                            <Pagination
                                links={announcements.links}
                                meta={announcements.meta}
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={!!announcementToDelete}
                onOpenChange={(open) =>
                    !open && !isProcessing && setAnnouncementToDelete(null)
                }
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Announcement?</DialogTitle>
                        <DialogDescription>
                            This will permanently delete{' '}
                            <strong>"{announcementToDelete?.title}"</strong>.
                            This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setAnnouncementToDelete(null)}
                            disabled={isProcessing}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isProcessing}
                        >
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Publish Confirmation Dialog */}
            <Dialog
                open={!!announcementToPublish}
                onOpenChange={(open) =>
                    !open && !isProcessing && setAnnouncementToPublish(null)
                }
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Publish Announcement?</DialogTitle>
                        <DialogDescription>
                            This will immediately notify all targeted users
                            about{' '}
                            <strong>"{announcementToPublish?.title}"</strong>.
                            Once published, this announcement cannot be
                            unpublished.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setAnnouncementToPublish(null)}
                            className="rounded-xl"
                            disabled={isProcessing}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handlePublish}
                            className="btn-specular gap-2 rounded-full border-none px-6 py-5 shadow-lg"
                            disabled={isProcessing}
                        >
                            <Send className="h-4 w-4" />
                            Publish Now
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

Manage.layout = {
    breadcrumbs: [
        { title: 'Announcements', href: index().url },
        { title: 'Manage', href: '#' },
    ],
};
