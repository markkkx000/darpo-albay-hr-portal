import { Head, router } from '@inertiajs/react';
import { Plus, Power, PowerOff } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
            description: typeDescription,
            color_code: typeColor,
            is_active: true,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Leave type added successfully');
                setTypeName('');
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
            <div className="container mx-auto py-6 max-w-7xl">
                <div className="mb-6">
                    <h1 className="t-title">Leave Settings</h1>
                    <p className="text-muted-foreground">Manage holidays, leave types, and leave statuses.</p>
                </div>

                <LeaveNavigation />

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Holidays */}
                    <div className="matte-card elev-2">
                        <div className="p-6">
                            <h2 className="text-xl font-semibold mb-4">Holidays ({year})</h2>
                            
                            <div className="mb-4 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 p-4 rounded-xl">
                                <p className="text-sm text-amber-800 dark:text-amber-200">
                                    <strong>Official Reference:</strong> Please verify dates with the 
                                    <a href="https://www.officialgazette.gov.ph/nationwide-holidays/" target="_blank" rel="noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline ml-1">
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
                                <Button variant="ghost" className="btn-ghost-specular" onClick={() => router.get(settings().url, { year })}>
                                    Filter Year
                                </Button>
                            </div>

                            <form onSubmit={handleAddHoliday} className="flex space-x-2 mb-6 items-end">
                                <div className="space-y-1 flex-1">
                                    <Label>Date</Label>
                                    <Input type="date" value={holidayDate} onChange={e => setHolidayDate(e.target.value)} required />
                                </div>
                                <div className="space-y-1 flex-1">
                                    <Label>Name</Label>
                                    <Input type="text" value={holidayName} onChange={e => setHolidayName(e.target.value)} required />
                                </div>
                                <Button type="submit">Add</Button>
                            </form>

                            <div className="space-y-2">
                                {holidays.map((h: any) => (
                                    <div key={h.id} className="flex justify-between items-center p-3 matte-card elev-1">
                                        <div>
                                            <span className="font-medium block">{h.name}</span>
                                            <span className="text-sm text-muted-foreground">{h.date}</span>
                                        </div>
                                        <Button variant="destructive" size="sm" onClick={() => handleDeleteHoliday(h.id)}>
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
                                <h2 className="text-xl font-semibold mb-4">Leave Types</h2>
                                
                                <form onSubmit={handleAddType} className="space-y-3 mb-6 p-4 matte-card elev-1 bg-muted/30">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <Label>Name</Label>
                                            <Input value={typeName} onChange={e => setTypeName(e.target.value)} placeholder="e.g. Vacation Leave" required />
                                        </div>
                                        <div className="space-y-1">
                                            <Label>Color</Label>
                                            <div className="flex space-x-2">
                                                <Input type="color" value={typeColor} onChange={e => setTypeColor(e.target.value)} className="w-12 p-1" />
                                                <Input value={typeColor} onChange={e => setTypeColor(e.target.value)} className="flex-1" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <Label>Description (Optional)</Label>
                                        <Input value={typeDescription} onChange={e => setTypeDescription(e.target.value)} placeholder="Short description..." />
                                    </div>
                                    <Button type="submit" className="w-full">
                                        <Plus className="mr-2 h-4 w-4" /> Add Leave Type
                                    </Button>
                                </form>

                                <div className="space-y-2">
                                    {leaveTypes.map((t: any) => (
                                        <div key={t.id} className={cn("flex items-center justify-between p-3 matte-card elev-1", !t.is_active && "opacity-50 grayscale bg-muted")}>
                                            <div className="flex items-center space-x-3">
                                                <div className="w-4 h-4 rounded-full shrink-0" style={{ backgroundColor: t.color_code }}></div>
                                                <div>
                                                    <span className="font-medium block">{t.name}</span>
                                                    {t.description && <span className="text-xs text-muted-foreground">{t.description}</span>}
                                                </div>
                                            </div>
                                            <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                onClick={() => handleToggleType(t)}
                                                className={t.is_active ? "text-red-500 hover:text-red-600 hover:bg-red-50" : "text-green-500 hover:text-green-600 hover:bg-green-50"}
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
                                <h2 className="text-xl font-semibold mb-4">Leave Statuses</h2>
                                
                                <form onSubmit={handleAddStatus} className="flex space-x-2 mb-6 items-end">
                                    <div className="space-y-1 flex-1">
                                        <Label>Status Name</Label>
                                        <Input value={statusName} onChange={e => setStatusName(e.target.value)} placeholder="e.g. Approved" required />
                                    </div>
                                    <Button type="submit">
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
                                                className={s.is_active ? "text-red-500 hover:text-red-600 hover:bg-red-50" : "text-green-500 hover:text-green-600 hover:bg-green-50"}
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
