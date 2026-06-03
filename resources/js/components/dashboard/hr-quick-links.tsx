import { Link } from '@inertiajs/react';
import { Users, Calendar, Clock, Megaphone } from 'lucide-react';
import announcements from '@/routes/announcements';
import attendance from '@/routes/attendance';
import leave from '@/routes/leave';
import personnel from '@/routes/personnel';

export function HrQuickLinks() {
    return (
        <div className="grid grid-cols-2 gap-2 h-full">
            <Link href={personnel.index().url} className="matte-card elev-2 p-3 text-center hover:bg-muted/50 transition-all duration-200 active:scale-[0.98] focus-visible:outline-primary border border-border-2 flex flex-col items-center justify-center h-full min-h-[190px] group">
                <Users className="h-6 w-6 mb-2 text-primary opacity-70 group-hover:scale-110 group-hover:opacity-100 transition-all duration-200" />
                <div className="text-sm font-bold">Employee Directory</div>
            </Link>
            <Link href={leave.index().url} className="matte-card elev-2 p-3 text-center hover:bg-muted/50 transition-all duration-200 active:scale-[0.98] focus-visible:outline-primary border border-border-2 flex flex-col items-center justify-center h-full min-h-[190px] group">
                <Calendar className="h-6 w-6 mb-2 text-primary opacity-70 group-hover:scale-110 group-hover:opacity-100 transition-all duration-200" />
                <div className="text-sm font-bold">Leave Management</div>
            </Link>
            <Link href={attendance.manage.records.index().url} className="matte-card elev-2 p-3 text-center hover:bg-muted/50 transition-all duration-200 active:scale-[0.98] focus-visible:outline-primary border border-border-2 flex flex-col items-center justify-center h-full min-h-[190px] group">
                <Clock className="h-6 w-6 mb-2 text-primary opacity-70 group-hover:scale-110 group-hover:opacity-100 transition-all duration-200" />
                <div className="text-sm font-bold">Attendance Records</div>
            </Link>
            <Link href={announcements.manage().url} className="matte-card elev-2 p-3 text-center hover:bg-muted/50 transition-all duration-200 active:scale-[0.98] focus-visible:outline-primary border border-border-2 flex flex-col items-center justify-center h-full min-h-[190px] group">
                <Megaphone className="h-6 w-6 mb-2 text-primary opacity-70 group-hover:scale-110 group-hover:opacity-100 transition-all duration-200" />
                <div className="text-sm font-bold">Announcements</div>
            </Link>
        </div>
    );
}
