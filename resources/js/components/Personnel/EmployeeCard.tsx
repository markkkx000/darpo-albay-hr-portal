import { Mail, Phone, MapPin, Calendar, Briefcase, Building2, User as UserIcon, BadgeInfo, Building, FileText, CreditCard } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Employee {
    first_name: string;
    middle_name: string | null;
    last_name: string;
    employee_number: string | null;
    email: string | null;
    contact_number: string | null;
    address: string | null;
    hire_date: string | null;
    division?: { name: string };
    unit?: { name: string };
    positions?: Array<{ name: string; pivot: { is_primary: boolean } }>;
    employment_status?: { name: string };

    sex: string | null;
    date_of_birth: string | null;
    age: number | null;
    years_in_service: number | null;
    plantilla_number: string | null;
    gsis_bp_number: string | null;
    philhealth: string | null;
    hdmf_pagibig_no: string | null;
    tin_number: string | null;
    prc_id_no: string | null;
    prc_expiration: string | null;
    orig_date_of_appointment: string | null;
    date_of_latest_appointment: string | null;
    date_of_assumption: string | null;
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

    const iconContainerClass = 'p-2.5 rounded-xl border border-border/20 transition-all duration-200 group-hover:item-hover-gradient';
    const iconClass = 'h-4 w-4 text-muted-foreground group-hover:text-black transition-colors duration-200';

    return (
        <div className="matte-card elev-2 overflow-hidden">
            <div className="bg-primary/5 p-6 border-b border-border/40">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                    <div className="sqicon sqicon-green h-24 w-24 !rounded-[24px] flex items-center justify-center text-4xl font-black shadow-2xl ring-4 ring-surface-1">
                        {employee.first_name[0]}{employee.last_name[0]}
                    </div>
                    <div className="flex-1 text-center md:text-left space-y-1">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                            <h2 className="text-3xl font-black tracking-tighter text-foreground">
                                {`${employee.last_name.toUpperCase()}, ${employee.first_name}${employee.middle_name ? ' ' + employee.middle_name : ''}`}
                            </h2>
                            <Badge variant="outline" className="font-mono bg-surface-2 border-border-2 px-3 py-1 rounded-xl w-fit mx-auto md:mx-0">
                                {employee.employee_number || 'NO-ID'}
                            </Badge>
                        </div>
                        <div className="flex items-center justify-center md:justify-start gap-2 text-primary font-bold">
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
                            <span className="hidden md:inline">&bull;</span>
                            <div className="flex items-center gap-1">
                                <Building className="h-4 w-4" />
                                <span>{employee.unit?.name || 'Unit Not Set'}</span>
                            </div>
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
                    <div className="space-y-4">
                        <div className="flex items-center gap-4 group">
                            <div className={iconContainerClass}>
                                <UserIcon className={iconClass} />
                            </div>
                            <div className="grid grid-cols-3 w-full">
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-muted-foreground font-black uppercase tracking-wider group-hover:text-black transition-colors">Sex</span>
                                    <span className="text-sm font-bold text-foreground/90 group-hover:text-black transition-colors">{employee.sex || 'Not set'}</span>
                                </div>
                                <div className="flex flex-col col-span-2">
                                    <span className="text-[10px] text-muted-foreground font-black uppercase tracking-wider group-hover:text-black transition-colors">Birthdate / Age</span>
                                    <span className="text-sm font-bold text-foreground/90 group-hover:text-black transition-colors">{formatDate(employee.date_of_birth)} ({employee.age ? `${employee.age} yrs` : 'N/A'})</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 group">
                            <div className={iconContainerClass}>
                                <Mail className={iconClass} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] text-muted-foreground font-black uppercase tracking-wider group-hover:text-black transition-colors">Email Address</span>
                                <span className="text-sm font-bold text-foreground/90 group-hover:text-black transition-colors">{employee.email || 'No email provided'}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 group">
                            <div className={iconContainerClass}>
                                <Phone className={iconClass} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] text-muted-foreground font-black uppercase tracking-wider group-hover:text-black transition-colors">Contact Number</span>
                                <span className="text-sm font-bold text-foreground/90 group-hover:text-black transition-colors">{employee.contact_number || 'No contact number'}</span>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 group">
                            <div className={cn(iconContainerClass, 'mt-1')}>
                                <MapPin className={iconClass} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] text-muted-foreground font-black uppercase tracking-wider group-hover:text-black transition-colors">Residential Address</span>
                                <span className="text-sm font-bold leading-relaxed text-foreground/90 group-hover:text-black transition-colors">{employee.address || 'Address not listed'}</span>
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
                    <div className="space-y-4">
                        <div className="flex items-center gap-4 group">
                            <div className={iconContainerClass}>
                                <Calendar className={iconClass} />
                            </div>
                            <div className="grid grid-cols-2 w-full gap-2">
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-muted-foreground font-black uppercase tracking-wider group-hover:text-black transition-colors">Date of Hire</span>
                                    <span className="text-sm font-bold text-foreground/90 group-hover:text-black transition-colors">{formatDate(employee.hire_date)}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-muted-foreground font-black uppercase tracking-wider group-hover:text-black transition-colors">Years in Service</span>
                                    <span className="text-sm font-bold text-foreground/90 group-hover:text-black transition-colors">{employee.years_in_service ? `${employee.years_in_service} years` : 'Not set'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 group">
                            <div className={iconContainerClass}>
                                <Briefcase className={iconClass} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] text-muted-foreground font-black uppercase tracking-wider group-hover:text-black transition-colors">Employment Status</span>
                                <span
                                    className="mt-1 w-fit uppercase text-[10px] py-0.5 px-3 font-black rounded-full text-black shadow-lg shadow-primary/20"
                                    style={{ background: 'var(--grad-primary)' }}
                                >
                                    {employee.employment_status?.name || 'N/A'}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 group">
                            <div className={iconContainerClass}>
                                <FileText className={iconClass} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] text-muted-foreground font-black uppercase tracking-wider group-hover:text-black transition-colors">Plantilla Number</span>
                                <span className="text-sm font-bold text-foreground/90 group-hover:text-black transition-colors">{employee.plantilla_number || 'Not set'}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 group">
                            <div className={iconContainerClass}>
                                <Calendar className={iconClass} />
                            </div>
                            <div className="grid grid-cols-2 w-full gap-2">
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-muted-foreground font-black uppercase tracking-wider group-hover:text-black transition-colors">Orig Appointment</span>
                                    <span className="text-sm font-bold text-foreground/90 group-hover:text-black transition-colors">{formatDate(employee.orig_date_of_appointment)}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-muted-foreground font-black uppercase tracking-wider group-hover:text-black transition-colors">Latest Appointment</span>
                                    <span className="text-sm font-bold text-foreground/90 group-hover:text-black transition-colors">{formatDate(employee.date_of_latest_appointment)}</span>
                                </div>
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
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/20 border border-border/30 group hover:item-hover-gradient transition-all duration-200">
                            <BadgeInfo className="h-5 w-5 text-muted-foreground group-hover:text-black transition-colors duration-200" />
                            <div className="flex flex-col">
                                <span className="text-[10px] text-muted-foreground font-black uppercase group-hover:text-black transition-colors">GSIS BP No.</span>
                                <span className="text-sm font-bold group-hover:text-black transition-colors">{employee.gsis_bp_number || 'N/A'}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/20 border border-border/30 group hover:item-hover-gradient transition-all duration-200">
                            <CreditCard className="h-5 w-5 text-muted-foreground group-hover:text-black transition-colors duration-200" />
                            <div className="flex flex-col">
                                <span className="text-[10px] text-muted-foreground font-black uppercase group-hover:text-black transition-colors">PhilHealth</span>
                                <span className="text-sm font-bold group-hover:text-black transition-colors">{employee.philhealth || 'N/A'}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/20 border border-border/30 group hover:item-hover-gradient transition-all duration-200">
                            <BadgeInfo className="h-5 w-5 text-muted-foreground group-hover:text-black transition-colors duration-200" />
                            <div className="flex flex-col">
                                <span className="text-[10px] text-muted-foreground font-black uppercase group-hover:text-black transition-colors">PAGIBIG No.</span>
                                <span className="text-sm font-bold group-hover:text-black transition-colors">{employee.hdmf_pagibig_no || 'N/A'}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/20 border border-border/30 group hover:item-hover-gradient transition-all duration-200">
                            <CreditCard className="h-5 w-5 text-muted-foreground group-hover:text-black transition-colors duration-200" />
                            <div className="flex flex-col">
                                <span className="text-[10px] text-muted-foreground font-black uppercase group-hover:text-black transition-colors">TIN Number</span>
                                <span className="text-sm font-bold group-hover:text-black transition-colors">{employee.tin_number || 'N/A'}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/20 border border-border/30 col-span-2 group hover:item-hover-gradient transition-all duration-200">
                            <BadgeInfo className="h-5 w-5 text-muted-foreground group-hover:text-black transition-colors duration-200" />
                            <div className="flex flex-col flex-1">
                                <span className="text-[10px] text-muted-foreground font-black uppercase group-hover:text-black transition-colors">PRC ID No.</span>
                                <span className="text-sm font-bold group-hover:text-black transition-colors">{employee.prc_id_no || 'N/A'}</span>
                            </div>
                            <div className="flex flex-col pl-4 border-l border-border/50">
                                <span className="text-[10px] text-muted-foreground font-black uppercase group-hover:text-black transition-colors">Expiration</span>
                                <span className="text-sm font-bold group-hover:text-black transition-colors">{formatDate(employee.prc_expiration)}</span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
