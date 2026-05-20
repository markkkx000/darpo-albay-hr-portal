import { Link } from '@inertiajs/react';
import type { ComponentType } from 'react';
import { Edit, Eye, Trash2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ActionButtonProps {
    href?: string;
    onClick?: (e: React.MouseEvent) => void;
    title: string;
}

interface GenericActionButtonProps extends ActionButtonProps {
    icon: ComponentType<{ className?: string }>;
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
    className?: string;
    disabled?: boolean;
}

export const ActionButton = ({ href, onClick, title, icon: Icon, variant = "ghost", className, disabled }: GenericActionButtonProps) => (
    <Button
        size="icon"
        variant={variant}
        asChild={!!href}
        onClick={onClick}
        disabled={disabled}
        className={cn("border-none rounded-full hover:scale-110 transition-transform dark:hover:text-black group", className)}
    >
        {href ? (
            <Link href={href} title={title} aria-label={title}>
                <Icon className="h-4 w-4 transition-transform duration-300 group-hover:rotate-12" />
            </Link>
        ) : (
            <Icon className="h-4 w-4 transition-transform duration-300 group-hover:rotate-12" />
        )}
    </Button>
);

export const ViewActionButton = (props: ActionButtonProps) => (
    <ActionButton {...props} icon={Eye} className="btn-ghost-specular border-none rounded-full hover:scale-110 transition-transform" />
);

export const EditActionButton = (props: ActionButtonProps) => (
    <ActionButton {...props} icon={Edit} className="btn-ghost-specular border-none rounded-full hover:scale-110 transition-transform" />
);

export const DeleteActionButton = (props: ActionButtonProps) => (
    <ActionButton {...props} icon={Trash2} className="btn-ghost-danger-specular border-none rounded-full hover:scale-110 transition-transform" />
);

export const RestoreActionButton = (props: ActionButtonProps) => (
    <ActionButton {...props} icon={RotateCcw} className="btn-ghost-specular border-none rounded-full hover:scale-110 transition-transform" />
);
