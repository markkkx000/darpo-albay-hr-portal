import type { LucideProps } from 'lucide-react';
import { icons } from 'lucide-react';

interface DynamicIconProps extends LucideProps {
    name: string;
}

/**
 * DynamicIcon renders a Lucide icon based on a string name.
 * If the icon name is not found, it falls back to 'LayoutDashboard'.
 */
export function DynamicIcon({ name, ...props }: DynamicIconProps) {
    // @ts-expect-error - indexing lucide icons by string
    const IconComponent = icons[name] || icons['LayoutDashboard'];

    return <IconComponent {...props} />;
}
