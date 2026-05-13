import { Edit2, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import AdjustBalanceForm from './AdjustBalanceForm';

interface CreditDetailSheetProps {
    user: any;
    leaveTypes: any[];
    year: number;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function CreditDetailSheet({
    user,
    leaveTypes,
    year,
    open,
    onOpenChange,
}: CreditDetailSheetProps) {
    const [editingTypeId, setEditingTypeId] = useState<number | null>(null);

    if (!user) {
        return null;
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-xl overflow-y-auto">
                <SheetHeader className="mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <SheetTitle className="text-2xl font-bold tracking-tight">
                                {user.first_name} {user.last_name}
                            </SheetTitle>
                            <SheetDescription className="text-muted-foreground">
                                {user.employee_number} • {user.division?.name || 'No Division'}
                            </SheetDescription>
                        </div>
                    </div>
                </SheetHeader>

                <div className="space-y-6 p-4">
                    <div className="flex items-center justify-between border-b pb-2">
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                            Leave Credit Breakdown ({year})
                        </h3>
                    </div>

                    <div className="space-y-4">
                        {leaveTypes.map((type) => {
                            const credit = user.leave_credits?.find(
                                (c: any) => c.leave_type_id === type.id
                            );
                            const isEditing = editingTypeId === type.id;

                            const balance = parseFloat(credit?.balance || '0');
                            const used = parseFloat(credit?.used || '0');
                            const total = parseFloat(credit?.earned || '0');

                            return (
                                <div
                                    key={type.id}
                                    className="matte-card elev-2 p-5 rounded-2xl border-none space-y-4"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="h-3 w-3 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.2)]"
                                                style={{ backgroundColor: type.color_code || '#cbd5e1' }}
                                            />
                                            <span className="font-bold text-lg tracking-tight">{type.name}</span>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setEditingTypeId(isEditing ? null : type.id)}
                                            className="h-8 w-8 p-0 rounded-full btn-ghost-specular border-none"
                                        >
                                            {isEditing ? (
                                                <X className="h-4 w-4" />
                                            ) : (
                                                <Edit2 className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>

                                    {isEditing ? (
                                        <AdjustBalanceForm
                                            userId={user.id}
                                            leaveTypeId={type.id}
                                            year={year}
                                            initialAvailable={balance}
                                            initialUsed={used}
                                            onSuccess={() => setEditingTypeId(null)}
                                        />
                                    ) : (
                                        <div className="grid grid-cols-3 gap-3">
                                            <div className="flex flex-col items-center gap-1 p-3 rounded-2xl bg-muted/20 border border-muted/10">
                                                <span className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Available</span>
                                                <span className="status-badge-casual px-3 py-1 rounded-full text-sm shadow-lg">
                                                    {balance.toFixed(3)}
                                                </span>
                                            </div>
                                            <div className="flex flex-col items-center gap-1 p-3 rounded-2xl bg-muted/20 border border-muted/10">
                                                <span className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Used</span>
                                                <span className="status-badge-warning px-3 py-1 rounded-full text-sm shadow-lg">
                                                    {used.toFixed(3)}
                                                </span>
                                            </div>
                                            <div className="flex flex-col items-center gap-1 p-3 rounded-2xl bg-muted/20 border border-muted/10">
                                                <span className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Total</span>
                                                <span className="status-badge-unknown px-3 py-1 rounded-full text-sm shadow-lg">
                                                    {total.toFixed(3)}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
