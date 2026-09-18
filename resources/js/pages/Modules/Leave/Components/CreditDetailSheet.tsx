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
            <SheetContent className="overflow-y-auto sm:max-w-xl">
                <SheetHeader className="mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <SheetTitle className="text-2xl font-bold tracking-tight">
                                {user.first_name} {user.last_name}
                            </SheetTitle>
                            <SheetDescription className="text-muted-foreground">
                                {user.employee_number} •{' '}
                                {user.division?.name || 'No Division'}
                            </SheetDescription>
                        </div>
                    </div>
                </SheetHeader>

                <div className="space-y-6 p-4">
                    <div className="flex items-center justify-between border-b pb-2">
                        <h3 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">
                            Leave Credit Breakdown ({year})
                        </h3>
                    </div>

                    <div className="space-y-4">
                        {leaveTypes.map((type) => {
                            const credit = user.leave_credits?.find(
                                (c: any) => c.leave_type_id === type.id,
                            );
                            const isEditing = editingTypeId === type.id;

                            const balance = parseFloat(credit?.balance || '0');
                            const used = parseFloat(credit?.used || '0');
                            const total = parseFloat(credit?.earned || '0');

                            return (
                                <div
                                    key={type.id}
                                    className="matte-card elev-2 space-y-4 rounded-2xl border-none p-5"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="h-3 w-3 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.2)]"
                                                style={{
                                                    backgroundColor:
                                                        type.color_code ||
                                                        '#cbd5e1',
                                                }}
                                            />
                                            <span className="text-lg font-bold tracking-tight">
                                                {type.name}
                                            </span>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                                setEditingTypeId(
                                                    isEditing ? null : type.id,
                                                )
                                            }
                                            className="btn-ghost-specular h-8 w-8 rounded-full border-none p-0"
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
                                            onSuccess={() =>
                                                setEditingTypeId(null)
                                            }
                                        />
                                    ) : (
                                        <div className="grid grid-cols-3 gap-3">
                                            <div className="flex flex-col items-center gap-1 rounded-2xl border border-muted/10 bg-muted/20 p-3">
                                                <span className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">
                                                    Available
                                                </span>
                                                <span className="status-badge-casual rounded-full px-3 py-1 text-sm shadow-lg">
                                                    {balance.toFixed(3)}
                                                </span>
                                            </div>
                                            <div className="flex flex-col items-center gap-1 rounded-2xl border border-muted/10 bg-muted/20 p-3">
                                                <span className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">
                                                    Used
                                                </span>
                                                <span className="status-badge-warning rounded-full px-3 py-1 text-sm shadow-lg">
                                                    {used.toFixed(3)}
                                                </span>
                                            </div>
                                            <div className="flex flex-col items-center gap-1 rounded-2xl border border-muted/10 bg-muted/20 p-3">
                                                <span className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">
                                                    Total
                                                </span>
                                                <span className="status-badge-unknown rounded-full px-3 py-1 text-sm shadow-lg">
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
