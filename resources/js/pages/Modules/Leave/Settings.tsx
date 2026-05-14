import { Head, router } from '@inertiajs/react';
import { Pipette, Plus, Power, PowerOff } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { DatePicker } from '@/components/date-picker';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from '@/lib/utils';
import { store as holidays_store, destroy as holidays_destroy } from '@/routes/leave/holidays/index';
import { settings, index as leave_index } from '@/routes/leave/index';
import { store as statuses_store, update as statuses_update, destroy as statuses_destroy } from '@/routes/leave/statuses/index';
import { store as types_store, update as types_update, destroy as types_destroy } from '@/routes/leave/types/index';
import LeaveNavigation from './Components/LeaveNavigation';


export default function LeaveSettings({ holidays, leaveTypes, leaveStatuses, currentYear }: any) {
    const [year, setYear] = useState(currentYear);
    const [holidayName, setHolidayName] = useState('');
    const [holidayDate, setHolidayDate] = useState('');
    const [typeName, setTypeName] = useState('');
    const [typeAbbreviation, setTypeAbbreviation] = useState('');
    const [typeIsCumulative, setTypeIsCumulative] = useState<string>('null');
    const [typeDescription, setTypeDescription] = useState('');
    const [typeColor, setTypeColor] = useState('#3b82f6');
    const [statusName, setStatusName] = useState('');

    const handleAddHoliday = (e: React.FormEvent) => {
        e.preventDefault();
        router.post(holidays_store().url, {
            name: holidayName,
            date: holidayDate,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Holiday added successfully');
                setHolidayName('');
                setHolidayDate('');
            }
        });
    };

    const handleDeleteHoliday = (id: number) => {
        if (confirm('Are you sure you want to delete this holiday?')) {
            router.delete(holidays_destroy(id).url, {
                preserveScroll: true,
                onSuccess: () => toast.success('Holiday deleted successfully')
            });
        }
    };

    const handleAddType = (e: React.FormEvent) => {
        e.preventDefault();
        router.post(types_store().url, {
            name: typeName,
            abbreviation: typeAbbreviation,
            is_cumulative: typeIsCumulative === 'true' ? true : (typeIsCumulative === 'false' ? false : null),
            description: typeDescription,
            color_code: typeColor,
            is_active: true,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Leave type added successfully');
                setTypeName('');
                setTypeAbbreviation('');
                setTypeIsCumulative('null');
                setTypeDescription('');
                setTypeColor('#3b82f6');
            }
        });
    };

    const handleToggleType = (type: any) => {
        const action = type.is_active ? 'deactivate' : 'reactivate';

        if (confirm(`Are you sure you want to ${action} this leave type?`)) {
            if (type.is_active) {
                router.delete(types_destroy(type.id).url, {
                    preserveScroll: true,
                    onSuccess: () => toast.success(`Leave type ${action}d successfully`)
                });
            } else {
                router.put(types_update(type.id).url, { ...type, is_active: true }, {
                    preserveScroll: true,
                    onSuccess: () => toast.success(`Leave type ${action}d successfully`)
                });
            }
        }
    };

    const handleAddStatus = (e: React.FormEvent) => {
        e.preventDefault();
        router.post(statuses_store().url, {
            name: statusName,
            is_active: true,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Leave status added successfully');
                setStatusName('');
            }
        });
    };

    const handleToggleStatus = (status: any) => {
        const action = status.is_active ? 'deactivate' : 'reactivate';

        if (confirm(`Are you sure you want to ${action} this leave status?`)) {
            if (status.is_active) {
                router.delete(statuses_destroy(status.id).url, {
                    preserveScroll: true,
                    onSuccess: () => toast.success(`Leave status ${action}d successfully`)
                });
            } else {
                router.put(statuses_update(status.id).url, { ...status, is_active: true }, {
                    preserveScroll: true,
                    onSuccess: () => toast.success(`Leave status ${action}d successfully`)
                });
            }
        }
    };

    return (
        <>
            <Head title="Leave Settings" />
            <div className="w-full p-4 md:p-6">
                <div className="mb-6">
                    <h1 className="t-title">Leave Settings</h1>
                    <p className="text-muted-foreground">Manage holidays, leave types, and leave statuses.</p>
                </div>

                <LeaveNavigation />

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Holidays */}
                    <div className="matte-card elev-2">
                        <div className="p-6">
                            <h2 className="t-headline mb-4">Holidays ({year})</h2>

                            <div className="mb-4 matte-card elev-1 border border-border-2 p-4 rounded-xl">
                                <p className="text-sm text-muted-foreground">
                                    <strong className="text-foreground">Official Reference:</strong> Please verify dates with the
                                    <a href="https://www.officialgazette.gov.ph/nationwide-holidays/" target="_blank" rel="noreferrer" className="text-primary hover:underline ml-1">
                                        Official List of Regular Holidays and Special Non-Working Days
                                    </a>.
                                </p>
                            </div>

                            <div className="flex space-x-2 mb-6">
                                <Input
                                    type="number"
                                    value={year}
                                    onChange={(e) => setYear(Number(e.target.value))}
                                    className="w-32"
                                />
                                <Button variant="ghost" className="btn-ghost-specular border-none" onClick={() => router.get(settings().url, { year })}>
                                    Filter Year
                                </Button>
                            </div>

                            <form onSubmit={handleAddHoliday} className="flex space-x-2 mb-6 items-end">
                                <div className="space-y-1 flex-1">
                                    <Label>Date</Label>
                                    <DatePicker value={holidayDate} onChange={val => setHolidayDate(val || '')} />
                                </div>
                                <div className="space-y-1 flex-1">
                                    <Label>Name</Label>
                                    <Input type="text" value={holidayName} onChange={e => setHolidayName(e.target.value)} required />
                                </div>
                                <Button type="submit" className="btn-specular px-5">Add</Button>
                            </form>

                            <div className="space-y-2">
                                {holidays.map((h: any) => (
                                    <div key={h.id} className="flex justify-between items-center p-3 matte-card elev-1">
                                        <div>
                                            <span className="font-medium block">{h.name}</span>
                                            <span className="text-sm text-muted-foreground">{h.date}</span>
                                        </div>
                                        <Button className="btn-ghost-danger-specular border-none px-4" size="sm" onClick={() => handleDeleteHoliday(h.id)}>
                                            Delete
                                        </Button>
                                    </div>
                                ))}
                                {holidays.length === 0 && (
                                    <p className="text-sm text-muted-foreground">No holidays found for this year.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="matte-card elev-2">
                            <div className="p-6">
                                <h2 className="t-headline mb-4">Leave Types</h2>

                                <form onSubmit={handleAddType} className="space-y-4 mb-6 p-4 matte-card elev-1 bg-muted/30">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <Label>Name</Label>
                                            <Input value={typeName} onChange={e => setTypeName(e.target.value)} placeholder="e.g. Vacation Leave" required />
                                        </div>
                                        <div className="space-y-1">
                                            <Label>Abbreviation</Label>
                                            <Input value={typeAbbreviation} onChange={e => setTypeAbbreviation(e.target.value)} placeholder="e.g. VL" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label>Color</Label>
                                            <div className="flex space-x-2">
                                                <div className="relative w-12 h-9 shrink-0 group/color">
                                                    <div
                                                        className="absolute inset-0 rounded-2xl border border-border shadow-sm transition-all group-hover/color:brightness-90 active:scale-95 flex items-center justify-center"
                                                        style={{ backgroundColor: typeColor }}
                                                    >
                                                        <Pipette className="h-4 w-4 text-white opacity-0 group-hover/color:opacity-100 transition-opacity drop-shadow-sm" />
                                                    </div>
                                                    <input
                                                        type="color"
                                                        value={typeColor}
                                                        onChange={e => setTypeColor(e.target.value)}
                                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                    />
                                                </div>
                                                <Input value={typeColor} onChange={e => setTypeColor(e.target.value)} className="flex-1" />
                                            </div>
                                        </div>
                                        <div>
                                            <Label htmlFor="cumulative">Credit Behavior</Label>
                                            <Select value={typeIsCumulative} onValueChange={setTypeIsCumulative}>
                                                <SelectTrigger id="cumulative" className="bg-background">
                                                    <SelectValue placeholder="Select behavior" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="true">Cumulative</SelectItem>
                                                    <SelectItem value="false">Non-Cumulative</SelectItem>
                                                    <SelectItem value="null">N/A </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <Label>Description (Optional)</Label>
                                        <Input value={typeDescription} onChange={e => setTypeDescription(e.target.value)} placeholder="Short description..." />
                                    </div>
                                    <Button type="submit" className="btn-specular w-full">
                                        <Plus className="mr-2 h-4 w-4" /> Add Leave Type
                                    </Button>
                                </form>

                                <div className="space-y-2">
                                    {leaveTypes.map((t: any) => (
                                        <div key={t.id} className={cn("flex items-center justify-between p-3 matte-card elev-1", !t.is_active && "opacity-50 grayscale bg-muted")}>
                                            <div className="flex items-center space-x-3">
                                                <div className="w-4 h-4 rounded-full shrink-0" style={{ backgroundColor: t.color_code }}></div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold block">{t.name}</span>
                                                        {t.abbreviation && <Badge variant="outline" className="text-[10px] font-mono px-1.5 py-0 h-4 bg-muted/50">{t.abbreviation}</Badge>}
                                                        {t.is_cumulative === true && <Badge variant="secondary" className="text-[9px] uppercase tracking-tighter px-1 py-0 h-4 bg-primary/10 text-primary border-none">Cumulative</Badge>}
                                                        {t.is_cumulative === false && <Badge variant="outline" className="text-[9px] uppercase tracking-tighter px-1 py-0 h-4 border-muted-foreground/30 text-muted-foreground">Non-Cumulative</Badge>}
                                                        {t.is_cumulative === null && <Badge variant="outline" className="text-[9px] uppercase tracking-tighter px-1 py-0 h-4 text-muted-foreground/50 border-muted-foreground/20 border-dashed italic">N/A</Badge>}
                                                    </div>
                                                    {t.description && <span className="text-xs text-muted-foreground">{t.description}</span>}
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleToggleType(t)}
                                                className={t.is_active ? 'btn-ghost-danger-specular border-none' : 'btn-ghost-specular border-none'}
                                            >
                                                {t.is_active ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="matte-card elev-2">
                            <div className="p-6">
                                <h2 className="t-headline mb-4">Leave Statuses</h2>

                                <form onSubmit={handleAddStatus} className="flex space-x-2 mb-6 items-end">
                                    <div className="space-y-1 flex-1">
                                        <Label>Status Name</Label>
                                        <Input value={statusName} onChange={e => setStatusName(e.target.value)} placeholder="e.g. Approved" required />
                                    </div>
                                    <Button type="submit" className="btn-specular px-5">
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </form>

                                <div className="space-y-2">
                                    {leaveStatuses.map((s: any) => (
                                        <div key={s.id} className={cn("flex items-center justify-between p-3 matte-card elev-1", !s.is_active && "opacity-50 grayscale bg-muted")}>
                                            <span className="font-medium">{s.name}</span>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleToggleStatus(s)}
                                                className={s.is_active ? 'btn-ghost-danger-specular border-none' : 'btn-ghost-specular border-none'}
                                            >
                                                {s.is_active ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

LeaveSettings.layout = {
    breadcrumbs: [
        { title: 'Leave Tracking', href: leave_index().url },
        { title: 'Settings', href: settings().url },
    ],
};
