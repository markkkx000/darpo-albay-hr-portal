import { TriangleAlert } from 'lucide-react';
import { StatCard } from '@/components/dashboard/stat-card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface CreditPreviewProps {
    available: number;
    requested: number;
    remaining: number;
    leaveTypeName: string;
    accentColor: string;
}

export function CreditPreview({
    available,
    requested,
    remaining,
    leaveTypeName,
    accentColor,
}: CreditPreviewProps) {
    const isMonetization = leaveTypeName.toLowerCase().includes('monetization');
    const showMonetizationWarning = isMonetization && remaining < 15;

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <StatCard
                    title="Available"
                    value={available.toFixed(3)}
                    accentColor={accentColor}
                />
                <StatCard
                    title="Requested"
                    value={requested.toFixed(3)}
                    accentColor="#F59E0B" // Amber for request
                />
                <StatCard
                    title="Remaining"
                    value={remaining.toFixed(3)}
                    accentColor={remaining < 0 ? '#EF4444' : '#10B981'} // Red if negative, Emerald otherwise
                />
            </div>

            {showMonetizationWarning && (
                <Alert
                    variant="destructive"
                    className="border-red-500/50 bg-red-500/10"
                >
                    <TriangleAlert className="h-4 w-4" />
                    <AlertTitle>Monetization Rule Violation</AlertTitle>
                    <AlertDescription>
                        CSC Rule: A minimum of 15 days vacation leave balance
                        must remain after monetization. Current remaining:{' '}
                        <span className="font-bold">
                            {remaining.toFixed(3)}
                        </span>
                    </AlertDescription>
                </Alert>
            )}
        </div>
    );
}
