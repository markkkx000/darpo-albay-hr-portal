import { Mail, Phone, MapPin, Calendar, Briefcase, Building2, User as UserIcon, Building } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

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
    division?: { name: string };
    unit?: { name: string };
    positions?: Array<{ name: string; pivot: { is_primary: boolean } }>;
    appointment_status?: { name: string };
    mfa_enabled?: boolean;

    sex: string | null;
    date_of_birth: string | null;
    age: number | null;
    civil_status: string | null;
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

        return new Date(date).toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' });
    };

    const iconContainerClass = 'p-2.5 rounded-xl border border-border/20 bg-muted/20';
    const iconClass = 'h-4 w-4 text-primary';

    return (
        <div className="matte-card elev-2 overflow-hidden">
            <div className="bg-primary/5 p-6 border-b border-border/40">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                    <Dialog>
                        <DialogTrigger asChild>
                            <button className="relative h-24 w-24 rounded-[24px] overflow-hidden shadow-2xl ring-4 ring-surface-1 bg-surface-2 cursor-pointer transition-transform duration-200 ease-out hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
                                <img 
                                    src={employee.avatar || '/img/pfp_placeholder.png'} 
                                    alt="Profile" 
                                    className="h-full w-full object-cover"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = '/img/pfp_placeholder.png';
                                    }}
                                />
                            </button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-xl p-0 overflow-hidden bg-transparent border-none shadow-none flex justify-center items-center">
                            <img 
                                src={employee.avatar || '/img/pfp_placeholder.png'} 
                                alt="Profile Full" 
                                className="w-full max-w-lg h-auto max-h-[85vh] object-contain rounded-2xl shadow-2xl"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = '/img/pfp_placeholder.png';
                                }}
                            />
                        </DialogContent>
                    </Dialog>
                    <div className="flex-1 text-center md:text-left space-y-1">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                            <h2 className="text-3xl font-black tracking-tighter text-foreground">
                                {`${employee.last_name.toUpperCase()}, ${employee.first_name}${employee.middle_name ? ' ' + employee.middle_name : ''}`}
                            </h2>
                            <Badge variant="outline" className="font-mono bg-surface-2 border-border-2 px-3 py-1 rounded-xl w-fit mx-auto md:mx-0 flex items-center gap-1.5">
                                <span className="text-[10px] text-muted-foreground uppercase font-sans tracking-wider font-black">ID No.</span>
                                <span>{employee.employee_number || 'NO-ID'}</span>
                            </Badge>
                        </div>
                        <div className="flex items-center justify-center md:justify-start gap-2 text-foreground font-bold">
                            <Briefcase className="h-4 w-4" />
                            <span className="text-sm uppercase tracking-wide">
                                {employee.positions?.length
                                    ? employee.positions.map(p => p.name).join(' • ')
                                    : 'Unassigned Position'}
                            </span>
                        </div>
                        <div className="flex flex-col md:flex-row items-center md:justify-start gap-2 text-muted-foreground text-sm font-medium">
                            <div className="flex items-center gap-1">
                                <Building2 className="h-4 w-4" />
                                <span>{employee.division?.name || 'Division Not Set'}</span>
                            </div>
                            {employee.unit?.name && (
                                <>
                                    <span className="hidden md:inline">&bull;</span>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">

                {/* Personal & Contact Information */}
                <div className="space-y-6">
                    <div className="flex items-center gap-2">
                        <div className="h-1 w-8 bg-primary rounded-full" />
                        <h3 className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em]">Personal & Contact</h3>
                    </div>
                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <div className={iconContainerClass}>
                                <UserIcon className={iconClass} />
                            </div>
                            <div className="grid grid-cols-3 w-full gap-2">
                                <div className="space-y-1">
                                    <p className="t-caption">Sex</p>
                                    <p className="font-bold text-foreground">{employee.sex || 'Not set'}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="t-caption">Civil Status</p>
                                    <p className="font-bold text-foreground">{employee.civil_status || 'Not set'}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="t-caption">Age</p>
                                    <p className="font-bold text-foreground">{employee.age ? `${employee.age} yrs` : 'N/A'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className={iconContainerClass}>
                                <Calendar className={iconClass} />
                            </div>
                            <div className="space-y-1">
                                <p className="t-caption">Birthdate</p>
                                <p className="font-bold text-foreground">{formatDate(employee.date_of_birth)}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className={iconContainerClass}>
                                <Mail className={iconClass} />
                            </div>
                            <div className="space-y-1">
                                <p className="t-caption">Email Address</p>
                                <p className="font-bold text-foreground">{employee.email || 'No email provided'}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className={iconContainerClass}>
                                <Phone className={iconClass} />
                            </div>
                            <div className="space-y-1">
                                <p className="t-caption">Contact Number</p>
                                <p className="font-bold text-foreground">{employee.contact_number || 'No contact number'}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className={cn(iconContainerClass, 'mt-1')}>
                                <MapPin className={iconClass} />
                            </div>
                            <div className="space-y-1">
                                <p className="t-caption">Present Address</p>
                                <p className="font-bold leading-relaxed text-foreground">{employee.present_address || 'Address not listed'}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className={cn(iconContainerClass, 'mt-1')}>
                                <MapPin className={iconClass} />
                            </div>
                            <div className="space-y-1">
                                <p className="t-caption">Permanent Address</p>
                                <p className="font-bold leading-relaxed text-foreground">{employee.address || 'Address not listed'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Employment Details */}
                <div className="space-y-6">
                    <div className="flex items-center gap-2">
                        <div className="h-1 w-8 bg-primary rounded-full" />
                        <h3 className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em]">Employment Details</h3>
                    </div>
                    <div className="space-y-6">
                        <div className="grid grid-cols-3 w-full gap-2">
                            <div className="space-y-1">
                                <p className="t-caption">Date of Hire</p>
                                <p className="font-bold text-foreground">{formatDate(employee.hire_date)}</p>
                            </div>
                            <div className="col-span-2 space-y-1">
                                <p className="t-caption">Date Hired in Gov.</p>
                                <p className="font-bold text-foreground">{formatDate(employee.date_hired_government)}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 w-full gap-2">
                            <div className="space-y-1">
                                <p className="t-caption">Appointment Status</p>
                                <div className="flex">
                                    <span
                                        className="mt-1 w-fit uppercase text-[10px] py-0.5 px-3 font-black rounded-full text-black shadow-lg shadow-primary/20"
                                        style={{ background: 'var(--grad-primary)' }}
                                    >
                                        {employee.appointment_status?.name || 'N/A'}
                                    </span>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="t-caption">Years in Service</p>
                                <p className="font-bold text-foreground">{employee.years_in_service !== null ? `${employee.years_in_service} years` : 'Not set'}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 w-full gap-2">
                            <div className="space-y-1">
                                <p className="t-caption">Plantilla Number</p>
                                <p className="font-bold text-foreground">{employee.plantilla_number || 'Not set'}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="t-caption">Item Number</p>
                                <p className="font-bold text-foreground">{employee.item_number || 'Not set'}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 w-full gap-2">
                            <div className="space-y-1">
                                <p className="t-caption">Plantilla Position</p>
                                <p className="font-bold text-foreground">{employee.plantilla_position || 'Not set'}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="t-caption">Offc. Per Appointment</p>
                                <p className="font-bold text-foreground">{employee.office_per_appointment || 'Not set'}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 w-full gap-2">
                            <div className="space-y-1">
                                <p className="t-caption">Orig Appointment</p>
                                <p className="font-bold text-foreground">{formatDate(employee.orig_date_of_appointment)}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="t-caption">Latest Appointment</p>
                                <p className="font-bold text-foreground">{formatDate(employee.date_of_latest_appointment)}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 w-full gap-2">
                            <div className="space-y-1">
                                <p className="t-caption">Assumption Date</p>
                                <p className="font-bold text-foreground">{formatDate(employee.date_of_assumption)}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="t-caption">Separation Date</p>
                                <p className="font-bold text-foreground">{formatDate(employee.date_of_separation)}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 w-full gap-2">
                            <div className="space-y-1">
                                <p className="t-caption">Fund Code</p>
                                <p className="font-bold text-foreground">{employee.fund_code || 'Not set'}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="t-caption">Func./Activity Code</p>
                                <p className="font-bold text-foreground">{employee.func_activity_code || 'Not set'}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 w-full gap-2">
                            <div className="space-y-1">
                                <p className="t-caption">Salary Grade</p>
                                <p className="font-bold text-foreground">{employee.salary_grade || 'Not set'}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="t-caption">Salary Step</p>
                                <p className="font-bold text-foreground">{employee.salary_step || 'Not set'}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="t-caption">Monthly Salary</p>
                                <p className="font-bold text-foreground">
                                    {employee.monthly_salary ? `₱${Number(employee.monthly_salary).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'Not set'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Government IDs */}
                <div className="space-y-6 md:col-span-2">
                    <div className="flex items-center gap-2">
                        <div className="h-1 w-8 bg-primary rounded-full" />
                        <h3 className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em]">Government IDs & Credentials</h3>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                        <div className="space-y-1">
                            <p className="t-caption">GSIS BP No.</p>
                            <p className="font-bold text-foreground">{employee.gsis_bp_number || 'N/A'}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="t-caption">PRC ID No.</p>
                            <p className="font-bold text-foreground">{employee.prc_id_no || 'N/A'}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="t-caption">PRC Expiration</p>
                            <p className="font-bold text-foreground">{formatDate(employee.prc_expiration)}</p>
                        </div>

                        <div className="space-y-1">
                            <p className="t-caption">PhilHealth</p>
                            <p className="font-bold text-foreground">{employee.philhealth || 'N/A'}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="t-caption">LBP Account No.</p>
                            <p className="font-bold text-foreground">{employee.lbp_account_number || 'N/A'}</p>
                        </div>
                        <div className="hidden md:block"></div>

                        <div className="space-y-1">
                            <p className="t-caption">PAGIBIG No.</p>
                            <p className="font-bold text-foreground">{employee.hdmf_pagibig_no || 'N/A'}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="t-caption">TIN Number</p>
                            <p className="font-bold text-foreground">{employee.tin_number || 'N/A'}</p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
