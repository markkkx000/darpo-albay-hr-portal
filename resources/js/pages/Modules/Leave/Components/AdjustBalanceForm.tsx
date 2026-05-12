import { useForm } from '@inertiajs/react';
import { Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import LeaveRoutes from '@/routes/leave';

interface AdjustBalanceFormProps {
    userId: number;
    leaveTypeId: number;
    year: number;
    initialAvailable: number;
    initialUsed: number;
    onSuccess?: () => void;
}

export default function AdjustBalanceForm({
    userId,
    leaveTypeId,
    year,
    initialAvailable,
    initialUsed,
    onSuccess,
}: AdjustBalanceFormProps) {
    const { data, setData, put, processing, errors } = useForm({
        user_id: userId,
        leave_type_id: leaveTypeId,
        year: year,
        balance: initialAvailable,
        used: initialUsed,
    });

    // Auto-calculate Total (Earned) visually
    const total = (Number(data.balance) || 0) + (Number(data.used) || 0);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(LeaveRoutes.credits.update().url, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Balances updated successfully');

                if (onSuccess) {
                    onSuccess();
                }
            },
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-xl bg-muted/20 border-border/50 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="available">Available (Balance)</Label>
                    <Input
                        id="available"
                        type="number"
                        step="0.001"
                        value={data.balance}
                        onChange={(e) => setData('balance', parseFloat(e.target.value) || 0)}
                        required
                    />
                    {errors.balance && <p className="text-xs text-destructive">{errors.balance}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="used">Used</Label>
                    <Input
                        id="used"
                        type="number"
                        step="0.001"
                        value={data.used}
                        onChange={(e) => setData('used', parseFloat(e.target.value) || 0)}
                        required
                    />
                    {errors.used && <p className="text-xs text-destructive">{errors.used}</p>}
                </div>
            </div>

            <div className="flex items-center justify-between pt-2">
                <div className="text-sm font-medium">
                    New Total: <span className="text-primary font-bold">{total.toFixed(3)}</span>
                </div>
                <Button type="submit" disabled={processing} size="sm" className="btn-specular">
                    {processing ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save className="mr-2 h-4 w-4" />
                            Update
                        </>
                    )}
                </Button>
            </div>
        </form>
    );
}
