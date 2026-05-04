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
        <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg w-fit mb-6 border border-border/50">
            {tabs.map((tab) => (
                <Link
                    key={tab.title}
                    href={tab.href}
                    className={cn(
                        "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all",
                        tab.active 
                            ? "bg-white dark:bg-gray-800 text-primary shadow-sm" 
                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                >
                    <tab.icon className="h-4 w-4" />
                    {tab.title}
                </Link>
            ))}
        </div>
    );
}
