import { Head } from '@inertiajs/react';
import { Construction } from 'lucide-react';

export default function Index() {
    return (
        <>
            <Head title="Travel Orders" />
            <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
                <div className="matte-card elev-2 max-w-md space-y-4 p-8">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <Construction className="h-6 w-6 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground">Travel Orders</h2>
                    <p className="text-muted-foreground">
                        This module is on the roadmap. It will support travel order creation, approval workflows, and
                        itinerary tracking.
                    </p>
                    <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                        Coming Soon
                    </span>
                </div>
            </div>
        </>
    );
}

Index.layout = {
    breadcrumbs: [{ title: 'Travel Orders', href: '/travel' }],
};
