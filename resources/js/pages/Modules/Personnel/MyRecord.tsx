import { Head, router } from '@inertiajs/react';
import { EmployeeCard } from '@/components/Personnel/EmployeeCard';
import { Button } from '@/components/ui/button';
import { DownloadCloud } from 'lucide-react';
import { useState } from 'react';

interface Props {
    employee: any;
}

export default function MyRecord({ employee }: Props) {
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = () => {
        setIsExporting(true);
        router.post(route('dsar.export'), {}, {
            onFinish: () => setIsExporting(false),
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title={`My Personnel Record`} />
            
            <div className="space-y-6 p-4 max-w-5xl mx-auto">
                <div className="flex justify-end">
                    <Button 
                        variant="outline" 
                        onClick={handleExport} 
                        disabled={isExporting}
                    >
                        <DownloadCloud className="w-4 h-4 mr-2" />
                        {isExporting ? 'Requesting...' : 'Export My Data (DSAR)'}
                    </Button>
                </div>
                
                <EmployeeCard employee={employee} />
            </div>
        </>
    );
}

MyRecord.layout = {
    breadcrumbs: [
        { title: 'Profile', href: '#' }
    ],
};
