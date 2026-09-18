import { Link } from '@inertiajs/react';
import { Edit, Eye, Trash2, RotateCcw, Archive } from 'lucide-react';
import type { ComponentType } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ActionButtonProps {
    href?: string;
    onClick?: (e: React.MouseEvent) => void;
    title: string;
}

interface GenericActionButtonProps extends ActionButtonProps {
    icon: ComponentType<{ className?: string }>;
    variant?: React.ComponentProps<typeof Button>['variant'];
    className?: string;
    disabled?: boolean;
}

export const ActionButton = ({
    href,
    onClick,
    title,
    icon: Icon,
    variant = 'ghost',
    className,
    disabled,
}: GenericActionButtonProps) => (
    <Button
        size="icon"
        variant={variant}
        asChild={!!href}
        onClick={onClick}
        disabled={disabled}
        className={cn(
            'group rounded-full border-none transition-transform hover:scale-110 dark:hover:text-black',
            className,
        )}
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
    <ActionButton
        {...props}
        icon={Eye}
        className="btn-ghost-specular rounded-full border-none transition-transform hover:scale-110"
    />
);

export const EditActionButton = (props: ActionButtonProps) => (
    <ActionButton
        {...props}
        icon={Edit}
        className="btn-ghost-specular rounded-full border-none transition-transform hover:scale-110"
    />
);

export const DeleteActionButton = (props: ActionButtonProps) => (
    <ActionButton
        {...props}
        icon={Trash2}
        variant="ghost-destructive"
        className="btn-ghost-danger-specular rounded-full border-none transition-transform hover:scale-110"
    />
);

export const RestoreActionButton = (props: ActionButtonProps) => (
    <ActionButton
        {...props}
        icon={RotateCcw}
        className="btn-ghost-specular rounded-full border-none transition-transform hover:scale-110"
    />
);

export const ArchiveActionButton = (props: ActionButtonProps) => (
    <ActionButton
        {...props}
        icon={Archive}
        variant="ghost-destructive"
        className="btn-ghost-danger-specular rounded-full border-none transition-transform hover:scale-110"
    />
);
