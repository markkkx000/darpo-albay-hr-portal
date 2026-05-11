import { Link, usePage } from '@inertiajs/react';
import { Shield, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import RolesRoutes from '@/routes/roles';

export function RolesNavigation() {
    const { url } = usePage();
    
    const tabs = [
        {
            title: 'Roles',
            href: RolesRoutes.index().url,
            icon: Shield,
            active: url === '/roles' || url.startsWith('/roles?'),
        },
        {
            title: 'User Assignments',
            href: RolesRoutes.users.index().url,
            icon: Users,
            active: url.startsWith('/roles/users'),
        },
    ];

    return (
        <div className="flex items-center space-x-1 rounded-full border border-border-1 bg-surface-2 p-1 w-fit mb-6">
            {tabs.map((tab) => (
                <Link
                    key={tab.title}
                    href={tab.href}
                    className={cn('flex items-center gap-2 px-4 py-1.5 text-sm font-bold rounded-full transition-all', tab.active ? 'btn-specular' : 'text-muted-foreground hover:text-foreground')}
                >
                    <tab.icon className="h-4 w-4" />
                    {tab.title}
                </Link>
            ))}
        </div>
    );
}
