import { useForm } from '@inertiajs/react';
import { Loader2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface Division {
    id: number;
    name: string;
}

interface Unit {
    id: number;
    name: string;
    division_id: number;
}

interface Position {
    id: number;
    name: string;
    division_id: number;
}

interface EmploymentStatus {
    id: number;
    name: string;
}

interface Props {
    employee?: any;
    divisions: Division[];
    units: Unit[];
    positions: Position[];
    employmentStatuses: EmploymentStatus[];
    onSubmit: (data: any) => void;
}

export function EmployeeForm({ 
    employee, 
    divisions, 
    units,
    positions, 
    employmentStatuses, 
    onSubmit 
}: Props) {
    const { data, setData, processing, errors } = useForm({
        employee_number: employee?.employee_number || '',
        first_name: employee?.first_name || '',
        last_name: employee?.last_name || '',
        email: employee?.email || '',
        sex: employee?.sex || '',
        date_of_birth: employee?.date_of_birth ? String(employee.date_of_birth).split('T')[0] : '',
        
        position_id: employee?.position_id?.toString() || '',
        division_id: employee?.division_id?.toString() || '',
        unit_id: employee?.unit_id?.toString() || '',
        employment_status_id: employee?.employment_status_id?.toString() || '',
        hire_date: employee?.hire_date ? String(employee.hire_date).split('T')[0] : '',
        years_in_service: employee?.years_in_service || '',
        plantilla_number: employee?.plantilla_number || '',
        orig_date_of_appointment: employee?.orig_date_of_appointment ? String(employee.orig_date_of_appointment).split('T')[0] : '',
        date_of_latest_appointment: employee?.date_of_latest_appointment ? String(employee.date_of_latest_appointment).split('T')[0] : '',
        date_of_assumption: employee?.date_of_assumption ? String(employee.date_of_assumption).split('T')[0] : '',
        
        contact_number: employee?.contact_number || '',
        address: employee?.address || '',
        
        gsis_bp_number: employee?.gsis_bp_number || '',
        philhealth: employee?.philhealth || '',
        hdmf_pagibig_no: employee?.hdmf_pagibig_no || '',
        tin_number: employee?.tin_number || '',
        prc_id_no: employee?.prc_id_no || '',
        prc_expiration: employee?.prc_expiration ? String(employee.prc_expiration).split('T')[0] : '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const payload = { ...data };

        if (payload.unit_id === 'none') {
            payload.unit_id = '';
        }

        onSubmit(payload);
    };

    // Filter positions and units based on selected division
    const filteredPositions = data.division_id 
        ? positions.filter(p => p.division_id === parseInt(data.division_id))
        : [];
        
    const filteredUnits = data.division_id 
        ? units.filter(u => u.division_id === parseInt(data.division_id))
        : [];

    const isPrcValid = /^\d{7}$/.test(data.prc_id_no || '');

    const handlePrcChange = (val: string) => {
        setData('prc_id_no', val);

        if (!/^\d{7}$/.test(val)) {
            setData('prc_expiration', ''); // Clear expiration if invalid
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Personal Information */}
                <div className="space-y-4 md:col-span-2">
                    <div className="flex items-center gap-2 mb-4 border-b pb-2">
                        <h3 className="text-sm font-black text-muted-foreground uppercase tracking-[0.2em]">Personal Information</h3>
                    </div>
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
                        <div className="space-y-2">
                            <Label htmlFor="sex">Sex</Label>
                            <Select 
                                value={data.sex} 
                                onValueChange={value => setData('sex', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Sex" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Male">Male</SelectItem>
                                    <SelectItem value="Female">Female</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.sex && <p className="text-xs text-destructive">{errors.sex}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="date_of_birth">Date of Birth</Label>
                            <Input 
                                id="date_of_birth" 
                                type="date"
                                value={data.date_of_birth} 
                                onChange={e => setData('date_of_birth', e.target.value)} 
                            />
                            {errors.date_of_birth && <p className="text-xs text-destructive">{errors.date_of_birth}</p>}
                        </div>
                    </div>
                </div>

                {/* Employment Information */}
                <div className="space-y-4 md:col-span-2">
                    <div className="flex items-center gap-2 mb-4 border-b pb-2">
                        <h3 className="text-sm font-black text-muted-foreground uppercase tracking-[0.2em]">Employment Information</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="division_id">Division</Label>
                            <Select 
                                value={data.division_id} 
                                onValueChange={value => {
                                    setData(prev => ({ ...prev, division_id: value, unit_id: '', position_id: '' }));
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Division" />
                                </SelectTrigger>
                                <SelectContent>
                                    {divisions.map(div => (
                                        <SelectItem key={div.id} value={div.id.toString()}>{div.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.division_id && <p className="text-xs text-destructive">{errors.division_id}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="unit_id">Unit</Label>
                            <Select 
                                value={data.unit_id} 
                                onValueChange={value => setData('unit_id', value)}
                                disabled={!data.division_id || filteredUnits.length === 0}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={!data.division_id ? "Select Division First" : filteredUnits.length === 0 ? "No Units Available" : "Select Unit"} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">None</SelectItem>
                                    {filteredUnits.map(unit => (
                                        <SelectItem key={unit.id} value={unit.id.toString()}>{unit.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.unit_id && <p className="text-xs text-destructive">{errors.unit_id}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="position_id">Position</Label>
                            <Select 
                                value={data.position_id} 
                                onValueChange={value => setData('position_id', value)}
                                disabled={!data.division_id || filteredPositions.length === 0}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={!data.division_id ? "Select Division First" : filteredPositions.length === 0 ? "No Positions Available" : "Select Position"} />
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
                            <Label htmlFor="plantilla_number">Plantilla Number</Label>
                            <Input 
                                id="plantilla_number" 
                                value={data.plantilla_number} 
                                onChange={e => setData('plantilla_number', e.target.value)} 
                            />
                            {errors.plantilla_number && <p className="text-xs text-destructive">{errors.plantilla_number}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="years_in_service">Years in Service</Label>
                            <Input 
                                id="years_in_service" 
                                type="number"
                                min="0"
                                value={data.years_in_service} 
                                onChange={e => setData('years_in_service', e.target.value)} 
                            />
                            {errors.years_in_service && <p className="text-xs text-destructive">{errors.years_in_service}</p>}
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

                        <div className="space-y-2">
                            <Label htmlFor="orig_date_of_appointment">Orig Date of Appointment</Label>
                            <Input 
                                id="orig_date_of_appointment" 
                                type="date" 
                                value={data.orig_date_of_appointment} 
                                onChange={e => setData('orig_date_of_appointment', e.target.value)} 
                            />
                            {errors.orig_date_of_appointment && <p className="text-xs text-destructive">{errors.orig_date_of_appointment}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="date_of_latest_appointment">Date of Latest Appointment</Label>
                            <Input 
                                id="date_of_latest_appointment" 
                                type="date" 
                                value={data.date_of_latest_appointment} 
                                onChange={e => setData('date_of_latest_appointment', e.target.value)} 
                            />
                            {errors.date_of_latest_appointment && <p className="text-xs text-destructive">{errors.date_of_latest_appointment}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="date_of_assumption">Date of Assumption</Label>
                            <Input 
                                id="date_of_assumption" 
                                type="date" 
                                value={data.date_of_assumption} 
                                onChange={e => setData('date_of_assumption', e.target.value)} 
                            />
                            {errors.date_of_assumption && <p className="text-xs text-destructive">{errors.date_of_assumption}</p>}
                        </div>
                    </div>
                </div>

                {/* Government IDs */}
                <div className="space-y-4 md:col-span-2">
                    <div className="flex items-center gap-2 mb-4 border-b pb-2">
                        <h3 className="text-sm font-black text-muted-foreground uppercase tracking-[0.2em]">Government IDs & Credentials</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="gsis_bp_number">GSIS BP Number</Label>
                            <Input 
                                id="gsis_bp_number" 
                                value={data.gsis_bp_number} 
                                onChange={e => setData('gsis_bp_number', e.target.value)} 
                            />
                            {errors.gsis_bp_number && <p className="text-xs text-destructive">{errors.gsis_bp_number}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="philhealth">PhilHealth</Label>
                            <Input 
                                id="philhealth" 
                                value={data.philhealth} 
                                onChange={e => setData('philhealth', e.target.value)} 
                            />
                            {errors.philhealth && <p className="text-xs text-destructive">{errors.philhealth}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="hdmf_pagibig_no">HDMF PAGIBIG No.</Label>
                            <Input 
                                id="hdmf_pagibig_no" 
                                value={data.hdmf_pagibig_no} 
                                onChange={e => setData('hdmf_pagibig_no', e.target.value)} 
                            />
                            {errors.hdmf_pagibig_no && <p className="text-xs text-destructive">{errors.hdmf_pagibig_no}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="tin_number">TIN Number</Label>
                            <Input 
                                id="tin_number" 
                                value={data.tin_number} 
                                onChange={e => setData('tin_number', e.target.value)} 
                            />
                            {errors.tin_number && <p className="text-xs text-destructive">{errors.tin_number}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="prc_id_no">PRC ID No.</Label>
                            <Input 
                                id="prc_id_no" 
                                value={data.prc_id_no} 
                                onChange={e => handlePrcChange(e.target.value)} 
                                placeholder="7-digit number"
                            />
                            {errors.prc_id_no && <p className="text-xs text-destructive">{errors.prc_id_no}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="prc_expiration">PRC Expiration</Label>
                            <Input 
                                id="prc_expiration" 
                                type="date" 
                                value={data.prc_expiration} 
                                onChange={e => setData('prc_expiration', e.target.value)} 
                                disabled={!isPrcValid}
                                className={!isPrcValid ? "opacity-50 cursor-not-allowed" : ""}
                            />
                            {errors.prc_expiration && <p className="text-xs text-destructive">{errors.prc_expiration}</p>}
                        </div>
                    </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-4 md:col-span-2">
                    <div className="flex items-center gap-2 mb-4 border-b pb-2">
                        <h3 className="text-sm font-black text-muted-foreground uppercase tracking-[0.2em]">Contact Information</h3>
                    </div>
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

            <div className="flex justify-end pt-6 border-t border-border/50">
                <Button type="submit" disabled={processing} className="btn-specular w-full md:w-auto gap-2 px-8 py-6 rounded-xl border-none shadow-lg">
                    {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    {employee ? 'Update Employee Record' : 'Create Employee Record'}
                </Button>
            </div>
        </form>
    );
}
