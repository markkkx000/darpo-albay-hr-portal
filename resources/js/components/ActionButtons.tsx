import { Link } from '@inertiajs/react';
import { Edit, Eye, Trash2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ActionButtonProps {
    href?: string;
    onClick?: (e: React.MouseEvent) => void;
    title: string;
}

export const ViewActionButton = ({ href, onClick, title }: ActionButtonProps) => (
    <Button 
        size="sm" 
        asChild={!!href}
        onClick={onClick}
        className="btn-ghost-specular border-none h-8 w-8 p-0 rounded-full hover:scale-110 transition-transform"
    >
        {href ? (
            <Link href={href} title={title} aria-label={title}>
                <Eye className="h-4 w-4" />
            </Link>
        ) : (
            <Eye className="h-4 w-4" />
        )}
    </Button>
);

export const EditActionButton = ({ href, onClick, title }: ActionButtonProps) => (
    <Button 
        size="sm" 
        asChild={!!href}
        onClick={onClick}
        className="btn-ghost-specular border-none h-8 w-8 p-0 rounded-full hover:scale-110 transition-transform"
    >
        {href ? (
            <Link href={href} title={title} aria-label={title}>
                <Edit className="h-4 w-4" />
            </Link>
        ) : (
            <Edit className="h-4 w-4" />
        )}
    </Button>
);

export const DeleteActionButton = ({ href, onClick, title }: ActionButtonProps) => (
    <Button 
        size="sm" 
        asChild={!!href}
        onClick={onClick}
        className="btn-ghost-danger-specular border-none h-8 w-8 p-0 rounded-full hover:scale-110 transition-transform"
    >
        {href ? (
            <Link href={href} title={title} aria-label={title}>
                <Trash2 className="h-4 w-4" />
            </Link>
        ) : (
            <Trash2 className="h-4 w-4" />
        )}
    </Button>
);

export const RestoreActionButton = ({ href, onClick, title }: ActionButtonProps) => (
    <Button 
        size="sm" 
        asChild={!!href}
        onClick={onClick}
        className="btn-ghost-specular border-none h-8 w-8 p-0 rounded-full hover:scale-110 transition-transform"
    >
        {href ? (
            <Link href={href} title={title} aria-label={title}>
                <RotateCcw className="h-4 w-4" />
            </Link>
        ) : (
            <RotateCcw className="h-4 w-4" />
        )}
    </Button>
);
