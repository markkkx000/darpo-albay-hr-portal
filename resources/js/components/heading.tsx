export default function Heading({
    title,
    description,
    variant = 'default',
    as: Tag = 'h2',
}: {
    title: string;
    description?: string;
    variant?: 'default' | 'small';
    as?: 'h1' | 'h2' | 'h3';
}) {
    return (
        <header className={variant === 'small' ? '' : 'mb-8 space-y-0.5'}>
            <Tag
                className={
                    variant === 'small'
                        ? 't-headline mb-0.5'
                        : 't-title'
                }
            >
                {title}
            </Tag>
            {description && (
                <p className="text-sm text-muted-foreground">{description}</p>
            )}
        </header>
    );
}
