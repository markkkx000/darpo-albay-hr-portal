import {
    Mail,
    Phone,
    MapPin,
    Calendar,
    Briefcase,
    Building2,
    User as UserIcon,
    Building,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

const CURRENT_TIME = Date.now();

export interface Employee {
    id: number;
    first_name: string;
    middle_name: string | null;
    last_name: string;
    employee_number: string | null;
    email: string | null;
    contact_number: string | null;
    address: string | null;
    present_address: string | null;
    hire_date: string | null;
    date_hired_government: string | null;
    division?: { id: number; name: string };
    unit?: { name: string };
    positions?: Array<{ name: string; pivot: { is_primary: boolean } }>;
    appointment_status?: { name: string };
    mfa_enabled?: boolean;

    sex: string | null;
    date_of_birth: string | null;
    age: number | null;
    civil_status: string | null;
    eligibility: string | null;
    years_in_service: number | null;
    plantilla_number: string | null;
    plantilla_position: string | null;
    item_number: string | null;
    office_per_appointment: string | null;
    gsis_bp_number: string | null;
    philhealth: string | null;
    hdmf_pagibig_no: string | null;
    tin_number: string | null;
    lbp_account_number: string | null;
    prc_id_no: string | null;
    prc_expiration: string | null;
    orig_date_of_appointment: string | null;
    date_of_latest_appointment: string | null;
    date_of_assumption: string | null;
    date_of_separation: string | null;
    fund_code: string | null;
    func_activity_code: string | null;
    profile_picture: string | null;
    avatar?: string | null;
    promotion_histories?: any[];
    salary_grade: number | null;
    salary_step: number | null;
    monthly_salary: string | number | null;
}

interface Props {
    employee: Employee;
}

export function EmployeeCard({ employee }: Props) {
    const formatDate = (date: string | null) => {
        if (!date) {
            return 'Not set';
        }

        return new Date(date).toLocaleDateString([], {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const iconContainerClass =
        'p-2.5 rounded-xl border border-border/20 bg-muted/20';
    const iconClass = 'h-4 w-4 text-primary';

    return (
        <div className="matte-card elev-2 overflow-hidden">
            <div className="border-b border-border/40 bg-primary/5 p-6">
                <div className="flex flex-col items-center gap-6 md:flex-row md:items-start">
                    <Dialog>
                        <DialogTrigger asChild>
                            <button className="relative h-24 w-24 cursor-pointer overflow-hidden rounded-[24px] bg-surface-2 shadow-2xl ring-4 ring-surface-1 transition-transform duration-200 ease-out hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 active:scale-95">
                                <img
                                    src={
                                        employee.avatar ||
                                        '/img/pfp_placeholder.png'
                                    }
                                    alt="Profile"
                                    className="h-full w-full object-cover"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src =
                                            '/img/pfp_placeholder.png';
                                    }}
                                />
                            </button>
                        </DialogTrigger>
                        <DialogContent className="flex items-center justify-center overflow-hidden border-none bg-transparent p-0 shadow-none sm:max-w-xl">
                            <img
                                src={
                                    employee.avatar ||
                                    '/img/pfp_placeholder.png'
                                }
                                alt="Profile Full"
                                className="h-auto max-h-[85vh] w-full max-w-lg rounded-2xl object-contain shadow-2xl"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src =
                                        '/img/pfp_placeholder.png';
                                }}
                            />
                        </DialogContent>
                    </Dialog>
                    <div className="flex-1 space-y-1 text-center md:text-left">
                        <div className="flex flex-col justify-between gap-2 md:flex-row md:items-center">
                            <h2 className="text-3xl font-black tracking-tighter text-foreground">
                                {`${employee.last_name.toUpperCase()}, ${employee.first_name}${employee.middle_name ? ' ' + employee.middle_name : ''}`}
                            </h2>
                            <Badge
                                variant="outline"
                                className="mx-auto flex w-fit items-center gap-1.5 rounded-xl border-border-2 bg-surface-2 px-3 py-1 font-mono md:mx-0"
                            >
                                <span className="font-sans text-[10px] font-black tracking-wider text-muted-foreground uppercase">
                                    ID No.
                                </span>
                                <span>
                                    {employee.employee_number || 'NO-ID'}
                                </span>
                            </Badge>
                        </div>
                        <div className="flex items-center justify-center gap-2 font-bold text-foreground md:justify-start">
                            <Briefcase className="h-4 w-4" />
                            <span className="text-sm tracking-wide uppercase">
                                {employee.positions?.length
                                    ? employee.positions
                                          .map((p) => p.name)
                                          .join(' • ')
                                    : 'Unassigned Position'}
                            </span>
                        </div>
                        <div className="flex flex-col items-center gap-2 text-sm font-medium text-muted-foreground md:flex-row md:justify-start">
                            <div className="flex items-center gap-1">
                                <Building2 className="h-4 w-4" />
                                <span>
                                    {employee.division?.name ||
                                        'Division Not Set'}
                                </span>
                            </div>
                            {employee.unit?.name && (
                                <>
                                    <span className="hidden md:inline">
                                        &bull;
                                    </span>
                                    <div className="flex items-center gap-1">
                                        <Building className="h-4 w-4" />
                                        <span>{employee.unit.name}</span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-8 p-8 md:grid-cols-2">
                {/* Personal & Contact Information */}
                <div className="space-y-6">
                    <div className="flex items-center gap-2">
                        <div className="h-1 w-8 rounded-full bg-primary" />
                        <h3 className="text-xs font-black tracking-[0.2em] text-muted-foreground uppercase">
                            Personal & Contact
                        </h3>
                    </div>
                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <div className={iconContainerClass}>
                                <UserIcon className={iconClass} />
                            </div>
                            <div className="grid w-full grid-cols-4 gap-2">
                                <div className="space-y-1">
                                    <p className="t-caption">Sex</p>
                                    <p className="font-bold text-foreground">
                                        {employee.sex || 'Not set'}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="t-caption">Civil Status</p>
                                    <p className="font-bold text-foreground">
                                        {employee.civil_status || 'Not set'}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="t-caption">Age</p>
                                    <p className="font-bold text-foreground">
                                        {employee.age
                                            ? `${employee.age} yrs`
                                            : 'N/A'}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="t-caption">Eligibility</p>
                                    <p className="font-bold text-foreground">
                                        {employee.eligibility || 'Not set'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className={iconContainerClass}>
                                <Calendar className={iconClass} />
                            </div>
                            <div className="space-y-1">
                                <p className="t-caption">Birthdate</p>
                                <p className="font-bold text-foreground">
                                    {formatDate(employee.date_of_birth)}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className={iconContainerClass}>
                                <Mail className={iconClass} />
                            </div>
                            <div className="space-y-1">
                                <p className="t-caption">Email Address</p>
                                <p className="font-bold text-foreground">
                                    {employee.email || 'No email provided'}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className={iconContainerClass}>
                                <Phone className={iconClass} />
                            </div>
                            <div className="space-y-1">
                                <p className="t-caption">Contact Number</p>
                                <p className="font-bold text-foreground">
                                    {employee.contact_number ||
                                        'No contact number'}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className={cn(iconContainerClass, 'mt-1')}>
                                <MapPin className={iconClass} />
                            </div>
                            <div className="space-y-1">
                                <p className="t-caption">Present Address</p>
                                <p className="leading-relaxed font-bold text-foreground">
                                    {employee.present_address ||
                                        'Address not listed'}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className={cn(iconContainerClass, 'mt-1')}>
                                <MapPin className={iconClass} />
                            </div>
                            <div className="space-y-1">
                                <p className="t-caption">Permanent Address</p>
                                <p className="leading-relaxed font-bold text-foreground">
                                    {employee.address || 'Address not listed'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Employment Details */}
                <div className="space-y-6">
                    <div className="flex items-center gap-2">
                        <div className="h-1 w-8 rounded-full bg-primary" />
                        <h3 className="text-xs font-black tracking-[0.2em] text-muted-foreground uppercase">
                            Employment Details
                        </h3>
                    </div>
                    <div className="space-y-6">
                        <div className="grid w-full grid-cols-3 gap-2">
                            <div className="space-y-1">
                                <p className="t-caption">Date of Hire</p>
                                <p className="font-bold text-foreground">
                                    {formatDate(employee.hire_date)}
                                </p>
                            </div>
                            <div className="col-span-2 space-y-1">
                                <p className="t-caption">Date Hired in Gov.</p>
                                <p className="font-bold text-foreground">
                                    {formatDate(employee.date_hired_government)}
                                </p>
                            </div>
                        </div>

                        <div className="grid w-full grid-cols-2 gap-2">
                            <div className="space-y-1">
                                <p className="t-caption">Appointment Status</p>
                                <div className="flex">
                                    <span
                                        className="mt-1 w-fit rounded-full px-3 py-0.5 text-[10px] font-black text-black uppercase shadow-lg shadow-primary/20"
                                        style={{
                                            background: 'var(--grad-primary)',
                                        }}
                                    >
                                        {employee.appointment_status?.name ||
                                            'N/A'}
                                    </span>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="t-caption">Years in Service</p>
                                <p className="font-bold text-foreground">
                                    {employee.years_in_service !== null
                                        ? `${employee.years_in_service} years`
                                        : 'Not set'}
                                </p>
                            </div>
                        </div>

                        <div className="grid w-full grid-cols-2 gap-2">
                            <div className="space-y-1">
                                <p className="t-caption">Plantilla Number</p>
                                <p className="font-bold text-foreground">
                                    {employee.plantilla_number || 'Not set'}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="t-caption">Item Number</p>
                                <p className="font-bold text-foreground">
                                    {employee.item_number || 'Not set'}
                                </p>
                            </div>
                        </div>

                        <div className="grid w-full grid-cols-2 gap-2">
                            <div className="space-y-1">
                                <p className="t-caption">Plantilla Position</p>
                                <p className="font-bold text-foreground">
                                    {employee.plantilla_position || 'Not set'}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="t-caption">
                                    Offc. Per Appointment
                                </p>
                                <p className="font-bold text-foreground">
                                    {employee.office_per_appointment ||
                                        'Not set'}
                                </p>
                            </div>
                        </div>

                        <div className="grid w-full grid-cols-2 gap-2">
                            <div className="space-y-1">
                                <p className="t-caption">Orig Appointment</p>
                                <p className="font-bold text-foreground">
                                    {formatDate(
                                        employee.orig_date_of_appointment,
                                    )}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="t-caption">Latest Appointment</p>
                                <p className="font-bold text-foreground">
                                    {formatDate(
                                        employee.date_of_latest_appointment,
                                    )}
                                </p>
                            </div>
                        </div>

                        <div className="grid w-full grid-cols-2 gap-2">
                            <div className="space-y-1">
                                <p className="t-caption">Assumption Date</p>
                                <p className="font-bold text-foreground">
                                    {formatDate(employee.date_of_assumption)}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="t-caption">Separation Date</p>
                                <p className="font-bold text-foreground">
                                    {formatDate(employee.date_of_separation)}
                                </p>
                            </div>
                        </div>

                        <div className="grid w-full grid-cols-2 gap-2">
                            <div className="space-y-1">
                                <p className="t-caption">Fund Code</p>
                                <p className="font-bold text-foreground">
                                    {employee.fund_code || 'Not set'}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="t-caption">Func./Activity Code</p>
                                <p className="font-bold text-foreground">
                                    {employee.func_activity_code || 'Not set'}
                                </p>
                            </div>
                        </div>

                        <div className="grid w-full grid-cols-3 gap-2">
                            <div className="space-y-1">
                                <p className="t-caption">Salary Grade</p>
                                <p className="font-bold text-foreground">
                                    {employee.salary_grade || 'Not set'}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="t-caption">Salary Step</p>
                                <p className="font-bold text-foreground">
                                    {employee.salary_step || 'Not set'}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="t-caption">Monthly Salary</p>
                                <p className="font-bold text-foreground">
                                    {employee.monthly_salary
                                        ? `₱${Number(employee.monthly_salary).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                                        : 'Not set'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Government IDs */}
                <div className="space-y-6 md:col-span-2">
                    <div className="flex items-center gap-2">
                        <div className="h-1 w-8 rounded-full bg-primary" />
                        <h3 className="text-xs font-black tracking-[0.2em] text-muted-foreground uppercase">
                            Government IDs & Credentials
                        </h3>
                    </div>
                    <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
                        <div className="space-y-1">
                            <p className="t-caption">GSIS BP No.</p>
                            <p className="font-bold text-foreground">
                                {employee.gsis_bp_number || 'N/A'}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <p className="t-caption">PRC ID No.</p>
                            <p className="font-bold text-foreground">
                                {employee.prc_id_no || 'N/A'}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <p className="t-caption">PRC Expiration</p>
                            <p className="font-bold text-foreground">
                                {formatDate(employee.prc_expiration)}
                            </p>
                        </div>

                        <div className="space-y-1">
                            <p className="t-caption">PhilHealth</p>
                            <p className="font-bold text-foreground">
                                {employee.philhealth || 'N/A'}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <p className="t-caption">LBP Account No.</p>
                            <p className="font-bold text-foreground">
                                {employee.lbp_account_number || 'N/A'}
                            </p>
                        </div>
                        <div className="hidden md:block"></div>

                        <div className="space-y-1">
                            <p className="t-caption">PAGIBIG No.</p>
                            <p className="font-bold text-foreground">
                                {employee.hdmf_pagibig_no || 'N/A'}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <p className="t-caption">TIN Number</p>
                            <p className="font-bold text-foreground">
                                {employee.tin_number || 'N/A'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Progress */}
                <div className="space-y-6 md:col-span-2">
                    <div className="flex items-center gap-2">
                        <div className="h-1 w-8 rounded-full bg-primary" />
                        <h3 className="text-xs font-black tracking-[0.2em] text-muted-foreground uppercase">
                            Progress
                        </h3>
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="flex flex-col rounded-xl border border-border/40 bg-surface-2 p-4 transition-colors duration-200 hover:border-primary/50">
                            <div className="mb-2 flex items-center justify-between">
                                <span className="text-xs font-black text-muted-foreground uppercase">
                                    Years Served
                                </span>
                                <span className="text-sm font-bold">
                                    {(() => {
                                        const date =
                                            employee.date_hired_government ||
                                            employee.orig_date_of_appointment ||
                                            employee.hire_date;

                                        if (!date) {
                                            return '0.0';
                                        }

                                        const msDiff =
                                            CURRENT_TIME -
                                            new Date(date).getTime();

                                        return (
                                            msDiff /
                                            (1000 * 60 * 60 * 24 * 365.25)
                                        ).toFixed(1);
                                    })()}
                                </span>
                            </div>
                            <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800/80">
                                <div
                                    className="h-full rounded-full bg-green-500 transition-all duration-1000 ease-out"
                                    style={{
                                        width: `${(() => {
                                            const date =
                                                employee.date_hired_government ||
                                                employee.orig_date_of_appointment ||
                                                employee.hire_date;

                                            if (!date) {
                                                return 0;
                                            }

                                            const years =
                                                (CURRENT_TIME -
                                                    new Date(date).getTime()) /
                                                (1000 * 60 * 60 * 24 * 365.25);

                                            if (years < 10) {
                                                return Math.min(
                                                    100,
                                                    (years / 10) * 100,
                                                );
                                            }

                                            return Math.min(
                                                100,
                                                (((years - 10) % 5) / 5) * 100,
                                            );
                                        })()}%`,
                                    }}
                                />
                            </div>
                            <span className="mt-2 text-right text-[10px] text-muted-foreground">
                                {(() => {
                                    const date =
                                        employee.date_hired_government ||
                                        employee.orig_date_of_appointment ||
                                        employee.hire_date;

                                    if (!date) {
                                        return 'No start date set';
                                    }

                                    const years =
                                        (CURRENT_TIME -
                                            new Date(date).getTime()) /
                                        (1000 * 60 * 60 * 24 * 365.25);

                                    if (years < 10) {
                                        return `Target: 10-year Loyalty Award`;
                                    }

                                    return `Target: ${(Math.floor((years - 10) / 5) + 1) * 5 + 10}-year Loyalty Award`;
                                })()}
                            </span>
                        </div>

                        <div className="flex flex-col rounded-xl border border-border/40 bg-surface-2 p-4 transition-colors duration-200 hover:border-primary/50">
                            {(() => {
                                const baseDate =
                                    employee.hire_date ||
                                    employee.date_hired_government ||
                                    employee.orig_date_of_appointment ||
                                    employee.date_of_latest_appointment;

                                if (!baseDate) {
                                    return (
                                        <>
                                            <span className="mb-1 text-xs font-black text-muted-foreground uppercase">
                                                Salary Step
                                            </span>
                                            <div className="flex items-end gap-2">
                                                <span className="text-3xl font-black text-foreground">
                                                    {employee.salary_step ||
                                                        '0'}
                                                </span>
                                                <span className="mb-1 pb-0.5 text-xs text-muted-foreground">
                                                    / 8
                                                </span>
                                            </div>
                                            <span className="mt-1 text-[10px] text-muted-foreground">
                                                No base date set for salary
                                            </span>
                                        </>
                                    );
                                }

                                const msInDay = 1000 * 60 * 60 * 24;
                                const nowTime = CURRENT_TIME;

                                // Get all promotion dates sorted chronologically (oldest first)
                                const sortedPromoDates: string[] = (
                                    employee.promotion_histories || []
                                )
                                    .map((p: any) => p.promotion_date)
                                    .filter(Boolean)
                                    .sort();

                                // Accumulate step increments across each service period
                                // (hire→promo1, promo1→promo2, ..., lastPromo→now)
                                let totalIncrements = 0;
                                let periodStart = new Date(baseDate).getTime();

                                for (const promoDate of sortedPromoDates) {
                                    const periodEnd = new Date(
                                        promoDate,
                                    ).getTime();

                                    if (periodEnd > periodStart) {
                                        const periodYears =
                                            (periodEnd - periodStart) /
                                            (msInDay * 365.25);
                                        totalIncrements += Math.floor(
                                            periodYears / 3,
                                        );
                                    }

                                    // Timer resets at each promotion but step carries over
                                    periodStart = new Date(promoDate).getTime();
                                }

                                // Add increments from last reset point to now
                                const yearsWorked =
                                    (nowTime - periodStart) /
                                    (msInDay * 365.25);
                                totalIncrements += Math.floor(yearsWorked / 3);

                                const currentStep = Math.min(
                                    totalIncrements + 1,
                                    8,
                                );

                                // Timer countdown: based only on years since last reset (last promo or hire date)
                                let timerText = '';

                                if (currentStep >= 8) {
                                    timerText = 'Max Step Reached';
                                } else {
                                    const nextTargetYears =
                                        (Math.floor(yearsWorked / 3) + 1) * 3;
                                    const targetDate = new Date(periodStart);
                                    targetDate.setFullYear(
                                        targetDate.getFullYear() +
                                            nextTargetYears,
                                    );

                                    const daysLeft = Math.ceil(
                                        (targetDate.getTime() - nowTime) /
                                            msInDay,
                                    );

                                    if (daysLeft <= 0) {
                                        timerText = 'Due now!';
                                    } else {
                                        const y = Math.floor(daysLeft / 365);
                                        const m = Math.floor(
                                            (daysLeft % 365) / 30,
                                        );
                                        const d = Math.floor(
                                            (daysLeft % 365) % 30,
                                        );

                                        const cleanParts = [];

                                        if (y > 0) {
                                            cleanParts.push(`${y}y`);
                                        }

                                        if (m >= 0 && (y > 0 || m > 0)) {
                                            cleanParts.push(`${m}m`);
                                        }

                                        cleanParts.push(`${d}d`);

                                        timerText = `In ${cleanParts.join(' ')}`;
                                    }
                                }

                                return (
                                    <>
                                        <span className="mb-1 text-xs font-black text-muted-foreground uppercase">
                                            Salary Step
                                        </span>
                                        <div className="flex items-end gap-2">
                                            <span className="text-3xl font-black text-foreground">
                                                {currentStep}
                                            </span>
                                            <span className="mb-1 pb-0.5 text-xs text-muted-foreground">
                                                / 8
                                            </span>
                                        </div>
                                        <span className="mt-1 text-[10px] text-muted-foreground">
                                            {timerText}
                                        </span>
                                    </>
                                );
                            })()}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
