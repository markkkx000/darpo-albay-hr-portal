import { format, isValid, parse, addMonths, subMonths } from 'date-fns';
// Premium DatePicker Wrapper
import { Calendar as CalendarIcon } from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface DatePickerProps {
    value?: string | null;
    onChange?: (date: string | null) => void;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
    id?: string;
    'aria-invalid'?: boolean;
}

export function DatePicker({
    value,
    onChange,
    placeholder = 'MM-DD-YYYY',
    className,
    disabled,
    id,
    'aria-invalid': ariaInvalid,
}: DatePickerProps) {
    const parseValueToDate = (
        val: string | null | undefined,
    ): { date?: Date; formattedStr: string } => {
        if (!val) {
            return { date: undefined, formattedStr: '' };
        }

        let dateStr = val;

        if (val.includes('T')) {
            const d = new Date(val);

            if (!isNaN(d.getTime())) {
                dateStr = d.toLocaleDateString('en-CA', {
                    timeZone: 'Asia/Manila',
                });
            }
        }

        const parsedDate = new Date(dateStr + 'T00:00:00');

        if (!isNaN(parsedDate.getTime())) {
            return {
                date: parsedDate,
                formattedStr: format(parsedDate, 'MM-dd-yyyy'),
            };
        }

        return { date: undefined, formattedStr: val };
    };

    const initialParsed = parseValueToDate(value);
    const [date, setDate] = React.useState<Date | undefined>(
        initialParsed.date,
    );
    const [displayMonth, setDisplayMonth] = React.useState<Date>(
        initialParsed.date || new Date(),
    );
    const [inputValue, setInputValue] = React.useState(
        initialParsed.formattedStr,
    );
    const [open, setOpen] = React.useState(false);

    React.useEffect(() => {
        const parsed = parseValueToDate(value);
        setDate(parsed.date);
        setInputValue(parsed.formattedStr);

        if (parsed.date) {
            setDisplayMonth(parsed.date);
        }
    }, [value]);

    React.useEffect(() => {
        if (open) {
            setDisplayMonth(date || new Date());
        }
    }, [open, date]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setInputValue(val);

        if (onChange) {
            if (val === '') {
                onChange(null);
            } else if (val.length === 10) {
                let parsed = parse(val, 'MM-dd-yyyy', new Date());

                if (!isValid(parsed)) {
                    parsed = parse(val, 'MM/dd/yyyy', new Date());
                }

                if (isValid(parsed)) {
                    onChange(format(parsed, 'yyyy-MM-dd'));
                } else {
                    onChange(val);
                }
            } else {
                onChange(val);
            }
        }
    };

    const handleSelect = (selectedDate: Date | undefined) => {
        setDate(selectedDate);

        if (onChange) {
            if (selectedDate) {
                const formatted = format(selectedDate, 'yyyy-MM-dd');
                onChange(formatted);
                setInputValue(format(selectedDate, 'MM-dd-yyyy'));
            } else {
                onChange(null);
                setInputValue('');
            }
        }

        setOpen(false);
    };

    const scrollAccumulator = React.useRef(0);
    const [calendarContainer, setCalendarContainer] =
        React.useState<HTMLDivElement | null>(null);

    React.useEffect(() => {
        if (!calendarContainer) {
            return;
        }

        const handleNativeWheel = (e: WheelEvent) => {
            e.preventDefault();
            e.stopPropagation();

            scrollAccumulator.current += e.deltaY;

            if (Math.abs(scrollAccumulator.current) >= 50) {
                const isUp = scrollAccumulator.current < 0;
                setDisplayMonth((prev) =>
                    isUp ? subMonths(prev, 1) : addMonths(prev, 1),
                );
                scrollAccumulator.current = 0;
            }
        };

        calendarContainer.addEventListener('wheel', handleNativeWheel, {
            passive: false,
        });

        return () => {
            calendarContainer.removeEventListener('wheel', handleNativeWheel);
        };
    }, [calendarContainer]);

    return (
        <div className={cn('relative w-full', className)}>
            <Input
                id={id}
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                disabled={disabled}
                placeholder={placeholder}
                aria-invalid={ariaInvalid}
                className={cn(
                    'h-10 w-full px-4 pr-10',
                    ariaInvalid &&
                        'border-destructive focus-visible:ring-destructive',
                )}
            />
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <button
                        type="button"
                        disabled={disabled}
                        className="absolute top-1/2 right-1 -translate-y-1/2 rounded-full p-2 text-muted-foreground outline-none hover:bg-muted/50 hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary/50 disabled:pointer-events-none disabled:opacity-50"
                    >
                        <CalendarIcon className="h-4 w-4 opacity-70 transition-opacity hover:opacity-100" />
                    </button>
                </PopoverTrigger>
                <PopoverContent
                    className="matte-card elev-3 w-auto overflow-hidden rounded-2xl border-border/20 p-0 shadow-xl"
                    align="end"
                >
                    <div
                        className="relative flex flex-col overflow-hidden"
                        ref={setCalendarContainer}
                    >
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={handleSelect}
                            month={displayMonth}
                            onMonthChange={setDisplayMonth}
                            initialFocus
                        />
                        <div className="border-t border-border bg-muted/30 p-4">
                            <Button
                                variant="default"
                                size="default"
                                className="h-12 w-full rounded-2xl border-none font-bold shadow-lg"
                                onClick={() => handleSelect(undefined)}
                            >
                                Clear
                            </Button>
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    );
}
