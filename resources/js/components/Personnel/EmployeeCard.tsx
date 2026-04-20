import { Mail, Phone, MapPin, Calendar, Briefcase, Building2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

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
        <Card className="overflow-hidden border-none shadow-lg">
            <CardHeader className="bg-primary/5 pb-2 border-b border-primary/10">
                <div className="flex items-start gap-4">
                    <div className="h-20 w-20 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground text-3xl font-black shadow-inner">
                        {employee.first_name[0]}{employee.last_name[0]}
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold tracking-tight">{employee.first_name} {employee.last_name}</h2>
                            <Badge variant="outline" className="font-mono bg-background shadow-sm">
                                {employee.employee_number || 'NO-ID'}
                            </Badge>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-primary font-medium">
                            <Briefcase className="h-4 w-4" />
                            <span>{employee.position?.name || 'Unassigned Position'}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-muted-foreground text-sm">
                            <Building2 className="h-4 w-4" />
                            <span>{employee.department?.name || 'Department Not Set'}</span>
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Contact Information</h3>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3 group">
                            <div className="p-2 rounded-lg bg-secondary group-hover:bg-primary/10 transition-colors">
                                <Mail className="h-4 w-4 text-primary" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs text-muted-foreground font-semibold">Email</span>
                                <span className="text-sm font-medium">{employee.email || 'No email provided'}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 group">
                            <div className="p-2 rounded-lg bg-secondary group-hover:bg-primary/10 transition-colors">
                                <Phone className="h-4 w-4 text-primary" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs text-muted-foreground font-semibold">Phone</span>
                                <span className="text-sm font-medium">{employee.contact_number || 'No contact number'}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 group items-start">
                            <div className="p-2 rounded-lg bg-secondary group-hover:bg-primary/10 transition-colors mt-1">
                                <MapPin className="h-4 w-4 text-primary" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs text-muted-foreground font-semibold">Residential Address</span>
                                <span className="text-sm font-medium leading-relaxed">{employee.address || 'Address not listed'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Employment Details</h3>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3 group">
                            <div className="p-2 rounded-lg bg-secondary group-hover:bg-primary/10 transition-colors">
                                <Calendar className="h-4 w-4 text-primary" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs text-muted-foreground font-semibold">Date of Hire</span>
                                <span className="text-sm font-medium">{formatDate(employee.hire_date)}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 group">
                            <div className="p-2 rounded-lg bg-secondary group-hover:bg-primary/10 transition-colors">
                                <Briefcase className="h-4 w-4 text-primary" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs text-muted-foreground font-semibold">Employment Status</span>
                                <Badge className="mt-0.5 w-fit uppercase text-[10px] py-0 font-bold">
                                    {employee.employment_status?.name || 'N/A'}
                                </Badge>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
