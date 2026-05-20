import type { ReactNode } from 'react';
import Heading from '@/components/heading';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
    title: string;
    description?: string;
    actions?: ReactNode;
    className?: string;
}

export default function PageHeader({ title, description, actions, className }: PageHeaderProps) {
    return (
        <div className={cn("matte-card elev-2 mb-6 flex flex-col justify-between gap-4 rounded-2xl px-6 py-5 md:flex-row md:items-center", className)}>
            <div className="flex items-center gap-3">
                <Heading title={title} description={description} as="h1" variant="small" />
            </div>
            {actions && (
                <div className="flex w-full items-center gap-2 sm:w-auto">
                    {actions}
                </div>
            )}
        </div>
    );
}
export { PageHeader };
