import { Combobox, ComboboxInput, ComboboxOption, ComboboxOptions, ComboboxButton } from '@headlessui/react';
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
}

export function EmployeeSearch({ 
    users, 
    selectedId, 
    placeholder = "Search employee...", 
    onSelect,
    route,
    params = {},
    returnValue = 'name',
    withAllEmployees = false,
    error = false,
}: EmployeeSearchProps) {
    const [query, setQuery] = useState('');

    const filteredUsers = useMemo(() => {
        const usersArray = Array.isArray(users) ? users : [];

        // Identify the display name of the selected employee to prevent dropdown truncation when clicking
        let selectedName = '';

        if (selectedId) {
            if (returnValue === 'id' || !isNaN(Number(selectedId))) {
                const found = usersArray.find((u) => u.id.toString() === selectedId.toString());

                if (found) {
                    selectedName = `${found.first_name} ${found.last_name}`;
                }
            } else {
                selectedName = selectedId.toString();
            }
        }

        // If the query is empty or matches the selected name exactly, show all employees so the list is not cut
        if (query === '' || query.toLowerCase() === selectedName.toLowerCase()) {
            return usersArray;
        }

        const keywords = query.toLowerCase().split(/[\s,]+/).filter(Boolean);

        return usersArray.filter((user) => {
            const searchable = `${user.first_name} ${user.last_name} ${user.employee_number ?? ''}`.toLowerCase();

            return keywords.every((keyword) => searchable.includes(keyword));
        });
    }, [query, users, selectedId, returnValue]);

    const handleChange = (val: string | null) => {
        if (onSelect) {
            onSelect(val === 'all' || !val ? 'all' : val);
        } else if (route) {
            router.get(route, {
                ...params,
                search: val === 'all' || !val ? undefined : val,
            }, {
                preserveState: true,
                replace: true,
            });
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
                immediate
            >
                <div className="relative w-full z-10">
                    <div className={cn(
                        "relative w-full cursor-default overflow-hidden rounded-2xl border border-input bg-background text-left shadow-sm focus-within:ring-1 focus-within:ring-ring",
                        error && "border-destructive focus-within:ring-destructive ring-destructive"
                    )}>
                        <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-muted-foreground/60" />
                        </div>
                        <ComboboxInput
                            className="w-full border-none py-2.5 pl-11 pr-10 text-sm leading-5 text-foreground bg-transparent focus:ring-0 outline-none"
                            displayValue={(val: string) => {
                                if (val === 'all' || !val) {
                                    return '';
                                }

                                if (returnValue === 'id' || !isNaN(Number(val))) {
                                    const found = users.find((u) => u.id.toString() === val);

                                    return found ? `${found.first_name} ${found.last_name}` : val;
                                }

                                return val;
                            }}
                            placeholder={placeholder}
                            onChange={(event) => setQuery(event.target.value)}
                            autoComplete="off"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-2 space-x-0.5">
                            {selectedId && (
                                <button
                                    type="button"
                                    onClick={handleClear}
                                    className="p-1 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            )}
                            <ComboboxButton className="p-1">
                                <ChevronsUpDown className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                            </ComboboxButton>
                        </div>
                    </div>
                    <ComboboxOptions 
                        transition
                        className="absolute mt-1 max-h-60 w-full overflow-auto rounded-xl bg-popover py-1 px-1.5 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm border z-50 transition duration-100 ease-in data-[leave]:opacity-0"
                    >
                            {filteredUsers.length === 0 && query !== '' ? (
                                <div className="relative cursor-default select-none py-2 px-4 text-muted-foreground">
                                    Nothing found.
                                </div>
                            ) : (
                                <div className="contents">
                                    {withAllEmployees && (
                                        <ComboboxOption
                                            className={({ focus }) =>
                                                cn(
                                                    "relative cursor-default select-none py-2 pl-10 pr-4",
                                                    focus ? "item-hover-gradient mx-1.5 my-0.5 rounded-[16px]" : "text-popover-foreground mx-1.5 my-0.5"
                                                )
                                            }
                                            value="all"
                                        >
                                            {({ selected, focus }) => (
                                                <div className="contents">
                                                    <span className={cn("block truncate", selected ? "font-medium" : "font-normal")}>
                                                        All Employees
                                                    </span>
                                                    {selected ? (
                                                        <span className={cn("absolute inset-y-0 left-0 flex items-center pl-3", focus ? "text-black font-extrabold" : "text-primary")}>
                                                            <Check className="h-4 w-4" aria-hidden="true" />
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
                                                    "relative cursor-default select-none py-2 pl-10 pr-4",
                                                    focus ? "item-hover-gradient mx-1.5 my-0.5 rounded-[16px]" : "text-popover-foreground mx-1.5 my-0.5"
                                                )
                                            }
                                            value={returnValue === 'id' ? person.id.toString() : `${person.first_name} ${person.last_name}`}
                                        >
                                            {({ selected, focus }) => (
                                                <div className="contents">
                                                    <span className={cn("block truncate", selected ? "font-medium" : "font-normal")}>
                                                        {person.first_name} {person.last_name}
                                                        <span className={cn("ml-2 text-xs transition-colors duration-200", focus ? "text-black/65 font-semibold" : "text-muted-foreground")}>({person.employee_number})</span>
                                                    </span>
                                                    {selected ? (
                                                        <span className={cn("absolute inset-y-0 left-0 flex items-center pl-3", focus ? "text-black font-extrabold" : "text-primary")}>
                                                            <Check className="h-4 w-4" aria-hidden="true" />
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
