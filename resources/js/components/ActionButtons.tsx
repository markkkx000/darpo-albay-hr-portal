import { Link } from '@inertiajs/react';
import { Edit, Eye, Trash2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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
        className="btn-ghost-specular border-none h-10 w-10 p-0 rounded-full hover:scale-110 transition-transform"
    >
        {href ? (
            <Link href={href} title={title} aria-label={title}>
                <Eye className="h-5 w-5" />
            </Link>
        ) : (
            <Eye className="h-5 w-5" />
        )}
    </Button>
);

export const EditActionButton = ({ href, onClick, title }: ActionButtonProps) => (
    <Button 
        size="sm" 
        asChild={!!href}
        onClick={onClick}
        className="btn-ghost-specular border-none h-10 w-10 p-0 rounded-full hover:scale-110 transition-transform"
    >
        {href ? (
            <Link href={href} title={title} aria-label={title}>
                <Edit className="h-5 w-5" />
            </Link>
        ) : (
            <Edit className="h-5 w-5" />
        )}
    </Button>
);

export const DeleteActionButton = ({ href, onClick, title }: ActionButtonProps) => (
    <Button 
        size="sm" 
        asChild={!!href}
        onClick={onClick}
        className="btn-ghost-danger-specular border-none h-10 w-10 p-0 rounded-full hover:scale-110 transition-transform"
    >
        {href ? (
            <Link href={href} title={title} aria-label={title}>
                <Trash2 className="h-5 w-5" />
            </Link>
        ) : (
            <Trash2 className="h-5 w-5" />
        )}
    </Button>
);

export const RestoreActionButton = ({ href, onClick, title }: ActionButtonProps) => (
    <Button 
        size="sm" 
        asChild={!!href}
        onClick={onClick}
        className="btn-ghost-specular border-none h-10 w-10 p-0 rounded-full hover:scale-110 transition-transform"
    >
        {href ? (
            <Link href={href} title={title} aria-label={title}>
                <RotateCcw className="h-5 w-5" />
            </Link>
        ) : (
            <RotateCcw className="h-5 w-5" />
        )}
    </Button>
);

interface GenericActionButtonProps extends ActionButtonProps {
    icon: any;
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
    className?: string;
    disabled?: boolean;
}

export const ActionButton = ({ href, onClick, title, icon: Icon, variant = "ghost", className, disabled }: GenericActionButtonProps) => (
    <Button 
        size="sm" 
        variant={variant}
        asChild={!!href}
        onClick={onClick}
        disabled={disabled}
        className={cn("border-none h-10 w-10 p-0 rounded-full hover:scale-110 transition-transform", className)}
    >
        {href ? (
            <Link href={href} title={title} aria-label={title}>
                <Icon className="h-5 w-5" />
            </Link>
        ) : (
            <Icon className="h-5 w-5" />
        )}
    </Button>
);
