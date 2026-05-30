import { Link, router } from '@inertiajs/react';
import { LogOut, Settings } from 'lucide-react';
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
                    className="group flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:item-hover-gradient hover:text-black cursor-pointer rounded-lg"
                    onClick={cleanup}
                >
                    <UserInfo user={user} showEmail={true} />
                </Link>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                    <Link
                        className="group block w-full cursor-pointer hover:item-hover-gradient hover:text-black p-2 rounded-md"
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
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
                <Link
                    className="group block w-full cursor-pointer hover:item-hover-gradient hover:text-black p-2 rounded-md"
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
