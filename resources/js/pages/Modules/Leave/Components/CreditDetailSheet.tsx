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
                                    className="p-4 rounded-2xl border border-border/50 bg-surface-1 shadow-sm transition-all hover:shadow-md"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="h-3 w-3 rounded-full shadow-sm"
                                                style={{ backgroundColor: type.color_code || '#cbd5e1' }}
                                            />
                                            <span className="font-bold text-base">{type.name}</span>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setEditingTypeId(isEditing ? null : type.id)}
                                            className="h-8 w-8 p-0 rounded-full hover:bg-muted"
                                        >
                                            {isEditing ? (
                                                <X className="h-4 w-4" />
                                            ) : (
                                                <Edit2 className="h-4 w-4 text-muted-foreground" />
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
                                        <div className="grid grid-cols-3 gap-2">
                                            <div className="flex flex-col items-center p-2 rounded-xl bg-primary/5 border border-primary/10">
                                                <span className="text-[10px] uppercase font-bold text-primary/70 tracking-tighter">Available</span>
                                                <span className="text-lg font-black text-primary">{balance.toFixed(3)}</span>
                                            </div>
                                            <div className="flex flex-col items-center p-2 rounded-xl bg-orange-500/5 border border-orange-500/10">
                                                <span className="text-[10px] uppercase font-bold text-orange-600/70 tracking-tighter">Used</span>
                                                <span className="text-lg font-black text-orange-600">{used.toFixed(3)}</span>
                                            </div>
                                            <div className="flex flex-col items-center p-2 rounded-xl bg-muted/30 border border-border/50">
                                                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-tighter">Total</span>
                                                <span className="text-lg font-black">{total.toFixed(3)}</span>
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
