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
import { toast } from 'sonner';
import Heading from '@/components/heading';
import { Pagination } from '@/components/Pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this announcement?')) {
            router.delete(destroy(id).url, {
                onSuccess: () => toast.success('Announcement deleted'),
            });
        }
    };

    const handlePublish = (id: number) => {
        if (confirm('Are you sure you want to publish this announcement? This will notify all targeted users.')) {
            router.post(publish(id).url, {}, {
                onSuccess: () => toast.success('Announcement published'),
            });
        }
    };

    return (
        <>
            <Head title="Manage Announcements" />

            <div className="p-4 w-full space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <Heading 
                        title="Manage Announcements" 
                        description="Create, edit, and publish announcements for the organization."
                    />
                    <Link href={create().url}>
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" />
                            Create Announcement
                        </Button>
                    </Link>
                </div>

                <Card className="border-none shadow-md overflow-hidden bg-background">
                    <CardHeader className="bg-muted/30 pb-4">
                        <CardTitle className="text-lg font-semibold flex items-center gap-2">
                            <Megaphone className="h-5 w-5 text-primary" />
                            All Announcements
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-muted/50 text-muted-foreground font-medium border-b border-muted/30">
                                    <tr>
                                        <th className="px-6 py-4">Title</th>
                                        <th className="px-6 py-4">Target</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Priority</th>
                                        <th className="px-6 py-4">Created By</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-muted/30">
                                    {announcements.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-10 text-center text-muted-foreground">
                                                No announcements found.
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
                                                <td className="px-6 py-4">
                                                    <Badge variant={announcement.status === 'published' ? 'default' : 'secondary'} className="capitalize font-normal">
                                                        {announcement.status}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <Badge variant="outline" className={cn(
                                                        "capitalize font-normal",
                                                        announcement.priority === 'high' ? 'border-red-500 text-red-500 bg-red-500/5' :
                                                        announcement.priority === 'low' ? 'border-blue-500 text-blue-500 bg-blue-500/5' : 
                                                        'border-gray-500 text-gray-500 bg-gray-500/5'
                                                    )}>
                                                        {announcement.priority}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4 text-muted-foreground">
                                                    {announcement.author?.name || 'Unknown'}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon">
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
                                                                    <DropdownMenuItem onClick={() => handlePublish(announcement.id)} className="gap-2 text-green-600">
                                                                        <Send className="h-4 w-4" /> Publish
                                                                    </DropdownMenuItem>
                                                                </>
                                                            )}
                                                            
                                                            <DropdownMenuItem onClick={() => handleDelete(announcement.id)} className="gap-2 text-destructive">
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
        </>
    );
}

Manage.layout = {
    breadcrumbs: [
        { title: 'Announcements', href: index().url },
        { title: 'Manage', href: '#' },
    ],
};
