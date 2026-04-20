import { useForm } from '@inertiajs/react';
import { Loader2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface Department {
    id: number;
    name: string;
}

interface Position {
    id: number;
    name: string;
    department_id: number;
}

interface EmploymentStatus {
    id: number;
    name: string;
}

interface Props {
    employee?: any;
    departments: Department[];
    positions: Position[];
    employmentStatuses: EmploymentStatus[];
    onSubmit: (data: any) => void;
}

export function EmployeeForm({ 
    employee, 
    departments, 
    positions, 
    employmentStatuses, 
    onSubmit 
}: Props) {
    const { data, setData, processing, errors } = useForm({
        employee_number: employee?.employee_number || '',
        first_name: employee?.first_name || '',
        last_name: employee?.last_name || '',
        email: employee?.email || '',
        position_id: employee?.position_id?.toString() || '',
        department_id: employee?.department_id?.toString() || '',
        employment_status_id: employee?.employment_status_id?.toString() || '',
        hire_date: employee?.hire_date || '',
        contact_number: employee?.contact_number || '',
        address: employee?.address || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(data);
    };

    // Filter positions based on selected department
    const filteredPositions = data.department_id 
        ? positions.filter(p => p.department_id === parseInt(data.department_id))
        : [];

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Employee Identification */}
                <div className="space-y-4 md:col-span-2">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Identification</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="employee_number">Employee Number</Label>
                            <Input 
                                id="employee_number" 
                                value={data.employee_number} 
                                onChange={e => setData('employee_number', e.target.value)} 
                                placeholder="P-XXXX"
                            />
                            {errors.employee_number && <p className="text-xs text-destructive">{errors.employee_number}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="first_name">First Name</Label>
                            <Input 
                                id="first_name" 
                                value={data.first_name} 
                                onChange={e => setData('first_name', e.target.value)} 
                            />
                            {errors.first_name && <p className="text-xs text-destructive">{errors.first_name}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="last_name">Last Name</Label>
                            <Input 
                                id="last_name" 
                                value={data.last_name} 
                                onChange={e => setData('last_name', e.target.value)} 
                            />
                            {errors.last_name && <p className="text-xs text-destructive">{errors.last_name}</p>}
                        </div>
                    </div>
                </div>

                {/* Organization Details */}
                <div className="space-y-4 md:col-span-2">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Organization</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="department_id">Department</Label>
                            <Select 
                                value={data.department_id} 
                                onValueChange={value => {
                                    setData(prev => ({ ...prev, department_id: value, position_id: '' }));
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Department" />
                                </SelectTrigger>
                                <SelectContent>
                                    {departments.map(dept => (
                                        <SelectItem key={dept.id} value={dept.id.toString()}>{dept.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.department_id && <p className="text-xs text-destructive">{errors.department_id}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="position_id">Position</Label>
                            <Select 
                                value={data.position_id} 
                                onValueChange={value => setData('position_id', value)}
                                disabled={!data.department_id}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={data.department_id ? "Select Position" : "Select Department First"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {filteredPositions.map(pos => (
                                        <SelectItem key={pos.id} value={pos.id.toString()}>{pos.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.position_id && <p className="text-xs text-destructive">{errors.position_id}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="employment_status_id">Employment Status</Label>
                            <Select 
                                value={data.employment_status_id} 
                                onValueChange={value => setData('employment_status_id', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    {employmentStatuses.map(status => (
                                        <SelectItem key={status.id} value={status.id.toString()}>{status.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.employment_status_id && <p className="text-xs text-destructive">{errors.employment_status_id}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="hire_date">Date of Hire</Label>
                            <Input 
                                id="hire_date" 
                                type="date" 
                                value={data.hire_date} 
                                onChange={e => setData('hire_date', e.target.value)} 
                            />
                            {errors.hire_date && <p className="text-xs text-destructive">{errors.hire_date}</p>}
                        </div>
                    </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-4 md:col-span-2">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Contact & Profile</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input 
                                id="email" 
                                type="email" 
                                value={data.email} 
                                onChange={e => setData('email', e.target.value)} 
                                placeholder="employee@agency.gov.ph"
                            />
                            {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="contact_number">Contact Number</Label>
                            <Input 
                                id="contact_number" 
                                value={data.contact_number} 
                                onChange={e => setData('contact_number', e.target.value)} 
                                placeholder="+63 XXX XXX XXXX"
                            />
                            {errors.contact_number && <p className="text-xs text-destructive">{errors.contact_number}</p>}
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="address">Residential Address</Label>
                            <Textarea 
                                id="address" 
                                value={data.address} 
                                onChange={e => setData('address', e.target.value)} 
                                className="min-h-[80px]"
                            />
                            {errors.address && <p className="text-xs text-destructive">{errors.address}</p>}
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-6 border-t border-border">
                <Button type="submit" disabled={processing} className="w-full md:w-auto gap-2 px-8">
                    {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    {employee ? 'Update Employee Record' : 'Create Employee Record'}
                </Button>
            </div>
        </form>
    );
}
