import { usePage } from '@inertiajs/react';
import { Shield, Users } from 'lucide-react';
import { SlidingTabs } from '@/components/ui/sliding-tabs';
import RolesRoutes from '@/routes/roles';

export function RolesNavigation() {
    const { url } = usePage();

    const tabs = [
        {
            value: 'roles',
            label: 'Roles',
            href: RolesRoutes.index().url,
            icon: Shield,
            active: url === '/roles' || url.startsWith('/roles?'),
        },
        {
            value: 'users',
            label: 'User Assignments',
            href: RolesRoutes.users.index().url,
            icon: Users,
            active: url.startsWith('/roles/users'),
        },
    ];

    return (
        <div className="mb-6">
            <SlidingTabs layoutId="roles-nav-active" tabs={tabs} />
        </div>
    );
}
