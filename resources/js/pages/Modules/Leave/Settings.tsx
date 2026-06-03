import { Head, router } from '@inertiajs/react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { Plus, Power, PowerOff, Pencil } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { DatePicker } from '@/components/date-picker';
import PageHeader from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ColorPicker } from '@/components/ui/color-picker';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import {
    store as holidays_store,
    destroy as holidays_destroy,
} from '@/routes/leave/holidays/index';
import { settings, index as leave_index } from '@/routes/leave/index';
import {
    store as statuses_store,
    update as statuses_update,
    destroy as statuses_destroy,
} from '@/routes/leave/statuses/index';
import {
    store as types_store,
    update as types_update,
    destroy as types_destroy,
} from '@/routes/leave/types/index';
import LeaveNavigation from './Components/LeaveNavigation';

interface Holiday {
    id: number;
    name: string;
    date: string;
    [key: string]: any;
}

interface LeaveType {
    id: number;
    name: string;
    abbreviation: string | null;
    description: string | null;
    color_code?: string;
    is_cumulative: boolean | null;
    is_active: boolean;
}

interface LeaveStatus {
    id: number;
    name: string;
    is_active: boolean;
}

interface Props {
    holidays: Holiday[];
    leaveTypes: LeaveType[];
    leaveStatuses: LeaveStatus[];
    currentYear: number;
}

