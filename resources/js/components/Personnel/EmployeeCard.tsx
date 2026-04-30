import { Mail, Phone, MapPin, Calendar, Briefcase, Building2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Employee {
    first_name: string;
    last_name: string;
    employee_number: string | null;
    email: string | null;
    contact_number: string | null;
    address: string | null;
    hire_date: string | null;
    department?: { name: string };
    position?: { name: string };
    employment_status?: { name: string };
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

    return (
        <div className="matte-card elev-2 overflow-hidden">
            <div className="bg-primary/5 p-6 border-b border-border/40">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                    <div className="h-24 w-24 rounded-3xl bg-primary flex items-center justify-center text-primary-foreground text-4xl font-black shadow-2xl ring-4 ring-background/50">
                        {employee.first_name[0]}{employee.last_name[0]}
                    </div>
                    <div className="flex-1 text-center md:text-left space-y-1">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                            <h2 className="text-3xl font-black tracking-tighter text-foreground">{employee.first_name} {employee.last_name}</h2>
                            <Badge variant="outline" className="font-mono bg-background/50 backdrop-blur-md shadow-sm border-border/40 px-3 py-1 rounded-lg w-fit mx-auto md:mx-0">
                                {employee.employee_number || 'NO-ID'}
                            </Badge>
                        </div>
                        <div className="flex items-center justify-center md:justify-start gap-2 text-primary font-bold">
                            <Briefcase className="h-4 w-4" />
                            <span className="text-sm uppercase tracking-wide">{employee.position?.name || 'Unassigned Position'}</span>
                        </div>
                        <div className="flex items-center justify-center md:justify-start gap-2 text-muted-foreground">
                            <Building2 className="h-4 w-4" />
                            <span className="text-sm font-medium">{employee.department?.name || 'Department Not Set'}</span>
                        </div>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
                <div className="space-y-6">
                    <div className="flex items-center gap-2">
                        <div className="h-1 w-8 bg-primary rounded-full" />
                        <h3 className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em]">Contact Information</h3>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center gap-4 group">
                            <div className="p-2.5 rounded-xl bg-muted/40 group-hover:bg-primary/10 border border-border/20 group-hover:border-primary/20 transition-all duration-300">
                                <Mail className="h-4 w-4 text-primary" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] text-muted-foreground font-black uppercase tracking-wider">Email Address</span>
                                <span className="text-sm font-bold text-foreground/90">{employee.email || 'No email provided'}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 group">
                            <div className="p-2.5 rounded-xl bg-muted/40 group-hover:bg-primary/10 border border-border/20 group-hover:border-primary/20 transition-all duration-300">
                                <Phone className="h-4 w-4 text-primary" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] text-muted-foreground font-black uppercase tracking-wider">Contact Number</span>
                                <span className="text-sm font-bold text-foreground/90">{employee.contact_number || 'No contact number'}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 group items-start">
                            <div className="p-2.5 rounded-xl bg-muted/40 group-hover:bg-primary/10 border border-border/20 group-hover:border-primary/20 transition-all duration-300 mt-1">
                                <MapPin className="h-4 w-4 text-primary" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] text-muted-foreground font-black uppercase tracking-wider">Residential Address</span>
                                <span className="text-sm font-bold leading-relaxed text-foreground/90">{employee.address || 'Address not listed'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="flex items-center gap-2">
                        <div className="h-1 w-8 bg-primary rounded-full" />
                        <h3 className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em]">Employment Details</h3>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center gap-4 group">
                            <div className="p-2.5 rounded-xl bg-muted/40 group-hover:bg-primary/10 border border-border/20 group-hover:border-primary/20 transition-all duration-300">
                                <Calendar className="h-4 w-4 text-primary" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] text-muted-foreground font-black uppercase tracking-wider">Date of Hire</span>
                                <span className="text-sm font-bold text-foreground/90">{formatDate(employee.hire_date)}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 group">
                            <div className="p-2.5 rounded-xl bg-muted/40 group-hover:bg-primary/10 border border-border/20 group-hover:border-primary/20 transition-all duration-300">
                                <Briefcase className="h-4 w-4 text-primary" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] text-muted-foreground font-black uppercase tracking-wider">Employment Status</span>
                                <Badge className="mt-1 w-fit uppercase text-[10px] py-0.5 px-3 font-black rounded-full shadow-lg shadow-primary/10">
                                    {employee.employment_status?.name || 'N/A'}
                                </Badge>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
