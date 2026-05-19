import { Head } from '@inertiajs/react';

export default function Index() {
    return (
        <>
            <Head title="Travel Orders" />
            <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
                <div className="matte-card elev-2 max-w-md p-8">
                    <h2 className="mb-4 text-2xl font-bold text-foreground">Travel Orders</h2>
                    <p className="text-muted-foreground">
                        This page is still under construction :(
                    </p>
                </div>
            </div>
        </>
    );
}

Index.layout = {
    breadcrumbs: [
        { title: 'Travel Orders', href: '/travel' },
    ],
};