export default function LeaveSettings({
    holidays,
    leaveTypes,
    leaveStatuses,
    currentYear,
}: Props) {
    const [year, setYear] = useState(currentYear);
    const [holidayName, setHolidayName] = useState('');
    const [holidayDate, setHolidayDate] = useState('');

    // Add form states
    const [typeName, setTypeName] = useState('');
    const [typeAbbreviation, setTypeAbbreviation] = useState('');
    const [typeIsCumulative, setTypeIsCumulative] = useState<string>('null');
    const [typeDescription, setTypeDescription] = useState('');
    const [typeColor, setTypeColor] = useState('#3b82f6');

    const [statusName, setStatusName] = useState('');
    const [processing, setProcessing] = useState(false);

    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmConfig, setConfirmConfig] = useState<{
        title: string;
        description: string;
        confirmText?: string;
        isDestructive?: boolean;
        onConfirm: () => void;
    } | null>(null);

    // Leave Type modal states
    const [addTypeOpen, setAddTypeOpen] = useState(false);
    const [editTypeOpen, setEditTypeOpen] = useState(false);
    const [editingType, setEditingType] = useState<LeaveType | null>(null);

    // Scrollspy state
    const [activeSection, setActiveSection] = useState('holidays');
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setActiveSection(entry.target.id);
                }
            });
        }, {
            root: scrollContainerRef.current,
            rootMargin: '-10px 0px -80% 0px'
        });

        const container = scrollContainerRef.current;

        if (container) {
            container.querySelectorAll('section[id]').forEach(section => observer.observe(section));
        } else {
            document.querySelectorAll('section[id]').forEach(section => observer.observe(section));
        }

        return () => observer.disconnect();
    }, []);

    const scrollTo = (id: string) => {
        const el = document.getElementById(id);

        if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const handleAddHoliday = (e: React.SyntheticEvent) => {
        e.preventDefault();
        router.post(
            holidays_store().url,
            {
                name: holidayName,
                date: holidayDate,
            },
            {
                preserveScroll: true,
                onStart: () => setProcessing(true),
                onFinish: () => setProcessing(false),
                onSuccess: () => {
                    toast.success('Holiday added successfully');
                    setHolidayName('');
                    setHolidayDate('');
                    router.clearHistory();
                },
            },
        );
    };

    const handleDeleteHoliday = (id: number) => {
        setConfirmConfig({
            title: 'Delete Holiday',
            description: 'Are you sure you want to delete this holiday?',
            confirmText: 'Delete',
            isDestructive: true,
            onConfirm: () => {
                router.delete(holidays_destroy(id).url, {
                    preserveScroll: true,
                    onStart: () => setProcessing(true),
                    onFinish: () => setProcessing(false),
                    onSuccess: () => {
                        toast.success('Holiday deleted successfully');
                        router.clearHistory();
                    },
                });
            },
        });
        setConfirmOpen(true);
    };

    const handleAddType = (e: React.SyntheticEvent) => {
        e.preventDefault();
        router.post(
            types_store().url,
            {
                name: typeName,
                abbreviation: typeAbbreviation,
                is_cumulative:
                    typeIsCumulative === 'true'
                        ? true
                        : typeIsCumulative === 'false'
                            ? false
                            : null,
                description: typeDescription,
                color_code: typeColor,
                is_active: true,
            },
            {
                preserveScroll: true,
                onStart: () => setProcessing(true),
                onFinish: () => setProcessing(false),
                onSuccess: () => {
                    toast.success('Leave type added successfully');
                    setTypeName('');
                    setTypeAbbreviation('');
                    setTypeIsCumulative('null');
                    setTypeDescription('');
                    setTypeColor('#3b82f6');
                    setAddTypeOpen(false);
                    router.clearHistory();
                },
            },
        );
    };

    const handleEditType = (e: React.SyntheticEvent) => {
        e.preventDefault();

        if (!editingType) {
return;
}

        router.put(
            types_update(editingType.id).url,
            {
                name: editingType.name,
                abbreviation: editingType.abbreviation,
                is_cumulative: editingType.is_cumulative,
                description: editingType.description,
                color_code: editingType.color_code,
                is_active: editingType.is_active,
            },
            {
                preserveScroll: true,
                onStart: () => setProcessing(true),
                onFinish: () => setProcessing(false),
                onSuccess: () => {
                    toast.success('Leave type updated successfully');
                    setEditTypeOpen(false);
                    router.clearHistory();
                },
            },
        );
    };

    const handleToggleType = (type: any) => {
        const action = type.is_active ? 'deactivate' : 'reactivate';

        setConfirmConfig({
            title: `${type.is_active ? 'Deactivate' : 'Reactivate'} Leave Type`,
            description: `Are you sure you want to ${action} this leave type?`,
            confirmText: type.is_active ? 'Deactivate' : 'Reactivate',
            isDestructive: type.is_active,
            onConfirm: () => {
                if (type.is_active) {
                    router.delete(types_destroy(type.id).url, {
                        preserveScroll: true,
                        onStart: () => setProcessing(true),
                        onFinish: () => setProcessing(false),
                        onSuccess: () => {
                            toast.success(`Leave type ${action}d successfully`);
                            router.clearHistory();
                        },
                    });
                } else {
                    router.put(
                        types_update(type.id).url,
                        { ...type, is_active: true },
                        {
                            preserveScroll: true,
                            onStart: () => setProcessing(true),
                            onFinish: () => setProcessing(false),
                            onSuccess: () => {
                                toast.success(
                                    `Leave type ${action}d successfully`,
                                );
                                router.clearHistory();
                            },
                        },
                    );
                }
            },
        });
        setConfirmOpen(true);
    };

    const handleAddStatus = (e: React.SyntheticEvent) => {
        e.preventDefault();
        router.post(
            statuses_store().url,
            {
                name: statusName,
                is_active: true,
            },
            {
                preserveScroll: true,
                onStart: () => setProcessing(true),
                onFinish: () => setProcessing(false),
                onSuccess: () => {
                    toast.success('Leave status added successfully');
                    setStatusName('');
                    router.clearHistory();
                },
            },
        );
    };

    const handleToggleStatus = (status: any) => {
        const action = status.is_active ? 'deactivate' : 'reactivate';

        setConfirmConfig({
            title: `${status.is_active ? 'Deactivate' : 'Reactivate'} Leave Status`,
            description: `Are you sure you want to ${action} this leave status?`,
            confirmText: status.is_active ? 'Deactivate' : 'Reactivate',
            isDestructive: status.is_active,
            onConfirm: () => {
                if (status.is_active) {
                    router.delete(statuses_destroy(status.id).url, {
                        preserveScroll: true,
                        onStart: () => setProcessing(true),
                        onFinish: () => setProcessing(false),
                        onSuccess: () => {
                            toast.success(
                                `Leave status ${action}d successfully`,
                            );
                            router.clearHistory();
                        },
                    });
                } else {
                    router.put(
                        statuses_update(status.id).url,
                        { ...status, is_active: true },
                        {
                            preserveScroll: true,
                            onStart: () => setProcessing(true),
                            onFinish: () => setProcessing(false),
                            onSuccess: () => {
                                toast.success(
                                    `Leave status ${action}d successfully`,
                                );
                                router.clearHistory();
                            },
                        },
                    );
                }
            },
        });
        setConfirmOpen(true);
    };

    const activeLeaveTypes = leaveTypes.filter(t => t.is_active);
    const disabledLeaveTypes = leaveTypes.filter(t => !t.is_active);

    const renderLeaveTypeCard = (t: LeaveType) => (
        <div
            key={t.id}
            className={cn(
                'matte-card elev-1 flex items-center justify-between py-2 px-3',
                !t.is_active &&
                'bg-muted opacity-50 grayscale',
            )}
        >
            <div className="flex items-center space-x-3">
                <div
                    className="h-4 w-4 shrink-0 rounded-full"
                    style={{
                        backgroundColor:
                            t.color_code,
                    }}
                ></div>
                <div>
                    <div className="flex items-center gap-2">
                        <span className="block font-normal">
                            {t.name}
                        </span>
                        {t.abbreviation && (
                            <Badge
                                variant="outline"
                                className="h-4 bg-muted/50 px-1.5 py-0 font-mono text-[10px]"
                            >
                                {t.abbreviation}
                            </Badge>
                        )}
                        {t.is_cumulative ===
                            true && (
                                <Badge
                                    variant="secondary"
                                    className="h-4 border-none bg-primary/10 px-1 py-0 text-[9px] tracking-tighter text-primary uppercase"
                                >
                                    Cumulative
                                </Badge>
                            )}
                        {t.is_cumulative ===
                            false && (
                                <Badge
                                    variant="outline"
                                    className="h-4 border-muted-foreground/30 px-1 py-0 text-[9px] tracking-tighter text-muted-foreground uppercase"
                                >
                                    Non-Cumulative
                                </Badge>
                            )}
                        {t.is_cumulative ===
                            null && (
                                <Badge
                                    variant="outline"
                                    className="h-4 border-dashed border-muted-foreground/20 px-1 py-0 text-[9px] tracking-tighter text-muted-foreground/50 uppercase italic"
                                >
                                    N/A
                                </Badge>
                            )}
                    </div>
                    {t.description && (
                        <span className="text-xs text-muted-foreground">
                            {t.description}
                        </span>
                    )}
                </div>
            </div>
            <div className="flex items-center space-x-1">
                <Button
                    variant="ghost"
                    size="sm"
                    className="btn-ghost-specular border-none h-7 px-2 text-xs"
                    onClick={() => {
                        setEditingType(t);
                        setEditTypeOpen(true);
                    }}
                    disabled={processing}
                >
                    <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
                </Button>
                <Button
                    variant={t.is_active ? "ghost-destructive" : "ghost"}
                    size="sm"
                    onClick={() => handleToggleType(t)}
                    className={cn(
                        'border-none h-7 px-2 text-xs',
                        t.is_active ? 'btn-ghost-danger-specular' : 'btn-ghost-specular'
                    )}
                    disabled={processing}
                >
                    {t.is_active ? (
                        <><PowerOff className="h-3.5 w-3.5 mr-1" /> Disable</>
                    ) : (
                        <><Power className="h-3.5 w-3.5 mr-1" /> Enable</>
                    )}
                </Button>
            </div>
        </div>
    );

    return (
        <>
            <Head title="Leave Settings" />
            <div className="w-full p-4">
                <PageHeader
                    title="Leave Settings"
                    description="Manage holidays, leave types, and leave statuses."
                />

                <LeaveNavigation />

                <div className="flex flex-col md:flex-row gap-6 items-start mt-6 h-[calc(100vh-16rem)] min-h-[500px]">
                    {/* Sidebar Table of Contents */}
                    <nav className="w-full md:w-64 shrink-0 space-y-1 overflow-y-auto overflow-x-hidden max-h-[200px] md:h-full flex flex-col">
                        {[
                            { id: 'holidays', label: 'Holidays' },
                            { id: 'leave-types', label: 'Leave Types' },
                            { id: 'leave-statuses', label: 'Leave Statuses' },
                        ].map((section) => {
                            const active = activeSection === section.id;

                            return (
                                <div key={section.id} className={cn('relative', active && 'z-20')}>
                                    {active && (
                                        <motion.div
                                            layoutId="settings-active-pill"
                                            className="sidebar-active-gradient pointer-events-none absolute inset-0 rounded-xl"
                                            transition={{ duration: 0.2, ease: 'easeOut' }}
                                        />
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => scrollTo(section.id)}
                                        className={cn(
                                            'relative z-10 flex w-full items-center rounded-xl px-2.5 py-2 text-sm transition-none focus-visible:outline-none focus-visible:ring-0',
                                            active
                                                ? 'sidebar-active-text font-bold sidebar-transparent-hover'
                                                : 'text-sidebar-foreground/80 hover:bg-sidebar-accent'
                                        )}
                                    >
                                        <span className="flex w-full items-center px-2">
                                            {section.label}
                                        </span>
                                    </button>
                                </div>
                            );
                        })}
                    </nav>

                    {/* Main Content Areas */}
                    <div
                        ref={scrollContainerRef}
                        className="flex-1 space-y-12 overflow-y-auto pr-4 pb-[50vh] h-full"
                    >
                        {/* Holidays */}
                        <section id="holidays" className="">
                            <div className="matte-card elev-2">
                                <div className="p-6">
                                    <h2 className="t-headline mb-4">
                                        Holidays ({year})
                                    </h2>

                                    <div className="matte-card elev-1 mb-4 rounded-xl border border-border-2 p-4">
                                        <p className="text-sm text-muted-foreground">
                                            <strong className="text-foreground">
                                                Official Reference:
                                            </strong>{' '}
                                            Please verify dates with the
                                            <a
                                                href="https://www.officialgazette.gov.ph/nationwide-holidays/"
                                                target="_blank"
                                                rel="noreferrer"
                                                className="ml-1 text-primary hover:underline"
                                            >
                                                Official List of Regular Holidays and
                                                Special Non-Working Days
                                            </a>
                                            .
                                        </p>
                                    </div>

                                    <div className="mb-6 flex space-x-2">
                                        <Input
                                            type="number"
                                            value={year}
                                            onChange={(e) =>
                                                setYear(Number(e.target.value))
                                            }
                                            className="w-32"
                                        />
                                        <Button
                                            variant="ghost"
                                            className="btn-ghost-specular border-none"
                                            onClick={() =>
                                                router.get(settings().url, { year })
                                            }
                                        >
                                            Filter Year
                                        </Button>
                                    </div>

                                    <form
                                        onSubmit={handleAddHoliday}
                                        className="mb-6 flex items-end space-x-2"
                                    >
                                        <div className="flex-1 space-y-1">
                                            <Label>Date</Label>
                                            <DatePicker
                                                value={holidayDate}
                                                onChange={(val) =>
                                                    setHolidayDate(val || '')
                                                }
                                            />
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <Label>Name</Label>
                                            <Input
                                                type="text"
                                                value={holidayName}
                                                onChange={(e) =>
                                                    setHolidayName(e.target.value)
                                                }
                                                required
                                            />
                                        </div>
                                        <Button
                                            type="submit"
                                            className="btn-specular px-5"
                                            disabled={processing}
                                        >
                                            Add
                                        </Button>
                                    </form>

                                    <div className="space-y-2">
                                        {holidays.map((h: any) => (
                                            <div
                                                key={h.id}
                                                className="matte-card elev-1 flex items-center justify-between p-3"
                                            >
                                                <div>
                                                    <span className="block font-medium">
                                                        {h.name}
                                                    </span>
                                                    <span className="text-sm text-muted-foreground">
                                                        {h.date
                                                            ? format(
                                                                new Date(
                                                                    h.date.includes(
                                                                        'T',
                                                                    )
                                                                        ? h.date
                                                                        : h.date +
                                                                        'T00:00:00',
                                                                ),
                                                                'MMMM d, yyyy',
                                                            )
                                                            : ''}
                                                    </span>
                                                </div>
                                                <Button
                                                    variant="ghost-destructive"
                                                    className="btn-ghost-danger-specular border-none px-4"
                                                    size="sm"
                                                    onClick={() =>
                                                        handleDeleteHoliday(h.id)
                                                    }
                                                    disabled={processing}
                                                >
                                                    Delete
                                                </Button>
                                            </div>
                                        ))}
                                        {holidays.length === 0 && (
                                            <p className="text-sm text-muted-foreground">
                                                No holidays found for this year.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Leave Types */}
                        <section id="leave-types" className="">
                            <div className="matte-card elev-2">
                                <div className="p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="t-headline">Leave Types</h2>
                                    </div>

                                    <div className="space-y-2">
                                        {activeLeaveTypes.map(renderLeaveTypeCard)}

                                        <Button
                                            variant="ghost"
                                            className="w-full btn-ghost-specular border-none py-2 h-auto text-muted-foreground hover:text-foreground"
                                            onClick={() => setAddTypeOpen(true)}
                                        >
                                            <Plus className="h-4 w-4 mr-2" /> Add Leave Type
                                        </Button>
                                    </div>

                                    {disabledLeaveTypes.length > 0 && (
                                        <div className="mt-8">
                                            <h3 className="t-title mb-3 text-muted-foreground">Disabled</h3>
                                            <div className="space-y-2">
                                                {disabledLeaveTypes.map(renderLeaveTypeCard)}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </section>

                        {/* Leave Statuses */}
                        <section id="leave-statuses" className="">
                            <div className="matte-card elev-2">
                                <div className="p-6">
                                    <h2 className="t-headline mb-4">
                                        Leave Statuses
                                    </h2>

                                    <form
                                        onSubmit={handleAddStatus}
                                        className="mb-6 flex items-end space-x-2"
                                    >
                                        <div className="flex-1 space-y-1">
                                            <Label>Status Name</Label>
                                            <Input
                                                value={statusName}
                                                onChange={(e) =>
                                                    setStatusName(e.target.value)
                                                }
                                                placeholder="e.g. Approved"
                                                required
                                            />
                                        </div>
                                        <Button
                                            type="submit"
                                            className="btn-specular px-5"
                                            disabled={processing}
                                        >
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </form>

                                    <div className="space-y-2">
                                        {leaveStatuses.map((s: any) => (
                                            <div
                                                key={s.id}
                                                className={cn(
                                                    'matte-card elev-1 flex items-center justify-between p-3',
                                                    !s.is_active &&
                                                    'bg-muted opacity-50 grayscale',
                                                )}
                                            >
                                                <span className="font-medium">
                                                    {s.name}
                                                </span>
                                                <Button
                                                    variant={s.is_active ? "ghost-destructive" : "ghost"}
                                                    size="sm"
                                                    onClick={() =>
                                                        handleToggleStatus(s)
                                                    }
                                                    className={
                                                        s.is_active
                                                            ? 'btn-ghost-danger-specular border-none'
                                                            : 'btn-ghost-specular border-none'
                                                    }
                                                    disabled={processing}
                                                >
                                                    {s.is_active ? (
                                                        <PowerOff className="h-4 w-4" />
                                                    ) : (
                                                        <Power className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </div>

            <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <DialogContent className="matte-card !fixed max-w-md rounded-2xl border border-border-2 p-6">
                    <DialogHeader>
                        <DialogTitle className="t-headline">
                            {confirmConfig?.title}
                        </DialogTitle>
                        <DialogDescription className="text-sm text-muted-foreground">
                            {confirmConfig?.description}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-4 flex justify-end gap-2">
                        <DialogClose asChild>
                            <Button
                                variant="ghost"
                                className="btn-ghost-specular border-none"
                            >
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button
                            className={cn(
                                'border-none px-5',
                                confirmConfig?.isDestructive
                                    ? 'btn-danger-specular'
                                    : 'btn-specular',
                            )}
                            onClick={() => {
                                confirmConfig?.onConfirm();
                                setConfirmOpen(false);
                            }}
                        >
                            {confirmConfig?.confirmText || 'Confirm'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={editTypeOpen} onOpenChange={setEditTypeOpen}>
                <DialogContent className="matte-card !fixed max-w-md rounded-2xl border border-border-2 p-6">
                    <DialogHeader>
                        <DialogTitle className="t-headline">
                            Edit Leave Type
                        </DialogTitle>
                        <DialogDescription className="text-sm text-muted-foreground">
                            Make changes to this leave type here.
                        </DialogDescription>
                    </DialogHeader>
                    {editingType && (
                        <form id="edit-type-form" onSubmit={handleEditType} className="space-y-4 mt-4">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-1">
                                    <Label>Name</Label>
                                    <Input
                                        value={editingType.name}
                                        onChange={(e) =>
                                            setEditingType({ ...editingType, name: e.target.value })
                                        }
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label>Abbreviation</Label>
                                    <Input
                                        value={editingType.abbreviation || ''}
                                        onChange={(e) =>
                                            setEditingType({ ...editingType, abbreviation: e.target.value })
                                        }
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <Label>Color</Label>
                                    <ColorPicker
                                        value={editingType.color_code || '#000000'}
                                        onChange={(color) => setEditingType({ ...editingType, color_code: color })}
                                    />
                                </div>
                                <div>
                                    <Label>Credit Behavior</Label>
                                    <Select
                                        value={editingType.is_cumulative === true ? 'true' : editingType.is_cumulative === false ? 'false' : 'null'}
                                        onValueChange={(val) =>
                                            setEditingType({
                                                ...editingType,
                                                is_cumulative: val === 'true' ? true : val === 'false' ? false : null
                                            })
                                        }
                                    >
                                        <SelectTrigger className="bg-background">
                                            <SelectValue placeholder="Select behavior" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="true">Cumulative</SelectItem>
                                            <SelectItem value="false">Non-Cumulative</SelectItem>
                                            <SelectItem value="null">N/A</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <Label>Description (Optional)</Label>
                                <Input
                                    value={editingType.description || ''}
                                    onChange={(e) =>
                                        setEditingType({ ...editingType, description: e.target.value })
                                    }
                                />
                            </div>
                        </form>
                    )}
                    <DialogFooter className="mt-4 flex justify-end gap-2">
                        <DialogClose asChild>
                            <Button
                                variant="ghost"
                                className="btn-ghost-specular border-none"
                            >
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button
                            type="submit"
                            form="edit-type-form"
                            className="btn-specular border-none px-5"
                            disabled={processing}
                        >
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <Dialog open={addTypeOpen} onOpenChange={setAddTypeOpen}>
                <DialogContent className="matte-card !fixed max-w-md rounded-2xl border border-border-2 p-6">
                    <DialogHeader>
                        <DialogTitle className="t-headline">
                            Add Leave Type
                        </DialogTitle>
                        <DialogDescription className="text-sm text-muted-foreground">
                            Create a new leave type here.
                        </DialogDescription>
                    </DialogHeader>
                    <form id="add-type-form" onSubmit={handleAddType} className="space-y-4 mt-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-1">
                                <Label>Name</Label>
                                <Input
                                    value={typeName}
                                    onChange={(e) => setTypeName(e.target.value)}
                                    placeholder="e.g. Vacation Leave"
                                    required
                                />
                            </div>
                            <div className="space-y-1">
                                <Label>Abbreviation</Label>
                                <Input
                                    value={typeAbbreviation}
                                    onChange={(e) => setTypeAbbreviation(e.target.value)}
                                    placeholder="e.g. VL"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <Label>Color</Label>
                                <ColorPicker
                                    value={typeColor}
                                    onChange={setTypeColor}
                                />
                            </div>
                            <div>
                                <Label htmlFor="cumulative">Credit Behavior</Label>
                                <Select
                                    value={typeIsCumulative}
                                    onValueChange={setTypeIsCumulative}
                                >
                                    <SelectTrigger id="cumulative" className="bg-background">
                                        <SelectValue placeholder="Select behavior" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="true">Cumulative</SelectItem>
                                        <SelectItem value="false">Non-Cumulative</SelectItem>
                                        <SelectItem value="null">N/A</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <Label>Description (Optional)</Label>
                            <Input
                                value={typeDescription}
                                onChange={(e) => setTypeDescription(e.target.value)}
                                placeholder="Short description..."
                            />
                        </div>
                    </form>
                    <DialogFooter className="mt-4 flex justify-end gap-2">
                        <DialogClose asChild>
                            <Button variant="ghost" className="btn-ghost-specular border-none">
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button
                            type="submit"
                            form="add-type-form"
                            className="btn-specular border-none px-5"
                            disabled={processing}
                        >
                            Add
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

LeaveSettings.layout = {
    breadcrumbs: [
        { title: 'Leave Tracking', href: leave_index().url },
        { title: 'Settings', href: settings().url },
    ],
};
