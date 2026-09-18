import { Link } from '@inertiajs/react';
import { Users, Calendar, Clock, Megaphone } from 'lucide-react';
import announcements from '@/routes/announcements';
import attendance from '@/routes/attendance';
import leave from '@/routes/leave';
import personnel from '@/routes/personnel';

export function HrQuickLinks() {
    return (
        <div className="grid h-full grid-cols-2 gap-2">
            <Link
                href={personnel.index().url}
                className="matte-card elev-2 group flex h-full min-h-[190px] flex-col items-center justify-center border border-border-2 p-3 text-center transition-all duration-200 hover:bg-muted/50 focus-visible:outline-primary active:scale-[0.98]"
            >
                <Users className="mb-2 h-6 w-6 text-primary opacity-70 transition-all duration-200 group-hover:scale-110 group-hover:opacity-100" />
                <div className="text-sm font-bold">Employee Directory</div>
            </Link>
            <Link
                href={leave.index().url}
                className="matte-card elev-2 group flex h-full min-h-[190px] flex-col items-center justify-center border border-border-2 p-3 text-center transition-all duration-200 hover:bg-muted/50 focus-visible:outline-primary active:scale-[0.98]"
            >
                <Calendar className="mb-2 h-6 w-6 text-primary opacity-70 transition-all duration-200 group-hover:scale-110 group-hover:opacity-100" />
                <div className="text-sm font-bold">Leave Management</div>
            </Link>
            <Link
                href={attendance.manage.records.index().url}
                className="matte-card elev-2 group flex h-full min-h-[190px] flex-col items-center justify-center border border-border-2 p-3 text-center transition-all duration-200 hover:bg-muted/50 focus-visible:outline-primary active:scale-[0.98]"
            >
                <Clock className="mb-2 h-6 w-6 text-primary opacity-70 transition-all duration-200 group-hover:scale-110 group-hover:opacity-100" />
                <div className="text-sm font-bold">Attendance Records</div>
            </Link>
            <Link
                href={announcements.manage().url}
                className="matte-card elev-2 group flex h-full min-h-[190px] flex-col items-center justify-center border border-border-2 p-3 text-center transition-all duration-200 hover:bg-muted/50 focus-visible:outline-primary active:scale-[0.98]"
            >
                <Megaphone className="mb-2 h-6 w-6 text-primary opacity-70 transition-all duration-200 group-hover:scale-110 group-hover:opacity-100" />
                <div className="text-sm font-bold">Announcements</div>
            </Link>
        </div>
    );
}
