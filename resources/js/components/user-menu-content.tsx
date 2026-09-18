import { Link, router } from '@inertiajs/react';
import { LogOut, Settings, Ticket } from 'lucide-react';
import {
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useSidebar } from '@/components/ui/sidebar';
import { UserInfo } from '@/components/user-info';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { logout, userinfo } from '@/routes';
import { edit as editPreferences } from '@/routes/preferences';
import { index as supportTicketsIndex } from '@/routes/supporttickets';
import type { User } from '@/types';

type Props = {
    user: User;
};

export function UserMenuContent({ user }: Props) {
    const mobileCleanup = useMobileNavigation();
    const { setOpenMobile } = useSidebar();

    const cleanup = () => {
        mobileCleanup();
        setOpenMobile(false);
    };

    const handleLogout = () => {
        cleanup();
        router.flushAll();
    };

    return (
        <>
            <DropdownMenuLabel className="p-0 font-normal">
                <Link
                    href={userinfo()}
                    className="group flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:item-hover-gradient hover:text-black"
                    onClick={cleanup}
                >
                    <UserInfo user={user} showEmail={true} />
                </Link>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                    <Link
                        className="group block w-full cursor-pointer rounded-md p-2 hover:item-hover-gradient hover:text-black"
                        href={editPreferences()}
                        prefetch
                        onClick={cleanup}
                    >
                        <div className="flex items-center">
                            <Settings className="mr-2 h-4 w-4 text-muted-foreground group-hover:text-black" />
                            <span className="font-medium">Settings</span>
                        </div>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link
                        className="group block w-full cursor-pointer rounded-md p-2 hover:item-hover-gradient hover:text-black"
                        href={supportTicketsIndex.url()}
                        prefetch
                        onClick={cleanup}
                    >
                        <div className="flex items-center">
                            <Ticket className="mr-2 h-4 w-4 text-muted-foreground group-hover:text-black" />
                            <span className="font-medium">My Tickets</span>
                        </div>
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
                <Link
                    className="group block w-full cursor-pointer rounded-md p-2 hover:item-hover-gradient hover:text-black"
                    href={logout()}
                    as="button"
                    onClick={handleLogout}
                    data-test="logout-button"
                >
                    <div className="flex items-center">
                        <LogOut className="mr-2 h-4 w-4 text-muted-foreground group-hover:text-black" />
                        <span className="font-medium">Log out</span>
                    </div>
                </Link>
            </DropdownMenuItem>
        </>
    );
}
