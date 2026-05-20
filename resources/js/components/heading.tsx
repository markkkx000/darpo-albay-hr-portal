import { cn } from '@/lib/utils';

export default function Heading({
    title,
    description,
    variant = 'default',
    as: Tag = 'h2',
    className,
}: {
    title: string;
    description?: string;
    variant?: 'default' | 'small';
    as?: 'h1' | 'h2' | 'h3';
    className?: string;
}) {
    return (
        <header className={variant === 'small' ? '' : 'mb-8 space-y-0.5'}>
            <Tag
                className={cn(
                    variant === 'small'
                        ? 't-headline mb-0.5'
                        : 't-display !text-4xl lg:!text-5xl',
                    className
                )}
            >
                {title}
            </Tag>
            {description && (
                <p className="text-sm text-muted-foreground">{description}</p>
            )}
        </header>
    );
}
