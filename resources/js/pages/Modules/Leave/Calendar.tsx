import { Combobox, ComboboxInput, ComboboxOption, ComboboxOptions, ComboboxButton, Transition } from '@headlessui/react';
import { Head, router } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, Check, ChevronsUpDown } from 'lucide-react';
import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

import { calendar } from '@/routes/leave/index';
import LeaveNavigation from './Components/LeaveNavigation';


export default function LeaveCalendar({ leaves, leaveTypes, users, currentYear, currentMonth, currentUserId }: any) {
    const year = parseInt(currentYear, 10);
    const month = parseInt(currentMonth, 10);
    const userId = currentUserId;

    const [query, setQuery] = useState('');

    // Normalize dates to Manila time once to avoid loop overhead and timezone bugs
    const getManilaDateStr = (isoString: string) => {
        if (!isoString) {
return '';
}

        const date = new Date(isoString);

        return date.toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' });
    };

    const formattedLeaves = useMemo(() => leaves.map((l: any) => ({
        ...l,
        manila_start_date: getManilaDateStr(l.start_date),
        manila_end_date: getManilaDateStr(l.end_date),
        manila_specific_dates: l.specific_dates ? l.specific_dates.map(getManilaDateStr) : []
    })), [leaves]);

    const filteredUsers = useMemo(() => {
        return query === ''
            ? users
            : users.filter((u: any) => {
                  const fullName = `${u.first_name} ${u.last_name}`.toLowerCase();

                  return fullName.includes(query.toLowerCase());
              });
    }, [query, users]);

    const changeMonth = (delta: number) => {
        let newMonth = month + delta;
        let newYear = year;
        
        if (newMonth > 12) {
            newMonth = 1;
            newYear++;
        } else if (newMonth < 1) {
            newMonth = 12;
            newYear--;
        }
        
        router.get(calendar().url, { year: newYear, month: newMonth, user_id: userId }, { preserveState: true, preserveScroll: true, replace: true });
    };

    const changeDirect = (newMonth: number, newYear: number) => {
        router.get(calendar().url, { year: newYear, month: newMonth, user_id: userId }, { preserveState: true, preserveScroll: true, replace: true });
    };

    const changeUser = (newUserId: string) => {
        router.get(calendar().url, { year, month, user_id: newUserId === 'all' ? null : newUserId }, { preserveState: true, preserveScroll: true, replace: true });
    };

    const getDaysInMonth = (y: number, m: number) => new Date(y, m, 0).getDate();
    const getFirstDayOfMonth = (y: number, m: number) => new Date(y, m - 1, 1).getDay();

    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const blanks = Array.from({ length: firstDay }, (_, i) => i);

    return (
        <>
            <Head title="Leave Calendar" />
            <div className="container mx-auto py-6 max-w-7xl">
                <div className="mb-6">
                    <h1 className="t-title">Leave Calendar</h1>
                    <p className="text-muted-foreground">Visual overview of employee leaves.</p>
                </div>

                <LeaveNavigation />

                <div className="matte-card elev-2 p-6">
                    
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-center mb-6">
                        {/* 25% - Navigation */}
                        <div className="col-span-1 flex items-center justify-start space-x-2">
                            <Button variant="outline" size="icon" onClick={() => changeMonth(-1)}>
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            
                            <div className="flex items-center justify-center space-x-1">
                                <Select value={month.toString()} onValueChange={(val) => changeDirect(parseInt(val), year)}>
                                    <SelectTrigger className="w-[80px] font-semibold text-xl border-none shadow-none focus:ring-0 px-1 justify-center">
                                        <span>{new Date(2000, month - 1).toLocaleString('default', { month: 'short' })}</span>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                                            <SelectItem key={m} value={m.toString()}>
                                                {new Date(2000, m - 1).toLocaleString('default', { month: 'long' })}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select value={year.toString()} onValueChange={(val) => changeDirect(month, parseInt(val))}>
                                    <SelectTrigger className="w-[100px] font-semibold text-xl border-none shadow-none focus:ring-0">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Array.from({ length: 11 }, (_, i) => year - 5 + i).map(y => (
                                            <SelectItem key={y} value={y.toString()}>
                                                {y}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <Button variant="outline" size="icon" onClick={() => changeMonth(1)}>
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                        
                        {/* 25% - Employee Selector */}
                        <div className="col-span-1 flex items-center justify-center lg:justify-start">
                            <Combobox 
                                value={userId ? userId.toString() : 'all'} 
                                onChange={changeUser}
                            >
                                <div className="relative w-full z-50">
                                    <div className="relative w-full cursor-default overflow-hidden rounded-xl border border-input bg-background text-left shadow-sm focus-within:ring-1 focus-within:ring-ring">
                                        <ComboboxInput
                                            className="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-foreground bg-transparent focus:ring-0 outline-none"
                                            displayValue={(val: string) => {
                                                if (val === 'all' || !val) {
return 'All Employees';
}

                                                const found = users.find((u: any) => u.id.toString() === val);

                                                return found ? `${found.last_name}, ${found.first_name}` : '';
                                            }}
                                            placeholder="Search employee..."
                                            onChange={(event) => setQuery(event.target.value)}
                                        />
                                        <ComboboxButton className="absolute inset-y-0 right-0 flex items-center pr-2">
                                            <ChevronsUpDown className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                                        </ComboboxButton>
                                    </div>
                                    <Transition
                                        leave="transition ease-in duration-100"
                                        leaveFrom="opacity-100"
                                        leaveTo="opacity-0"
                                        afterLeave={() => setQuery('')}
                                    >
                                        <ComboboxOptions className="absolute mt-1 max-h-60 w-full overflow-auto rounded-xl bg-popover py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm border">
                                            {filteredUsers.length === 0 && query !== '' ? (
                                                <div className="relative cursor-default select-none py-2 px-4 text-muted-foreground">
                                                    Nothing found.
                                                </div>
                                            ) : (
                                                <>
                                                    <ComboboxOption
                                                        className={({ focus }) =>
                                                            cn(
                                                                "relative cursor-default select-none py-2 pl-10 pr-4",
                                                                focus ? "bg-accent text-accent-foreground" : "text-popover-foreground"
                                                            )
                                                        }
                                                        value="all"
                                                    >
                                                        {({ selected, focus }) => (
                                                            <>
                                                                <span className={cn("block truncate", selected ? "font-medium" : "font-normal")}>
                                                                    All Employees
                                                                </span>
                                                                {selected ? (
                                                                    <span className={cn("absolute inset-y-0 left-0 flex items-center pl-3", focus ? "text-accent-foreground" : "text-primary")}>
                                                                        <Check className="h-4 w-4" aria-hidden="true" />
                                                                    </span>
                                                                ) : null}
                                                            </>
                                                        )}
                                                    </ComboboxOption>
                                                    {filteredUsers.map((person: any) => (
                                                        <ComboboxOption
                                                            key={person.id}
                                                            className={({ focus }) =>
                                                                cn(
                                                                    "relative cursor-default select-none py-2 pl-10 pr-4",
                                                                    focus ? "bg-accent text-accent-foreground" : "text-popover-foreground"
                                                                )
                                                            }
                                                            value={person.id.toString()}
                                                        >
                                                            {({ selected, focus }) => (
                                                                <>
                                                                    <span className={cn("block truncate", selected ? "font-medium" : "font-normal")}>
                                                                        {person.last_name}, {person.first_name}
                                                                    </span>
                                                                    {selected ? (
                                                                        <span className={cn("absolute inset-y-0 left-0 flex items-center pl-3", focus ? "text-accent-foreground" : "text-primary")}>
                                                                            <Check className="h-4 w-4" aria-hidden="true" />
                                                                        </span>
                                                                    ) : null}
                                                                </>
                                                            )}
                                                        </ComboboxOption>
                                                    ))}
                                                </>
                                            )}
                                        </ComboboxOptions>
                                    </Transition>
                                </div>
                            </Combobox>
                        </div>

                        {/* 50% - Legends */}
                        <div className="col-span-1 lg:col-span-2 flex items-center justify-center lg:justify-start space-x-4 flex-wrap">
                            {leaveTypes.slice(0, 5).map((t: any) => (
                                <div key={t.id} className="flex items-center space-x-1 text-xs">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: t.color_code }}></div>
                                    <span className="text-muted-foreground">{t.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-7 gap-px bg-muted matte-card elev-1 overflow-hidden border">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <div key={day} className="bg-muted/50 p-2 text-center text-sm font-medium text-muted-foreground">
                                {day}
                            </div>
                        ))}
                        
                        {blanks.map(b => (
                            <div key={`blank-${b}`} className="bg-background min-h-[120px] p-2 opacity-50"></div>
                        ))}
                        
                        {days.map(day => {
                            const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                            
                            // Find leaves for this day
                            const dayLeaves = formattedLeaves.filter((l: any) => {
                                if (l.manila_specific_dates && l.manila_specific_dates.length > 0) {
                                    return l.manila_specific_dates.includes(dateStr);
                                }

                                return dateStr >= l.manila_start_date && dateStr <= l.manila_end_date;
                            });

                            const isOverflow = dayLeaves.length > 4;
                            const visibleLeaves = isOverflow ? dayLeaves.slice(0, 3) : dayLeaves;
                            const hiddenCount = dayLeaves.length - 3;

                            return (
                                <div key={day} className="bg-background min-h-[120px] p-2 border-t">
                                    <span className="text-sm font-medium text-muted-foreground">{day}</span>
                                    <div className="mt-1 space-y-1">
                                        {visibleLeaves.map((leave: any) => {
                                            // Handle half-day visual representation
                                            const isHalfDay = leave.days_requested < 1.0 && leave.start_date === leave.end_date;
                                            
                                            return (
                                                <div 
                                                    key={leave.id} 
                                                    className="text-[10px] leading-tight p-1 rounded-md text-white truncate"
                                                    style={{ 
                                                        backgroundColor: leave.leave_type?.color_code,
                                                        opacity: isHalfDay ? 0.7 : 1,
                                                        borderLeft: isHalfDay ? '4px solid white' : 'none'
                                                    }}
                                                    title={`${leave.user?.first_name} ${leave.user?.last_name} - ${leave.leave_type?.name}`}
                                                >
                                                    {leave.user?.first_name} {leave.user?.last_name[0]}.
                                                    {isHalfDay && ' (0.5)'}
                                                </div>
                                            )
                                        })}

                                        {isOverflow && (
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <button className="w-full text-left text-[10px] leading-tight p-1 rounded bg-muted text-muted-foreground hover:bg-muted/80 transition-colors font-medium">
                                                        +{hiddenCount} more
                                                    </button>
                                                </DialogTrigger>
                                                <DialogContent>
                                                    <DialogHeader>
                                                        <DialogTitle>Leaves on {new Date(2000, month - 1).toLocaleString('default', { month: 'long' })} {day}, {year}</DialogTitle>
                                                    </DialogHeader>
                                                    <div className="space-y-2 mt-4 max-h-[60vh] overflow-y-auto pr-2">
                                                        {dayLeaves.map((leave: any) => (
                                                            <div key={leave.id} className="flex items-center justify-between p-2 border rounded-xl">
                                                                <div className="flex items-center space-x-3">
                                                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: leave.leave_type?.color_code }}></div>
                                                                    <div>
                                                                        <p className="text-sm font-medium">{leave.user?.first_name} {leave.user?.last_name}</p>
                                                                        <p className="text-xs text-muted-foreground">{leave.leave_type?.name} {leave.days_requested < 1.0 && '(Half Day)'}</p>
                                                                    </div>
                                                                </div>
                                                                <span className="text-[10px] px-2 py-0.5 bg-secondary text-secondary-foreground rounded-full">
                                                                    {leave.leave_status?.name}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </DialogContent>
                                            </Dialog>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    
                </div>
            </div>
        </>
    );
}

LeaveCalendar.layout = {
    breadcrumbs: [
        { title: 'Leave Tracking', href: '/leave' },
        { title: 'Calendar', href: '/leave/calendar' },
    ],
};
