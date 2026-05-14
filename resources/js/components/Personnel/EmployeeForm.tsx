import { Link } from '@inertiajs/react';
import { Loader2, Save, AlertCircle, Plus, Trash2, Star } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { PositionCombobox } from './PositionCombobox';

const Required = () => <span className="text-destructive ml-1">*</span>;

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
    onSubmit: (e: React.FormEvent) => void;
    data: any;
    setData: (key: string | ((prev: any) => any), value?: any) => void;
    errors: any;
    processing: boolean;
    cancelUrl?: string;
}

export function EmployeeForm({
    employee,
    divisions,
    units,
    positions,
    employmentStatuses,
    onSubmit,
    data,
    setData,
    errors,
    processing,
    cancelUrl = '#'
}: Props) {

    const handleSubmit = (e: React.FormEvent) => {
        onSubmit(e);
    };

    // Filter positions and units based on selected division
    const filteredPositions = data.division_id
        ? positions.filter(p => p.division_id === parseInt(data.division_id))
        : [];

    const filteredUnits = data.division_id
        ? units.filter(u => u.division_id === parseInt(data.division_id))
        : [];

    const isPrcNotEmpty = !!data.prc_id_no;

    const handlePrcChange = (val: string) => {
        setData('prc_id_no', val);

        if (!val) {
            setData('prc_expiration', ''); // Clear expiration if empty
        }
    };

    const handleAddPosition = () => {
        setData('positions', [...data.positions, { id: '', name: '', is_primary: false }]);
    };

    const handleUpdatePosition = (index: number, newPosition: { id?: number | string, name: string }) => {
        const newPositions = [...data.positions];
        newPositions[index] = { ...newPositions[index], ...newPosition };
        setData('positions', newPositions);
    };

    const handleRemovePosition = (index: number) => {
        const newPositions = data.positions.filter((_: any, i: number) => i !== index);

        if (data.positions[index].is_primary && newPositions.length > 0) {
            newPositions[0].is_primary = true;
        }

        setData('positions', newPositions);
    };

    const handleSetPrimaryPosition = (index: number) => {
        const newPositions = data.positions.map((p: any, i: number) => ({ ...p, is_primary: i === index }));
        setData('positions', newPositions);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {Object.keys(errors).length > 0 && (
                <Alert variant="destructive" className="animate-in fade-in slide-in-from-top-2 duration-300">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Validation Error</AlertTitle>
                    <AlertDescription>
                        Please check the form for missing or invalid fields.
                    </AlertDescription>
                </Alert>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* Personal Information */}
                <div className="space-y-4 md:col-span-2">
                    <div className="flex items-center gap-2 mb-4 border-b pb-2">
                        <h3 className="text-sm font-black text-muted-foreground uppercase tracking-[0.2em]">Personal Information</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="employee_number">Employee Number <Required /></Label>
                            <Input
                                id="employee_number"
                                value={data.employee_number}
                                onChange={e => setData('employee_number', e.target.value)}
                                placeholder="P-XXXX"
                                aria-invalid={!!errors.employee_number}
                                className={cn(errors.employee_number && "border-destructive focus-visible:ring-destructive")}
                            />
                            {errors.employee_number && <p className="text-xs text-destructive">{errors.employee_number}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="first_name">First Name <Required /></Label>
                            <Input
                                id="first_name"
                                value={data.first_name}
                                onChange={e => setData('first_name', e.target.value)}
                                aria-invalid={!!errors.first_name}
                                className={cn(errors.first_name && "border-destructive focus-visible:ring-destructive")}
                            />
                            {errors.first_name && <p className="text-xs text-destructive">{errors.first_name}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="middle_name">Middle Name</Label>
                            <Input
                                id="middle_name"
                                value={data.middle_name || ''}
                                onChange={e => setData('middle_name', e.target.value)}
                                aria-invalid={!!errors.middle_name}
                                className={cn(errors.middle_name && "border-destructive focus-visible:ring-destructive")}
                            />
                            {errors.middle_name && <p className="text-xs text-destructive">{errors.middle_name}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="last_name">Last Name <Required /></Label>
                            <Input
                                id="last_name"
                                value={data.last_name}
                                onChange={e => setData('last_name', e.target.value)}
                                aria-invalid={!!errors.last_name}
                                className={cn(errors.last_name && "border-destructive focus-visible:ring-destructive")}
                            />
                            {errors.last_name && <p className="text-xs text-destructive">{errors.last_name}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="sex">Sex</Label>
                            <Select
                                value={data.sex}
                                onValueChange={value => setData('sex', value)}
                            >
                                <SelectTrigger 
                                    aria-invalid={!!errors.sex}
                                    className={cn(errors.sex && "border-destructive focus:ring-destructive")}
                                >
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
                                aria-invalid={!!errors.date_of_birth}
                                className={cn(errors.date_of_birth && "border-destructive focus-visible:ring-destructive")}
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
                            <Label htmlFor="division_id">Division <Required /></Label>
                            <Select
                                value={data.division_id}
                                onValueChange={value => {
                                    setData(prev => ({ ...prev, division_id: value, unit_id: '', positions: [{ id: '', name: '', is_primary: true }] }));
                                }}
                            >
                                <SelectTrigger 
                                    aria-invalid={!!errors.division_id}
                                    className={cn(errors.division_id && "border-destructive focus:ring-destructive")}
                                >
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
                                <SelectTrigger 
                                    aria-invalid={!!errors.unit_id}
                                    className={cn(errors.unit_id && "border-destructive focus:ring-destructive")}
                                >
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

                        <div className="space-y-4 md:col-span-3 border p-4 rounded-xl bg-card">
                            <div className="flex items-center justify-between">
                                <Label>Positions <Required /></Label>
                                <Button type="button" variant="outline" size="sm" onClick={handleAddPosition}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Position
                                </Button>
                            </div>
                            
                            <div className="space-y-3">
                                {data.positions.map((pos: any, index: number) => (
                                    <div key={index} className="flex items-start gap-2">
                                        <div className="flex-1">
                                            <PositionCombobox
                                                positions={filteredPositions}
                                                value={{ id: pos.id, name: pos.name }}
                                                onChange={(val) => handleUpdatePosition(index, val)}
                                                disabled={!data.division_id}
                                                placeholder={!data.division_id ? "Select Division First" : "Select or create position"}
                                            />
                                            {errors[`positions.${index}.id`] && <p className="text-xs text-destructive mt-1">{errors[`positions.${index}.id`]}</p>}
                                            {errors[`positions.${index}.name`] && <p className="text-xs text-destructive mt-1">{errors[`positions.${index}.name`]}</p>}
                                        </div>
                                        
                                        <div className="flex items-center gap-1">
                                            <Button
                                                type="button"
                                                variant={pos.is_primary ? "default" : "outline"}
                                                size="icon"
                                                title={pos.is_primary ? "Primary Position" : "Set as Primary"}
                                                onClick={() => handleSetPrimaryPosition(index)}
                                                className={pos.is_primary ? "bg-amber-500 hover:bg-amber-600 text-white border-none" : ""}
                                            >
                                                <Star className={cn("h-4 w-4", pos.is_primary ? "fill-current" : "")} />
                                            </Button>
                                            
                                            {data.positions.length > 1 && (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="icon"
                                                    className="text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20"
                                                    onClick={() => handleRemovePosition(index)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {errors.positions && typeof errors.positions === 'string' && <p className="text-xs text-destructive">{errors.positions}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="employment_status_id">Employment Status <Required /></Label>
                            <Select
                                value={data.employment_status_id}
                                onValueChange={value => setData('employment_status_id', value)}
                            >
                                <SelectTrigger 
                                    aria-invalid={!!errors.employment_status_id}
                                    className={cn(errors.employment_status_id && "border-destructive focus:ring-destructive")}
                                >
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
                                aria-invalid={!!errors.plantilla_number}
                                className={cn(errors.plantilla_number && "border-destructive focus-visible:ring-destructive")}
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
                                aria-invalid={!!errors.years_in_service}
                                className={cn(errors.years_in_service && "border-destructive focus-visible:ring-destructive")}
                            />
                            {errors.years_in_service && <p className="text-xs text-destructive">{errors.years_in_service}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="hire_date">Date of Hire <Required /></Label>
                            <Input
                                id="hire_date"
                                type="date"
                                value={data.hire_date}
                                onChange={e => setData('hire_date', e.target.value)}
                                aria-invalid={!!errors.hire_date}
                                className={cn(errors.hire_date && "border-destructive focus-visible:ring-destructive")}
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
                                aria-invalid={!!errors.orig_date_of_appointment}
                                className={cn(errors.orig_date_of_appointment && "border-destructive focus-visible:ring-destructive")}
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
                                aria-invalid={!!errors.date_of_latest_appointment}
                                className={cn(errors.date_of_latest_appointment && "border-destructive focus-visible:ring-destructive")}
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
                                aria-invalid={!!errors.date_of_assumption}
                                className={cn(errors.date_of_assumption && "border-destructive focus-visible:ring-destructive")}
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
                                aria-invalid={!!errors.gsis_bp_number}
                                className={cn(errors.gsis_bp_number && "border-destructive focus-visible:ring-destructive")}
                            />
                            {errors.gsis_bp_number && <p className="text-xs text-destructive">{errors.gsis_bp_number}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="philhealth">PhilHealth</Label>
                            <Input
                                id="philhealth"
                                value={data.philhealth}
                                onChange={e => setData('philhealth', e.target.value)}
                                aria-invalid={!!errors.philhealth}
                                className={cn(errors.philhealth && "border-destructive focus-visible:ring-destructive")}
                            />
                            {errors.philhealth && <p className="text-xs text-destructive">{errors.philhealth}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="hdmf_pagibig_no">HDMF PAGIBIG No.</Label>
                            <Input
                                id="hdmf_pagibig_no"
                                value={data.hdmf_pagibig_no}
                                onChange={e => setData('hdmf_pagibig_no', e.target.value)}
                                aria-invalid={!!errors.hdmf_pagibig_no}
                                className={cn(errors.hdmf_pagibig_no && "border-destructive focus-visible:ring-destructive")}
                            />
                            {errors.hdmf_pagibig_no && <p className="text-xs text-destructive">{errors.hdmf_pagibig_no}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="tin_number">TIN Number</Label>
                            <Input
                                id="tin_number"
                                value={data.tin_number}
                                onChange={e => setData('tin_number', e.target.value)}
                                aria-invalid={!!errors.tin_number}
                                className={cn(errors.tin_number && "border-destructive focus-visible:ring-destructive")}
                            />
                            {errors.tin_number && <p className="text-xs text-destructive">{errors.tin_number}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="prc_id_no">PRC ID No.</Label>
                            <Input
                                id="prc_id_no"
                                value={data.prc_id_no}
                                onChange={e => handlePrcChange(e.target.value)}
                                placeholder="Enter PRC ID Number"
                                aria-invalid={!!errors.prc_id_no}
                                className={cn(errors.prc_id_no && "border-destructive focus-visible:ring-destructive")}
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
                                disabled={!isPrcNotEmpty}
                                aria-invalid={!!errors.prc_expiration}
                                className={cn(
                                    !isPrcNotEmpty && "opacity-50 cursor-not-allowed",
                                    errors.prc_expiration && "border-destructive focus-visible:ring-destructive"
                                )}
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
                                aria-invalid={!!errors.email}
                                className={cn(errors.email && "border-destructive focus-visible:ring-destructive")}
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
                                aria-invalid={!!errors.contact_number}
                                className={cn(errors.contact_number && "border-destructive focus-visible:ring-destructive")}
                            />
                            {errors.contact_number && <p className="text-xs text-destructive">{errors.contact_number}</p>}
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="address">Residential Address</Label>
                            <Textarea
                                id="address"
                                value={data.address}
                                onChange={e => setData('address', e.target.value)}
                                className={cn(
                                    "min-h-[80px]",
                                    errors.address && "border-destructive focus-visible:ring-destructive"
                                )}
                                aria-invalid={!!errors.address}
                            />
                            {errors.address && <p className="text-xs text-destructive">{errors.address}</p>}
                        </div>
                    </div>
                </div>

                {/* Account Security (New Employees Only) */}
                {!employee && (
                    <div className="space-y-4 md:col-span-2 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <div className="flex items-center gap-2 mb-4 border-b pb-2">
                            <h3 className="text-sm font-black text-muted-foreground uppercase tracking-[0.2em]">Account Security</h3>
                        </div>
                        <div className="max-w-md space-y-4 p-4 rounded-xl border bg-muted/30">
                            <div className="space-y-2">
                                <Label htmlFor="password">Temporary Password <Required /></Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="password"
                                        value={data.password || ''}
                                        onChange={e => setData('password', e.target.value)}
                                        aria-invalid={!!errors.password}
                                        className={cn(
                                            "font-mono tracking-wider",
                                            errors.password && "border-destructive focus-visible:ring-destructive"
                                        )}
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="shrink-0"
                                        onClick={() => {
                                            const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
                                            const pass = Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
                                            setData('password', pass);
                                        }}
                                    >
                                        Regenerate
                                    </Button>
                                </div>
                                {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
                                <p className="text-xs text-muted-foreground">
                                    This temporary password will be used for the first login. The employee will be prompted to change it.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-6 border-t border-border/50">
                {cancelUrl && (
                    <Button asChild variant="ghost" className="btn-ghost-specular px-8 py-6 rounded-xl border-none">
                        <Link href={cancelUrl}>Cancel</Link>
                    </Button>
                )}
                <Button type="submit" disabled={processing} className="btn-specular w-full md:w-auto gap-2 px-8 py-6 rounded-xl border-none shadow-lg">
                    {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    {employee ? 'Update Employee Record' : 'Create Employee Record'}
                </Button>
            </div>
        </form>
    );
}
