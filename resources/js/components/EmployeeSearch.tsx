import {
    Combobox,
    ComboboxInput,
    ComboboxOption,
    ComboboxOptions,
    ComboboxButton,
} from '@headlessui/react';
import { router } from '@inertiajs/react';
import { Check, ChevronsUpDown, Search, X } from 'lucide-react';
import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';

interface User {
    id: number;
    first_name: string;
    last_name: string;
    employee_number: string | null;
}

interface EmployeeSearchProps {
    users: User[];
    selectedId?: string | number | null;
    placeholder?: string;
    onSelect?: (userId: string | 'all') => void;
    route?: string;
    params?: Record<string, any>;
    returnValue?: 'id' | 'name';
    withAllEmployees?: boolean;
    error?: boolean;
    disabled?: boolean;
}

export function EmployeeSearch({
    users,
    selectedId,
    placeholder = 'Search employee...',
    onSelect,
    route,
    params = {},
    returnValue = 'name',
    withAllEmployees = false,
    error = false,
    disabled = false,
}: EmployeeSearchProps) {
    const [query, setQuery] = useState('');

    const filteredUsers = useMemo(() => {
        const usersArray = Array.isArray(users) ? users : [];

        // Identify the display name of the selected employee to prevent dropdown truncation when clicking
        let selectedName = '';

        if (selectedId) {
            if (returnValue === 'id' || !isNaN(Number(selectedId))) {
                const found = usersArray.find(
                    (u) => u.id.toString() === selectedId.toString(),
                );

                if (found) {
                    selectedName = `${found.first_name} ${found.last_name}`;
                }
            } else {
                selectedName = selectedId.toString();
            }
        }

        // If the query is empty or matches the selected name exactly, show all employees so the list is not cut
        if (
            query === '' ||
            query.toLowerCase() === selectedName.toLowerCase()
        ) {
            return usersArray;
        }

        const keywords = query
            .toLowerCase()
            .split(/[\s,]+/)
            .filter(Boolean);

        return usersArray.filter((user) => {
            const searchable =
                `${user.first_name} ${user.last_name} ${user.employee_number ?? ''}`.toLowerCase();

            return keywords.every((keyword) => searchable.includes(keyword));
        });
    }, [query, users, selectedId, returnValue]);

    const handleChange = (val: string | null) => {
        if (onSelect) {
            onSelect(val === 'all' || !val ? 'all' : val);
        } else if (route) {
            router.get(
                route,
                {
                    ...params,
                    search: val === 'all' || !val ? undefined : val,
                },
                {
                    preserveState: true,
                    replace: true,
                },
            );
        }
    };

    const handleClear = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setQuery('');
        handleChange(null);
    };

    return (
        <div className="w-full max-w-sm">
            <Combobox
                value={selectedId ? selectedId.toString() : null}
                onChange={handleChange}
                onClose={() => setQuery('')}
                nullable
                disabled={disabled}
            >
                <div className="relative z-10 w-full">
                    <div
                        className={cn(
                            'relative w-full cursor-default overflow-hidden rounded-2xl border border-input bg-background text-left shadow-sm focus-within:ring-1 focus-within:ring-ring',
                            error &&
                                'border-destructive ring-destructive focus-within:ring-destructive',
                            disabled &&
                                'cursor-not-allowed bg-muted opacity-50',
                        )}
                    >
                        <div className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center">
                            <Search className="h-4 w-4 text-muted-foreground/60" />
                        </div>
                        <ComboboxInput
                            className="w-full border-none bg-transparent py-2.5 pr-10 pl-11 text-sm leading-5 text-foreground outline-none focus:ring-0 disabled:cursor-not-allowed"
                            displayValue={(val: string) => {
                                if (val === 'all' || !val) {
                                    return '';
                                }

                                if (
                                    returnValue === 'id' ||
                                    !isNaN(Number(val))
                                ) {
                                    const found = users.find(
                                        (u) => u.id.toString() === val,
                                    );

                                    return found
                                        ? `${found.first_name} ${found.last_name}`
                                        : val;
                                }

                                return val;
                            }}
                            placeholder={placeholder}
                            onChange={(event) => setQuery(event.target.value)}
                            autoComplete="off"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center space-x-0.5 pr-2">
                            {selectedId && (
                                <button
                                    type="button"
                                    onClick={handleClear}
                                    className="rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            )}
                            <ComboboxButton className="p-1">
                                <ChevronsUpDown
                                    className="h-4 w-4 text-muted-foreground"
                                    aria-hidden="true"
                                />
                            </ComboboxButton>
                        </div>
                    </div>
                    <ComboboxOptions
                        transition
                        className="absolute z-[100] mt-1 max-h-60 w-full overflow-auto rounded-xl border bg-popover px-1.5 py-1 text-base shadow-lg ring-1 ring-black/5 transition duration-100 ease-in focus:outline-none data-[leave]:opacity-0 sm:text-sm"
                    >
                        {filteredUsers.length === 0 && query !== '' ? (
                            <div className="relative cursor-default px-4 py-2 text-muted-foreground select-none">
                                Nothing found.
                            </div>
                        ) : (
                            <div className="contents">
                                {withAllEmployees && (
                                    <ComboboxOption
                                        className={({ focus }) =>
                                            cn(
                                                'relative cursor-default py-2 pr-4 pl-10 select-none',
                                                focus
                                                    ? 'mx-1.5 my-0.5 rounded-[16px] item-hover-gradient'
                                                    : 'mx-1.5 my-0.5 text-popover-foreground',
                                            )
                                        }
                                        value="all"
                                    >
                                        {({ selected, focus }) => (
                                            <div className="contents">
                                                <span
                                                    className={cn(
                                                        'block truncate',
                                                        selected
                                                            ? 'font-medium'
                                                            : 'font-normal',
                                                    )}
                                                >
                                                    All Employees
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
                                            </div>
                                        )}
                                    </ComboboxOption>
                                )}
                                {filteredUsers.map((person) => (
                                    <ComboboxOption
                                        key={person.id}
                                        className={({ focus }) =>
                                            cn(
                                                'relative cursor-default py-2 pr-4 pl-10 select-none',
                                                focus
                                                    ? 'mx-1.5 my-0.5 rounded-[16px] item-hover-gradient'
                                                    : 'mx-1.5 my-0.5 text-popover-foreground',
                                            )
                                        }
                                        value={
                                            returnValue === 'id'
                                                ? person.id.toString()
                                                : `${person.first_name} ${person.last_name}`
                                        }
                                    >
                                        {({ selected, focus }) => (
                                            <div className="contents">
                                                <span
                                                    className={cn(
                                                        'block truncate',
                                                        selected
                                                            ? 'font-medium'
                                                            : 'font-normal',
                                                    )}
                                                >
                                                    {person.first_name}{' '}
                                                    {person.last_name}
                                                    {person.employee_number && (
                                                        <span
                                                            className={cn(
                                                                'ml-2 text-xs',
                                                                focus
                                                                    ? 'font-semibold text-black/65'
                                                                    : 'text-muted-foreground',
                                                            )}
                                                        >
                                                            (
                                                            {
                                                                person.employee_number
                                                            }
                                                            )
                                                        </span>
                                                    )}
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
                                            </div>
                                        )}
                                    </ComboboxOption>
                                ))}
                            </div>
                        )}
                    </ComboboxOptions>
                </div>
            </Combobox>
        </div>
    );
}
