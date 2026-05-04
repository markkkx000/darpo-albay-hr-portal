type Props = {
    auth?: {
        user?: any;
        roles?: string[];
    };
};

export default function AppLogo({ auth }: Props) {
    const isSuperAdmin = auth?.roles?.includes('super_admin');
    const isHR = auth?.roles?.includes('hr_admin') || auth?.roles?.includes('hr_staff');
    const title = isSuperAdmin ? 'Admin Dashboard' : isHR ? 'HR Dashboard' : 'Employee Dashboard';

    return (
        <>
            <img
                src="/dar_logo.png"
                alt="DAR Logo"
                className="h-7 w-7 object-contain"
            />
            <div className="ml-1 flex-1 text-left text-sm group-data-[collapsible=icon]:hidden">
                <span className="mb-0.5 truncate leading-tight font-semibold">
                    {title}
                </span>
            </div>
        </>
    );
}
