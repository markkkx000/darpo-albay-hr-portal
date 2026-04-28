import { Combobox, ComboboxInput, ComboboxOption, ComboboxOptions, ComboboxButton, Transition } from '@headlessui/react';
import { router } from '@inertiajs/react';
import { Check, ChevronsUpDown, Search } from 'lucide-react';
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
    route: string;
    params?: Record<string, any>;
}

export function EmployeeSearch({ 
    users, 
    selectedId, 
    placeholder = "Search employee...", 
    onSelect,
    route,
    params = {}
}: EmployeeSearchProps) {
    const [query, setQuery] = useState('');

    const filteredUsers = useMemo(() => {
        return query === ''
            ? users
            : users.filter((user) => {
                const fullName = `${user.first_name} ${user.last_name}`.toLowerCase();
                const reverseName = `${user.last_name}, ${user.first_name}`.toLowerCase();
                const searchStr = query.toLowerCase();

                return fullName.includes(searchStr) || 
                       reverseName.includes(searchStr) || 
                       (user.employee_number && user.employee_number.toLowerCase().includes(searchStr));
            });
    }, [query, users]);

    const handleChange = (val: string | null) => {
        if (!val) {
return;
}
        
        if (onSelect) {
            onSelect(val as string | 'all');
        } else {
            router.get(route, {
                ...params,
                search: val === 'all' ? undefined : val,
            }, {
                preserveState: true,
                replace: true,
            });
        }
    };

    // If selectedId is a number, we might need to find the user to get their name for the displayValue
    // However, if we're just filtering by name/number as a string, it's different from the Calendar.
    // In Calendar, selectedId is the exact user ID.
    // In Index/Credits/Tardiness, 'search' usually is the string from the search bar.
    
    // Let's adapt it: if val matches a user name, we search for that.
    
    return (
        <div className="w-full max-w-sm">
            <Combobox 
                value={selectedId ? selectedId.toString() : ''} 
                onChange={handleChange}
            >
                <div className="relative w-full z-10">
                    <div className="relative w-full cursor-default overflow-hidden rounded-md border border-input bg-background text-left shadow-sm focus-within:ring-1 focus-within:ring-ring">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <Search className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <ComboboxInput
                            className="w-full border-none py-2 pl-9 pr-10 text-sm leading-5 text-foreground bg-transparent focus:ring-0 outline-none"
                            displayValue={(val: string) => {
                                if (val === 'all' || !val) {
return '';
}

                                // If it's a numeric ID, find the user
                                if (!isNaN(Number(val))) {
                                    const found = users.find((u) => u.id.toString() === val);

                                    return found ? `${found.last_name}, ${found.first_name}` : val;
                                }

                                return val;
                            }}
                            placeholder={placeholder}
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
                        <ComboboxOptions className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-popover py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm border z-50">
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
                                    {filteredUsers.map((person) => (
                                        <ComboboxOption
                                            key={person.id}
                                            className={({ focus }) =>
                                                cn(
                                                    "relative cursor-default select-none py-2 pl-10 pr-4",
                                                    focus ? "bg-accent text-accent-foreground" : "text-popover-foreground"
                                                )
                                            }
                                            value={`${person.last_name}, ${person.first_name}`}
                                        >
                                            {({ selected, focus }) => (
                                                <>
                                                    <span className={cn("block truncate", selected ? "font-medium" : "font-normal")}>
                                                        {person.last_name}, {person.first_name}
                                                        <span className="ml-2 text-xs text-muted-foreground">({person.employee_number})</span>
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
    );
}
