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
    Users
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Pagination } from '@/components/Pagination';
import { Badge } from '@/components/ui/badge';
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
    DropdownMenuTrigger 
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
    const [announcementToDelete, setAnnouncementToDelete] = useState<any | null>(null);
    const [announcementToPublish, setAnnouncementToPublish] = useState<any | null>(null);

    const handleDelete = () => {
        if (announcementToDelete) {
            router.delete(destroy(announcementToDelete.id).url, {
                onSuccess: () => {
                    toast.success('Announcement deleted');
                    setAnnouncementToDelete(null);
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
            router.post(publish(announcementToPublish.id).url, {}, {
                onSuccess: () => {
                    toast.success('Announcement published');
                    setAnnouncementToPublish(null);
                },
                onError: () => {
                    toast.error('Failed to publish announcement');
                    setAnnouncementToPublish(null);
                },
            });
        }
    };

    return (
        <>
            <Head title="Manage Announcements" />

            <div className="p-4 w-full space-y-6">
                <div className="matte-card elev-1 mb-2 flex flex-col md:flex-row md:items-center justify-between gap-4 px-6 py-5 rounded-2xl">
                    <div className="flex items-center gap-3">
                        <h1 className="t-headline">Manage Announcements</h1>
                        <p className="text-muted-foreground text-sm mt-2">
                            Create, edit, and publish announcements for the organization.
                        </p>
                    </div>
                    <Link href={create().url}>
                        <Button className="btn-ghost-specular gap-2 px-6 py-5 border-none">
                            <Plus className="h-4 w-4" />
                            Create Announcement
                        </Button>
                    </Link>
                </div>

                <Card className="matte-card elev-2 border-none overflow-hidden">
                    <CardHeader className="border-b border-muted/20 pb-4">
                        <CardTitle className="text-lg font-semibold flex items-center gap-2">
                            <div className="sqicon sqicon-green p-2 rounded-xl">
                                <Megaphone className="h-4 w-4" />
                            </div>
                            All Announcements
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-muted-foreground font-medium border-b border-muted/20">
                                    <tr>
                                        <th className="px-6 py-4">Title</th>
                                        <th className="px-6 py-4">Target</th>
                                        <th className="px-6 py-4 text-center">Status</th>
                                        <th className="px-6 py-4 text-center">Priority</th>
                                        <th className="px-6 py-4">Created By</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-muted/30">
                                    {announcements.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-16 text-center text-muted-foreground">
                                                <div className="flex flex-col items-center gap-3">
                                                    <div className="sqicon sqicon-grey p-4 rounded-2xl opacity-40">
                                                        <Megaphone className="h-8 w-8" />
                                                    </div>
                                                    <p className="font-medium text-sm">No announcements yet</p>
                                                    <p className="text-xs opacity-60 max-w-[220px]">Create your first announcement to notify the organization.</p>
                                                    <Link href={create().url}>
                                                        <Button size="sm" className="btn-specular mt-2 gap-2 px-4 py-4 rounded-full shadow-md border-none">
                                                            <Plus className="h-3.5 w-3.5" />
                                                            Create Announcement
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        announcements.data.map((announcement) => (
                                            <tr key={announcement.id} className="hover:bg-muted/10 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="font-medium">{announcement.title}</div>
                                                    <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                                        <Calendar className="h-3 w-3" />
                                                        {formatDate(announcement.created_at)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-1.5">
                                                        <Users className="h-3.5 w-3.5 text-muted-foreground" />
                                                        <span className="capitalize">{announcement.target_type}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span 
                                                        className={cn(
                                                            "capitalize font-bold text-[10px] px-3 py-1 rounded-full tracking-wider",
                                                            announcement.status === 'published' 
                                                                ? "status-badge-permanent shadow-[0_0_15px_rgba(34,197,94,0.3)] animate-pulse" 
                                                                : "status-badge-unknown opacity-80"
                                                        )}
                                                    >
                                                        {announcement.status}
                                                    </span>
                                                </td>
                                                 <td className="px-6 py-4 text-center">
                                                    <span className={cn(
                                                        "uppercase font-bold text-[10px] px-3 py-0.5 rounded-full tracking-wider",
                                                        announcement.priority === 'high'
                                                            ? 'status-badge-danger animate-pulse'
                                                            : announcement.priority === 'low'
                                                            ? 'status-badge-unknown'
                                                            : 'status-badge-permanent'
                                                    )}>
                                                        {announcement.priority}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-muted-foreground">
                                                    {announcement.author?.name || 'Unknown'}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" aria-label={`Actions for ${announcement.title}`}>
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem asChild>
                                                                <Link href={show(announcement.id).url} className="gap-2">
                                                                    <Eye className="h-4 w-4" /> View
                                                                </Link>
                                                            </DropdownMenuItem>
                                                            
                                                            {announcement.status === 'draft' && (
                                                                <>
                                                                    <DropdownMenuItem asChild>
                                                                        <Link href={edit(announcement.id).url} className="gap-2 text-primary">
                                                                            <Edit2 className="h-4 w-4" /> Edit
                                                                        </Link>
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem onClick={() => setAnnouncementToPublish(announcement)} className="gap-2 text-green-600">
                                                                        <Send className="h-4 w-4" /> Publish
                                                                    </DropdownMenuItem>
                                                                </>
                                                            )}
                                                            
                                                            <DropdownMenuItem onClick={() => setAnnouncementToDelete(announcement)} className="gap-2 text-destructive">
                                                                <Trash2 className="h-4 w-4" /> Delete
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="px-6 border-t border-muted/30">
                            <Pagination links={announcements.links} meta={announcements.meta} />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Delete Confirmation Dialog */}
            <Dialog open={!!announcementToDelete} onOpenChange={(open) => !open && setAnnouncementToDelete(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Announcement?</DialogTitle>
                        <DialogDescription>
                            This will permanently delete <strong>"{announcementToDelete?.title}"</strong>. This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setAnnouncementToDelete(null)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleDelete}>Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Publish Confirmation Dialog */}
            <Dialog open={!!announcementToPublish} onOpenChange={(open) => !open && setAnnouncementToPublish(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Publish Announcement?</DialogTitle>
                        <DialogDescription>
                            This will immediately notify all targeted users about <strong>"{announcementToPublish?.title}"</strong>. Once published, this announcement cannot be unpublished.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setAnnouncementToPublish(null)} className="rounded-xl">Cancel</Button>
                        <Button onClick={handlePublish} className="btn-specular gap-2 px-6 py-5 rounded-full shadow-lg border-none">
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
