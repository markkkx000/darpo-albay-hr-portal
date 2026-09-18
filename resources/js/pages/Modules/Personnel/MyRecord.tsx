import { Head, router } from '@inertiajs/react';
import { DownloadCloud } from 'lucide-react';
import { useState } from 'react';
import { EmployeeCard } from '@/components/Personnel/EmployeeCard';
import { Button } from '@/components/ui/button';
import dsar from '@/routes/personnel/dsar';

interface Props {
    employee: any;
}

export default function MyRecord({ employee }: Props) {
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = () => {
        setIsExporting(true);
        router.post(
            dsar.export.url(),
            {},
            {
                onFinish: () => setIsExporting(false),
                preserveScroll: true,
            },
        );
    };

    return (
        <>
            <Head title={`My Personnel Record`} />

            <div className="mx-auto max-w-5xl space-y-6 p-4">
                <div className="flex justify-end">
                    <Button
                        variant="outline"
                        onClick={handleExport}
                        disabled={isExporting}
                    >
                        <DownloadCloud className="mr-2 h-4 w-4" />
                        {isExporting
                            ? 'Requesting...'
                            : 'Export My Data (DSAR)'}
                    </Button>
                </div>

                <EmployeeCard employee={employee} />
            </div>
        </>
    );
}

MyRecord.layout = {
    breadcrumbs: [{ title: 'Profile', href: '#' }],
};
