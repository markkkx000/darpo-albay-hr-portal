import { Link } from '@inertiajs/react';
// Premium Employee Form Component
import { Loader2, Save, AlertCircle, Plus, Trash2, Star, Upload } from 'lucide-react';
import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { DatePicker } from '@/components/date-picker';
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

interface AppointmentStatus {
    id: number;
    name: string;
}

interface Props {
    employee?: any;
    divisions: Division[];
    units: Unit[];
    positions: Position[];
    appointmentStatuses: AppointmentStatus[];
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
    appointmentStatuses,
    onSubmit,
    data,
    setData,
    errors,
    processing,
    cancelUrl = '#'
}: Props) {
    const [filePreview, setFilePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!(data.profile_picture instanceof File)) {
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setFilePreview(reader.result as string);
        };
        reader.readAsDataURL(data.profile_picture);
    }, [data.profile_picture]);

    const previewUrl = (() => {
        if (data.profile_picture instanceof File) {
            return filePreview || '/img/pfp_placeholder.png';
        }

        if (employee?.avatar) {
            return employee.avatar;
        }

        return '/img/pfp_placeholder.png';
    })();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (file) {
            setData('profile_picture', file);
        }
    };

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
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {/* Left: Profile Picture Column */}
                        <div className="flex flex-col items-center justify-center p-4 border border-dashed rounded-3xl bg-surface-2/10 hover:bg-surface-2/20 transition-all duration-300 gap-3 group relative h-fit">
                            <div className="relative h-28 w-28 rounded-full overflow-hidden shadow-inner border border-border group-hover:scale-105 transition-all duration-300">
                                <img 
                                    src={previewUrl || '/img/pfp_placeholder.png'} 
                                    alt="Profile Preview" 
                                    className="h-full w-full object-cover"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = '/img/pfp_placeholder.png';
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                >
                                    <Upload className="h-5 w-5 text-white" />
                                </button>
                            </div>
                            
                            <div className="text-center">
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="btn-ghost-specular border-border/20 rounded-xl px-3 py-1 h-7 text-xxs font-bold"
                                >
                                    Upload Photo
                                </Button>
                                <p className="text-[10px] text-muted-foreground mt-1">
                                    WEBP, PNG, JPG max 5MB
                                </p>
                            </div>

                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                onChange={handleFileChange} 
                                accept="image/jpeg,image/png,image/webp" 
                                className="hidden" 
                            />
                            {errors.profile_picture && <p className="text-xs text-destructive text-center mt-1">{errors.profile_picture}</p>}
                        </div>

                        {/* Right: Personal Info Fields (spanning 3 columns) */}
                        <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
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
                                <Label htmlFor="employee_number">Employee Number <Required /></Label>
                                <Input
                                    id="employee_number"
                                    value={data.employee_number}
                                    onChange={e => setData('employee_number', e.target.value)}
                                    aria-invalid={!!errors.employee_number}
                                    className={cn(errors.employee_number && "border-destructive focus-visible:ring-destructive")}
                                />
                                {errors.employee_number && <p className="text-xs text-destructive">{errors.employee_number}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="date_of_birth">Date of Birth</Label>
                                <DatePicker
                                    id="date_of_birth"
                                    value={data.date_of_birth}
                                    onChange={val => setData('date_of_birth', val || '')}
                                    aria-invalid={!!errors.date_of_birth}
                                />
                                {errors.date_of_birth && <p className="text-xs text-destructive">{errors.date_of_birth}</p>}
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
                                <Label htmlFor="civil_status">Civil Status</Label>
                                <Select
                                    value={data.civil_status || ""}
                                    onValueChange={value => setData('civil_status', value)}
                                >
                                    <SelectTrigger
                                        aria-invalid={!!errors.civil_status}
                                        className={cn(errors.civil_status && "border-destructive focus:ring-destructive")}
                                    >
                                        <SelectValue placeholder="Select Civil Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Single">Single</SelectItem>
                                        <SelectItem value="Married">Married</SelectItem>
                                        <SelectItem value="Widowed">Widowed</SelectItem>
                                        <SelectItem value="Divorced">Divorced</SelectItem>
                                        <SelectItem value="Separated">Separated</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.civil_status && <p className="text-xs text-destructive">{errors.civil_status}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="eligibility">Eligibility</Label>
                                <Input
                                    id="eligibility"
                                    value={data.eligibility || ''}
                                    onChange={e => setData('eligibility', e.target.value)}
                                    aria-invalid={!!errors.eligibility}
                                    className={cn(errors.eligibility && "border-destructive focus-visible:ring-destructive")}
                                    placeholder="e.g. CS Professional"
                                />
                                {errors.eligibility && <p className="text-xs text-destructive">{errors.eligibility}</p>}
                            </div>
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
                                value={data.division_id?.toString() || ""}
                                onValueChange={value => {
                                    setData(d => ({ ...d, division_id: value, unit_id: '', positions: [{ id: '', name: '', is_primary: true }] }));
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
                                value={data.unit_id?.toString() || ""}
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

                        <div className="space-y-2">
                            <Label htmlFor="appointment_status_id">Appointment Status <Required /></Label>
                            <Select
                                value={data.appointment_status_id?.toString() || ""}
                                onValueChange={value => setData('appointment_status_id', value)}
                            >
                                <SelectTrigger
                                    aria-invalid={!!errors.appointment_status_id}
                                    className={cn(errors.appointment_status_id && "border-destructive focus:ring-destructive")}
                                >
                                    <SelectValue placeholder="Select Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    {appointmentStatuses.map(status => (
                                        <SelectItem key={status.id} value={status.id.toString()}>{status.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.appointment_status_id && <p className="text-xs text-destructive">{errors.appointment_status_id}</p>}
                        </div>

                        <div className="space-y-3 md:col-span-3 pt-2">
                            <div className="flex items-center justify-between">
                                <Label>Positions <Required /></Label>
                                <Button type="button" variant="default" size="sm" onClick={handleAddPosition} className="btn-specular rounded-2xl px-6 py-2 h-9 transition-all group border-none shadow-md">
                                    <Plus className="h-4 w-4 mr-2 text-[#1c1c1e] transition-colors" />
                                    <span className="text-[#1c1c1e] font-bold">Add Position</span>
                                </Button>
                            </div>

                            <div className="space-y-4 mt-2">
                                {data.positions.map((pos: any, index: number) => (
                                    <div key={index} className="flex items-start gap-2 p-3 bg-surface-2/30 rounded-2xl border border-border/5">
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
                                                className={cn(
                                                    "rounded-2xl transition-all h-9 w-9 p-0 group",
                                                    pos.is_primary
                                                        ? "item-hover-gradient border-none shadow-md"
                                                        : "btn-ghost-specular border-border/20"
                                                )}
                                            >
                                                <Star className={cn(
                                                    "h-4 w-4 transition-colors",
                                                    pos.is_primary ? "fill-current text-[#1c1c1e]" : "text-muted-foreground group-hover:text-foreground"
                                                )} />
                                            </Button>

                                            {data.positions.length > 1 && (
                                                <Button
                                                    type="button"
                                                    variant="ghost-destructive"
                                                    size="icon"
                                                    className="btn-ghost-danger-specular border-border/20 h-9 w-9 p-0 rounded-full hover:scale-110 transition-all duration-300 group"
                                                    onClick={() => handleRemovePosition(index)}
                                                >
                                                    <Trash2 className="h-4 w-4 text-muted-foreground group-hover:text-white transition-colors" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {errors.positions && typeof errors.positions === 'string' && <p className="text-xs text-destructive">{errors.positions}</p>}
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
                            <Label htmlFor="plantilla_position">Plantilla Position</Label>
                            <Input
                                id="plantilla_position"
                                value={data.plantilla_position}
                                onChange={e => setData('plantilla_position', e.target.value)}
                                aria-invalid={!!errors.plantilla_position}
                                className={cn(errors.plantilla_position && "border-destructive focus-visible:ring-destructive")}
                            />
                            {errors.plantilla_position && <p className="text-xs text-destructive">{errors.plantilla_position}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="item_number">Item Number</Label>
                            <Input
                                id="item_number"
                                value={data.item_number}
                                onChange={e => setData('item_number', e.target.value)}
                                aria-invalid={!!errors.item_number}
                                className={cn(errors.item_number && "border-destructive focus-visible:ring-destructive")}
                            />
                            {errors.item_number && <p className="text-xs text-destructive">{errors.item_number}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="office_per_appointment">Offc. Per Appointment</Label>
                            <Input
                                id="office_per_appointment"
                                value={data.office_per_appointment}
                                onChange={e => setData('office_per_appointment', e.target.value)}
                                aria-invalid={!!errors.office_per_appointment}
                                className={cn(errors.office_per_appointment && "border-destructive focus-visible:ring-destructive")}
                            />
                            {errors.office_per_appointment && <p className="text-xs text-destructive">{errors.office_per_appointment}</p>}
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
                            <DatePicker
                                id="hire_date"
                                value={data.hire_date}
                                onChange={val => setData('hire_date', val || '')}
                                aria-invalid={!!errors.hire_date}
                            />
                            {errors.hire_date && <p className="text-xs text-destructive">{errors.hire_date}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="date_hired_government">Date Hired in Gov.</Label>
                            <DatePicker
                                id="date_hired_government"
                                value={data.date_hired_government}
                                onChange={val => setData('date_hired_government', val || '')}
                                aria-invalid={!!errors.date_hired_government}
                            />
                            {errors.date_hired_government && <p className="text-xs text-destructive">{errors.date_hired_government}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="orig_date_of_appointment">Orig Date of Appointment</Label>
                            <DatePicker
                                id="original_appointment_date"
                                value={data.orig_date_of_appointment}
                                onChange={val => setData('orig_date_of_appointment', val || '')}
                                aria-invalid={!!errors.orig_date_of_appointment}
                            />
                            {errors.orig_date_of_appointment && <p className="text-xs text-destructive">{errors.orig_date_of_appointment}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="date_of_latest_appointment">Date of Latest Appointment</Label>
                            <DatePicker
                                id="date_of_latest_appointment"
                                value={data.date_of_latest_appointment}
                                onChange={val => setData('date_of_latest_appointment', val || '')}
                                aria-invalid={!!errors.date_of_latest_appointment}
                            />
                            {errors.date_of_latest_appointment && <p className="text-xs text-destructive">{errors.date_of_latest_appointment}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="date_of_assumption">Date of Assumption</Label>
                            <DatePicker
                                id="date_of_assumption"
                                value={data.date_of_assumption}
                                onChange={val => setData('date_of_assumption', val || '')}
                                aria-invalid={!!errors.date_of_assumption}
                            />
                            {errors.date_of_assumption && <p className="text-xs text-destructive">{errors.date_of_assumption}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="date_of_separation">Date of Separation</Label>
                            <DatePicker
                                id="date_of_separation"
                                value={data.date_of_separation}
                                onChange={val => setData('date_of_separation', val || '')}
                                aria-invalid={!!errors.date_of_separation}
                            />
                            {errors.date_of_separation && <p className="text-xs text-destructive">{errors.date_of_separation}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="fund_code">Fund Code</Label>
                            <Input
                                id="fund_code"
                                value={data.fund_code}
                                onChange={e => setData('fund_code', e.target.value)}
                                aria-invalid={!!errors.fund_code}
                                className={cn(errors.fund_code && "border-destructive focus-visible:ring-destructive")}
                            />
                            {errors.fund_code && <p className="text-xs text-destructive">{errors.fund_code}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="func_activity_code">Func./Activity Code</Label>
                            <Input
                                id="func_activity_code"
                                value={data.func_activity_code}
                                onChange={e => setData('func_activity_code', e.target.value)}
                                aria-invalid={!!errors.func_activity_code}
                                className={cn(errors.func_activity_code && "border-destructive focus-visible:ring-destructive")}
                            />
                            {errors.func_activity_code && <p className="text-xs text-destructive">{errors.func_activity_code}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="salary_grade">Salary Grade</Label>
                            <Input
                                id="salary_grade"
                                type="number"
                                min="1"
                                max="33"
                                value={data.salary_grade || ""}
                                onChange={e => setData('salary_grade', e.target.value ? parseInt(e.target.value) : "")}
                                aria-invalid={!!errors.salary_grade}
                                className={cn(errors.salary_grade && "border-destructive focus-visible:ring-destructive")}
                            />
                            {errors.salary_grade && <p className="text-xs text-destructive">{errors.salary_grade}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="salary_step">Salary Step</Label>
                            <Input
                                id="salary_step"
                                type="number"
                                min="1"
                                max="8"
                                value={data.salary_step || ""}
                                onChange={e => setData('salary_step', e.target.value ? parseInt(e.target.value) : "")}
                                aria-invalid={!!errors.salary_step}
                                className={cn(errors.salary_step && "border-destructive focus-visible:ring-destructive")}
                            />
                            {errors.salary_step && <p className="text-xs text-destructive">{errors.salary_step}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="monthly_salary">Monthly Salary</Label>
                            <Input
                                id="monthly_salary"
                                type="number"
                                step="0.01"
                                min="0"
                                value={data.monthly_salary || ""}
                                onChange={e => setData('monthly_salary', e.target.value ? parseFloat(e.target.value) : "")}
                                aria-invalid={!!errors.monthly_salary}
                                className={cn(errors.monthly_salary && "border-destructive focus-visible:ring-destructive")}
                            />
                            {errors.monthly_salary && <p className="text-xs text-destructive">{errors.monthly_salary}</p>}
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
                            <Label htmlFor="lbp_account_number">LBP Account Number</Label>
                            <Input
                                id="lbp_account_number"
                                value={data.lbp_account_number}
                                onChange={e => setData('lbp_account_number', e.target.value)}
                                aria-invalid={!!errors.lbp_account_number}
                                className={cn(errors.lbp_account_number && "border-destructive focus-visible:ring-destructive")}
                            />
                            {errors.lbp_account_number && <p className="text-xs text-destructive">{errors.lbp_account_number}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="prc_id_no">PRC ID No.</Label>
                            <Input
                                id="prc_id_no"
                                value={data.prc_id_no}
                                onChange={e => handlePrcChange(e.target.value)}
                                aria-invalid={!!errors.prc_id_no}
                                className={cn(errors.prc_id_no && "border-destructive focus-visible:ring-destructive")}
                            />
                            {errors.prc_id_no && <p className="text-xs text-destructive">{errors.prc_id_no}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="prc_expiration">PRC Expiration</Label>
                            <DatePicker
                                id="prc_expiration"
                                value={data.prc_expiration}
                                onChange={val => setData('prc_expiration', val || '')}
                                disabled={!isPrcNotEmpty}
                                aria-invalid={!!errors.prc_expiration}
                            />
                            {errors.prc_expiration && <p className="text-xs text-destructive">{errors.prc_expiration}</p>}
                        </div>
                    </div>
                </div>

                {/* Contact & Address Information */}
                <div className="space-y-4 md:col-span-2">
                    <div className="flex items-center gap-2 mb-4 border-b pb-2">
                        <h3 className="text-sm font-black text-muted-foreground uppercase tracking-[0.2em]">Contact & Address Information</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                                id="email"
                                type="email"
                                value={data.email}
                                onChange={e => setData('email', e.target.value)}
                                placeholder="example@example.com"
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
                            <Label htmlFor="present_address">Present Address</Label>
                            <Textarea
                                id="present_address"
                                value={data.present_address}
                                onChange={e => setData('present_address', e.target.value)}
                                className={cn(
                                    "min-h-[80px]",
                                    errors.present_address && "border-destructive focus-visible:ring-destructive"
                                )}
                                aria-invalid={!!errors.present_address}
                            />
                            {errors.present_address && <p className="text-xs text-destructive">{errors.present_address}</p>}
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="address">Permanent Address</Label>
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
