import {
    Combobox,
    ComboboxInput,
    ComboboxOption,
    ComboboxOptions,
    ComboboxButton,
    Transition,
} from '@headlessui/react';
import { Head, router } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, Check, ChevronsUpDown } from 'lucide-react';
import { useState, useMemo } from 'react';
import PageHeader from '@/components/page-header';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

import { index, calendar } from '@/routes/leave/index';
import LeaveNavigation from './Components/LeaveNavigation';

interface User {
    id: number;
    first_name: string;
    last_name: string;
    employee_number: string | null;
    [key: string]: any;
}

interface LeaveType {
    id: number;
    name: string;
    color_code?: string;
}

interface LeaveRequest {
    id: number;
    user?: User;
    leave_type?: LeaveType;
    specific_dates?: string[];
    start_date: string;
    end_date: string;
    days_requested: number;
    leave_status?: {
        id: number;
        name: string;
    };
    [key: string]: any;
}

interface Holiday {
    date: string;
    name: string;
    [key: string]: any;
}

interface Props {
    leaves: LeaveRequest[];
    leaveTypes: LeaveType[];
    users: User[];
    currentYear: string;
    currentMonth: string;
    currentUserId?: string | null;
    holidays?: Holiday[];
}

export default function LeaveCalendar({
    leaves,
    leaveTypes,
    users,
    currentYear,
    currentMonth,
    currentUserId,
    holidays = [],
}: Props) {
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

    const formattedLeaves = useMemo(
        () =>
            leaves.map((l: any) => ({
                ...l,
                manila_start_date: getManilaDateStr(l.start_date),
                manila_end_date: getManilaDateStr(l.end_date),
                manila_specific_dates: l.specific_dates
                    ? l.specific_dates.map(getManilaDateStr)
                    : [],
            })),
        [leaves],
    );

    const filteredUsers = useMemo(() => {
        const usersArray = Array.isArray(users) ? users : [];

        // Identify selected user name to prevent dropdown truncation when clicking
        let selectedName = '';

        if (userId) {
            const found = usersArray.find(
                (u: any) => u.id.toString() === userId.toString(),
            );

            if (found) {
                selectedName = `${found.last_name}, ${found.first_name}`;
            }
        }

        // If query is empty or matches the selected display name exactly, show all employees
        if (
            query === '' ||
            query.toLowerCase() === selectedName.toLowerCase()
        ) {
            return usersArray;
        }

        return usersArray.filter((u: any) => {
            const fullName = `${u.first_name} ${u.last_name}`.toLowerCase();
            const lastNameFirst =
                `${u.last_name}, ${u.first_name}`.toLowerCase();
            const employeeNum = (u.employee_number || '').toLowerCase();
            const search = query.toLowerCase();

            return (
                fullName.includes(search) ||
                lastNameFirst.includes(search) ||
                employeeNum.includes(search)
            );
        });
    }, [query, users, userId]);

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

        router.get(
            calendar().url,
            { year: newYear, month: newMonth, user_id: userId },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const changeDirect = (newMonth: number, newYear: number) => {
        router.get(
            calendar().url,
            { year: newYear, month: newMonth, user_id: userId },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const changeUser = (newUserId: string | null) => {
        router.get(
            calendar().url,
            {
                year,
                month,
                user_id: !newUserId || newUserId === 'all' ? null : newUserId,
            },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const getDaysInMonth = (y: number, m: number) =>
        new Date(y, m, 0).getDate();
    const getFirstDayOfMonth = (y: number, m: number) =>
        new Date(y, m - 1, 1).getDay();

    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);

    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const blanks = Array.from({ length: firstDay }, (_, i) => i);

    return (
        <>
            <Head title="Leave Calendar" />
            <div className="w-full p-4 md:p-6">
                <PageHeader
                    title="Leave Calendar"
                    description="Visual overview of employee leaves."
                />

                <LeaveNavigation />

                <div className="matte-card elev-2 p-6">
                    <div className="mb-6 grid grid-cols-1 items-center gap-4 lg:grid-cols-4">
                        {/* 25% - Navigation */}
                        <div className="col-span-1 flex items-center justify-start space-x-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="btn-ghost-specular h-12 w-12 rounded-full border-none"
                                onClick={() => changeMonth(-1)}
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </Button>

                            <div className="flex items-center justify-center space-x-1">
                                <Select
                                    value={month.toString()}
                                    onValueChange={(val) =>
                                        changeDirect(parseInt(val), year)
                                    }
                                >
                                    <SelectTrigger className="w-[80px] justify-center border-none px-1 text-xl font-semibold shadow-none focus:ring-0">
                                        <span>
                                            {new Date(
                                                2000,
                                                month - 1,
                                            ).toLocaleString('default', {
                                                month: 'short',
                                            })}
                                        </span>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Array.from(
                                            { length: 12 },
                                            (_, i) => i + 1,
                                        ).map((m) => (
                                            <SelectItem
                                                key={m}
                                                value={m.toString()}
                                            >
                                                {new Date(
                                                    2000,
                                                    m - 1,
                                                ).toLocaleString('default', {
                                                    month: 'long',
                                                })}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select
                                    value={year.toString()}
                                    onValueChange={(val) =>
                                        changeDirect(month, parseInt(val))
                                    }
                                >
                                    <SelectTrigger className="w-[100px] border-none text-xl font-semibold shadow-none focus:ring-0">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Array.from(
                                            { length: 11 },
                                            (_, i) => year - 5 + i,
                                        ).map((y) => (
                                            <SelectItem
                                                key={y}
                                                value={y.toString()}
                                            >
                                                {y}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <Button
                                variant="ghost"
                                size="icon"
                                className="btn-ghost-specular h-12 w-12 rounded-full border-none"
                                onClick={() => changeMonth(1)}
                            >
                                <ChevronRight className="h-5 w-5" />
                            </Button>
                        </div>

                        {/* 25% - Employee Selector */}
                        <div className="col-span-1 flex items-center justify-center lg:justify-start">
                            <Combobox
                                value={userId ? userId.toString() : 'all'}
                                onChange={changeUser}
                            >
                                <div className="relative z-50 w-full">
                                    <div className="relative w-full cursor-default overflow-hidden rounded-xl border border-input bg-background text-left shadow-sm focus-within:ring-1 focus-within:ring-ring">
                                        <ComboboxInput
                                            className="w-full border-none bg-transparent py-2 pr-10 pl-3 text-sm leading-5 text-foreground outline-none focus:ring-0"
                                            displayValue={(val: string) => {
                                                if (val === 'all' || !val) {
                                                    return 'All Employees';
                                                }

                                                const found = users.find(
                                                    (u: any) =>
                                                        u.id.toString() === val,
                                                );

                                                return found
                                                    ? `${found.last_name}, ${found.first_name}`
                                                    : '';
                                            }}
                                            placeholder="Search employee..."
                                            onChange={(event) =>
                                                setQuery(event.target.value)
                                            }
                                        />
                                        <ComboboxButton className="absolute inset-y-0 right-0 flex items-center pr-2">
                                            <ChevronsUpDown
                                                className="h-4 w-4 text-muted-foreground"
                                                aria-hidden="true"
                                            />
                                        </ComboboxButton>
                                    </div>
                                    <Transition
                                        leave="transition ease-in duration-100"
                                        leaveFrom="opacity-100"
                                        leaveTo="opacity-0"
                                        afterLeave={() => setQuery('')}
                                    >
                                        <ComboboxOptions className="ring-opacity-5 absolute mt-1 max-h-60 w-full overflow-auto rounded-xl border bg-popover px-1.5 py-1 text-base shadow-lg ring-1 ring-black focus:outline-none sm:text-sm">
                                            {filteredUsers.length === 0 &&
                                            query !== '' ? (
                                                <div className="relative cursor-default px-4 py-2 text-muted-foreground select-none">
                                                    Nothing found.
                                                </div>
                                            ) : (
                                                <>
                                                    <ComboboxOption
                                                        className={({
                                                            focus,
                                                        }) =>
                                                            cn(
                                                                'relative cursor-default py-2 pr-4 pl-10 select-none',
                                                                focus
                                                                    ? 'mx-1.5 my-0.5 rounded-[16px] item-hover-gradient'
                                                                    : 'mx-1.5 my-0.5 text-popover-foreground',
                                                            )
                                                        }
                                                        value="all"
                                                    >
                                                        {({
                                                            selected,
                                                            focus,
                                                        }) => (
                                                            <>
                                                                <span
                                                                    className={cn(
                                                                        'block truncate',
                                                                        selected
                                                                            ? 'font-medium'
                                                                            : 'font-normal',
                                                                    )}
                                                                >
                                                                    All
                                                                    Employees
                                                                </span>
                                                                {selected ? (
                                                                    <span
                                                                        className={cn(
                                                                            'absolute inset-y-0 left-0 flex items-center pl-3',
                                                                            focus
                                                                                ? 'font-extrabold text-black'
                                                                                : 'text-primary',
                                                                        )}
                                                                    >
                                                                        <Check
                                                                            className="h-4 w-4"
                                                                            aria-hidden="true"
                                                                        />
                                                                    </span>
                                                                ) : null}
                                                            </>
                                                        )}
                                                    </ComboboxOption>
                                                    {filteredUsers.map(
                                                        (person: any) => (
                                                            <ComboboxOption
                                                                key={person.id}
                                                                className={({
                                                                    focus,
                                                                }) =>
                                                                    cn(
                                                                        'relative cursor-default py-2 pr-4 pl-10 select-none',
                                                                        focus
                                                                            ? 'mx-1.5 my-0.5 rounded-[16px] item-hover-gradient'
                                                                            : 'mx-1.5 my-0.5 text-popover-foreground',
                                                                    )
                                                                }
                                                                value={person.id.toString()}
                                                            >
                                                                {({
                                                                    selected,
                                                                    focus,
                                                                }) => (
                                                                    <>
                                                                        <span
                                                                            className={cn(
                                                                                'block truncate',
                                                                                selected
                                                                                    ? 'font-medium'
                                                                                    : 'font-normal',
                                                                            )}
                                                                        >
                                                                            {
                                                                                person.last_name
                                                                            }
                                                                            ,{' '}
                                                                            {
                                                                                person.first_name
                                                                            }
                                                                        </span>
                                                                        {selected ? (
                                                                            <span
                                                                                className={cn(
                                                                                    'absolute inset-y-0 left-0 flex items-center pl-3',
                                                                                    focus
                                                                                        ? 'font-extrabold text-black'
                                                                                        : 'text-primary',
                                                                                )}
                                                                            >
                                                                                <Check
                                                                                    className="h-4 w-4"
                                                                                    aria-hidden="true"
                                                                                />
                                                                            </span>
                                                                        ) : null}
                                                                    </>
                                                                )}
                                                            </ComboboxOption>
                                                        ),
                                                    )}
                                                </>
                                            )}
                                        </ComboboxOptions>
                                    </Transition>
                                </div>
                            </Combobox>
                        </div>

                        {/* 50% - Legends */}
                        <div className="col-span-1 flex flex-wrap items-center justify-center gap-2 lg:col-span-2 lg:justify-start">
                            {leaveTypes.map((t: any) => (
                                <div
                                    key={t.id}
                                    className="flex shrink-0 cursor-default items-center space-x-1.5 rounded-full border border-border bg-secondary px-3 py-1 text-[11px] font-medium text-secondary-foreground shadow-sm sm:text-xs"
                                >
                                    <div
                                        className="h-2.5 w-2.5 shrink-0 rounded-full shadow-sm"
                                        style={{
                                            backgroundColor: t.color_code,
                                        }}
                                    ></div>
                                    <span className="whitespace-nowrap">
                                        {t.name}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="matte-card elev-1 grid grid-cols-7 gap-px overflow-hidden border bg-muted">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(
                            (day) => (
                                <div
                                    key={day}
                                    className="bg-muted/50 p-2 text-center text-sm font-medium text-muted-foreground"
                                >
                                    {day}
                                </div>
                            ),
                        )}

                        {blanks.map((b) => (
                            <div
                                key={`blank-${b}`}
                                className="min-h-[120px] bg-background p-2 opacity-50"
                            ></div>
                        ))}

                        {days.map((day) => {
                            const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

                            // Find holiday for this day
                            const holiday = holidays.find(
                                (h: any) =>
                                    h.date && h.date.startsWith(dateStr),
                            );

                            // Find leaves for this day
                            const dayLeaves = formattedLeaves.filter(
                                (l: any) => {
                                    if (
                                        l.manila_specific_dates &&
                                        l.manila_specific_dates.length > 0
                                    ) {
                                        return l.manila_specific_dates.includes(
                                            dateStr,
                                        );
                                    }

                                    return (
                                        dateStr >= l.manila_start_date &&
                                        dateStr <= l.manila_end_date
                                    );
                                },
                            );

                            const isOverflow = dayLeaves.length > 4;
                            const visibleLeaves = isOverflow
                                ? dayLeaves.slice(0, 3)
                                : dayLeaves;
                            const hiddenCount = dayLeaves.length - 3;

                            return (
                                <div
                                    key={day}
                                    className={cn(
                                        'min-h-[120px] border-t bg-background p-2',
                                        holiday &&
                                            'bg-yellow-500/10 dark:bg-yellow-500/5',
                                    )}
                                >
                                    <div className="mb-1 flex items-start justify-between">
                                        <span
                                            className={cn(
                                                'text-sm font-medium',
                                                holiday
                                                    ? 'font-bold text-yellow-600 dark:text-yellow-400'
                                                    : 'text-muted-foreground',
                                            )}
                                        >
                                            {day}
                                        </span>
                                        {holiday && (
                                            <span
                                                className="max-w-[70%] text-right text-[9px] leading-tight font-bold tracking-tighter text-yellow-600 uppercase dark:text-yellow-400"
                                                title={holiday.name}
                                            >
                                                {holiday.name}
                                            </span>
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        {visibleLeaves.map((leave: any) => {
                                            // Handle half-day visual representation
                                            const isHalfDay =
                                                leave.days_requested < 1.0 &&
                                                leave.start_date ===
                                                    leave.end_date;

                                            return (
                                                <div
                                                    key={leave.id}
                                                    className="truncate rounded-full px-2 py-0.5 text-[10px] leading-tight font-medium text-white shadow-sm"
                                                    style={{
                                                        backgroundColor:
                                                            leave.leave_type
                                                                ?.color_code,
                                                        opacity: isHalfDay
                                                            ? 0.7
                                                            : 1,
                                                        borderLeft: isHalfDay
                                                            ? '4px solid white'
                                                            : 'none',
                                                    }}
                                                    title={`${leave.user?.first_name} ${leave.user?.last_name} - ${leave.leave_type?.name}`}
                                                >
                                                    {leave.user?.first_name}{' '}
                                                    {leave.user?.last_name[0]}.
                                                    {isHalfDay && ' (0.5)'}
                                                </div>
                                            );
                                        })}

                                        {isOverflow && (
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <button className="w-full rounded-full bg-muted px-2 py-1 text-left text-[10px] leading-tight font-medium text-muted-foreground transition-colors hover:bg-muted/80">
                                                        +{hiddenCount} more
                                                    </button>
                                                </DialogTrigger>
                                                <DialogContent>
                                                    <DialogHeader>
                                                        <DialogTitle>
                                                            Leaves on{' '}
                                                            {new Date(
                                                                2000,
                                                                month - 1,
                                                            ).toLocaleString(
                                                                'default',
                                                                {
                                                                    month: 'long',
                                                                },
                                                            )}{' '}
                                                            {day}, {year}
                                                        </DialogTitle>
                                                    </DialogHeader>
                                                    <div className="mt-4 max-h-[60vh] space-y-2 overflow-y-auto pr-2">
                                                        {dayLeaves.map(
                                                            (leave: any) => (
                                                                <div
                                                                    key={
                                                                        leave.id
                                                                    }
                                                                    className="flex items-center justify-between rounded-xl border p-2"
                                                                >
                                                                    <div className="flex items-center space-x-3">
                                                                        <div
                                                                            className="h-3 w-3 rounded-full"
                                                                            style={{
                                                                                backgroundColor:
                                                                                    leave
                                                                                        .leave_type
                                                                                        ?.color_code,
                                                                            }}
                                                                        ></div>
                                                                        <div>
                                                                            <p className="text-sm font-medium">
                                                                                {
                                                                                    leave
                                                                                        .user
                                                                                        ?.first_name
                                                                                }{' '}
                                                                                {
                                                                                    leave
                                                                                        .user
                                                                                        ?.last_name
                                                                                }
                                                                            </p>
                                                                            <p className="text-xs text-muted-foreground">
                                                                                {
                                                                                    leave
                                                                                        .leave_type
                                                                                        ?.name
                                                                                }{' '}
                                                                                {leave.days_requested <
                                                                                    1.0 &&
                                                                                    '(Half Day)'}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                    <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] text-secondary-foreground">
                                                                        {
                                                                            leave
                                                                                .leave_status
                                                                                ?.name
                                                                        }
                                                                    </span>
                                                                </div>
                                                            ),
                                                        )}
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
        { title: 'Leave Tracking', href: index().url },
        { title: 'Calendar', href: calendar().url },
    ],
};
