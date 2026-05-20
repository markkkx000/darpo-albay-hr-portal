import { Head, Link, usePage } from '@inertiajs/react';
import { router } from '@inertiajs/react';
import { Search, ArrowLeft } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { EmployeeTable } from '@/components/Personnel/EmployeeTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/hooks/use-debounce';
import { index as indexRoute, archived as archivedRoute } from '@/routes/personnel';

interface Props {
    employees: any;
    filters: {
        search?: string;
    };
}

export default function Archived({ employees, filters }: Props) {
    const { auth } = usePage().props as any;
    const [search, setSearch] = useState(filters.search || '');
    const debouncedSearch = useDebounce(search, 500);

    const handleFilter = useCallback((searchTerm: string) => {
        router.get(archivedRoute().url, {
            search: searchTerm || undefined,
        }, {
            preserveState: true,
            replace: true,
        });
    }, []);

    useEffect(() => {
        if (debouncedSearch !== (filters.search || '')) {
            handleFilter(debouncedSearch);
        }
    }, [debouncedSearch, filters.search, handleFilter]);

    return (
        <>
            <Head title="Archived Personnel" />

            <div className="p-4 w-full">
                <div className="matte-card elev-1 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 px-6 py-5 rounded-2xl">
                    <div className="flex items-center gap-3">
                        <h1 className="t-headline">Archived Personnel</h1>
                        <p className="text-muted-foreground text-sm mt-2">
                            Review and restore soft-deleted employee records.
                        </p>
                    </div>
                    <Button asChild variant="ghost" className="btn-ghost-specular gap-2 px-6 border-none">
                        <Link href={indexRoute().url}>
                            <ArrowLeft className="h-4 w-4" />
                            Back to Directory
                        </Link>
                    </Button>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 mb-6 gap-4 matte-card elev-1 border border-destructive/20 p-4 rounded-xl">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search archived records..."
                            className="pl-10 border-destructive/10 focus-visible:ring-destructive"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleFilter(search);
                                }
                            }}
                        />
                    </div>
                </div>

                <EmployeeTable
                    employees={employees}
                    isArchivedView={true}
                    canRestore={auth.permissions?.includes('personnel.manage')}
                />
            </div>
        </>
    );
}

Archived.layout = {
    breadcrumbs: [
        { title: 'Personnel Directory', href: indexRoute().url },
        { title: 'Archived Records', href: '#' }
    ],
};
