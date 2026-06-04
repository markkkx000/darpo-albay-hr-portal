import { useForm, router } from '@inertiajs/react';
import { Plus, History, Clock, Pencil, Trash2, X, Check } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { DatePicker } from '@/components/date-picker';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { store as storePromotionRoute, update as updatePromotionRoute, destroy as destroyPromotionRoute } from '@/routes/personnel/promotions';
import type { Employee } from './EmployeeCard';
import { PositionCombobox } from './PositionCombobox';

export function PromotionHistorySection({ employee, positions = [] }: { employee: Employee & { promotion_histories?: any[] }, positions?: any[] }) {
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editData, setEditData] = useState({ position_name: '', promotion_date: '' });
    const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

    // Filter positions to only show those from the employee's division
    const filteredPositions = employee.division?.id
        ? positions.filter(p => p.division_id === employee.division!.id)
        : positions;

    const { data, setData, post, processing, reset, errors } = useForm({
        position_name: '',
        promotion_date: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(storePromotionRoute({ user: employee.id }).url, {
            onSuccess: () => {
                toast.success('Promotion logged successfully.');
                reset();
                setShowForm(false);
            },
            preserveScroll: true,
        });
    };

    const submitEdit = (id: number) => {
        router.put(updatePromotionRoute({ user: employee.id, promotionHistory: id }).url, editData, {
            onSuccess: () => {
                toast.success('Promotion updated successfully.');
                setEditingId(null);
            },
            preserveScroll: true,
        });
    };

    const handleDelete = (id: number) => {
        setDeleteTargetId(id);
    };

    const confirmDelete = () => {
        if (deleteTargetId === null) {
return;
}

        router.delete(destroyPromotionRoute({ user: employee.id, promotionHistory: deleteTargetId }).url, {
            onSuccess: () => {
                toast.success('Promotion deleted successfully.');
                setDeleteTargetId(null);
            },
            preserveScroll: true,
        });
    };

    const startEdit = (promo: any) => {
        setEditData({ position_name: promo.position_name, promotion_date: promo.promotion_date });
        setEditingId(promo.id);
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' });
    };

    return (
        <>
        <Card className="matte-card elev-2 mt-6 border-none">
            <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <div className="h-1 w-8 bg-primary rounded-full" />
                        <h3 className="text-sm font-black text-muted-foreground uppercase tracking-[0.2em]">Promotions & History</h3>
                    </div>
                    <Button 
                        onClick={() => setShowForm(!showForm)} 
                        variant="outline" 
                        size="sm"
                        className="btn-specular rounded-xl border-border/20"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Log Promotion
                    </Button>
                </div>

                {showForm && (
                    <form onSubmit={submit} className="mb-8 p-4 bg-surface-2/30 rounded-2xl border border-border/5 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="position_name">Position Name</Label>
                                <PositionCombobox
                                    positions={filteredPositions}
                                    value={{ name: data.position_name }}
                                    onChange={(val) => setData('position_name', val.name)}
                                    placeholder="Search or select position..."
                                />
                                {errors.position_name && <p className="text-xs text-destructive">{errors.position_name}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="promotion_date">Promotion Date</Label>
                                <DatePicker
                                    id="promotion_date"
                                    value={data.promotion_date}
                                    onChange={val => setData('promotion_date', val || '')}
                                />
                                {errors.promotion_date && <p className="text-xs text-destructive">{errors.promotion_date}</p>}
                            </div>
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
                            <Button type="submit" disabled={processing} className="btn-specular">Save Promotion</Button>
                        </div>
                    </form>
                )}

                <div className="space-y-4 relative before:absolute before:inset-y-0 before:left-[11px] before:w-px before:bg-border/40">
                    {employee.promotion_histories?.length === 0 ? (
                        <div className="text-sm text-muted-foreground pl-8 py-2 flex items-center gap-2">
                            <History className="h-4 w-4 opacity-50" />
                            No promotion history logged yet.
                        </div>
                    ) : (
                        employee.promotion_histories?.sort((a, b) => new Date(b.promotion_date).getTime() - new Date(a.promotion_date).getTime()).map((promo: any) => (
                            <div key={promo.id} className="relative pl-8 group">
                                <div className="absolute left-0 top-1.5 h-[22px] w-[22px] rounded-full bg-surface-1 border border-primary/30 flex items-center justify-center">
                                    <div className="h-2 w-2 rounded-full bg-primary/80" />
                                </div>
                                {editingId === promo.id ? (
                                    <div className="flex flex-col md:flex-row gap-2 bg-surface-2/30 p-2 rounded-xl border border-border/10">
                                        <div className="flex-1 min-w-[200px]">
                                            <PositionCombobox
                                                positions={filteredPositions}
                                                value={{ name: editData.position_name }}
                                                onChange={(val) => setEditData(prev => ({ ...prev, position_name: val.name }))}
                                                placeholder="Search or select position..."
                                            />
                                        </div>
                                        <div className="w-[200px]">
                                            <DatePicker
                                                value={editData.promotion_date}
                                                onChange={val => setEditData(prev => ({ ...prev, promotion_date: val || '' }))}
                                            />
                                        </div>
                                        <div className="flex gap-1 shrink-0">
                                            <Button size="icon" variant="ghost" className="h-9 w-9 text-green-500 hover:text-green-600 hover:bg-green-500/10" onClick={() => submitEdit(promo.id)}>
                                                <Check className="h-4 w-4" />
                                            </Button>
                                            <Button size="icon" variant="ghost" className="h-9 w-9 text-muted-foreground" onClick={() => setEditingId(null)}>
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-start justify-between">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-foreground transition-colors">{promo.position_name}</span>
                                            <span className="text-[11px] text-muted-foreground font-medium flex items-center gap-1 mt-0.5">
                                                <Clock className="h-3 w-3" />
                                                {formatDate(promo.promotion_date)}
                                            </span>
                                        </div>
                                        <div className="opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity flex items-center gap-1">
                                            <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => startEdit(promo)}>
                                                <Pencil className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                                            </Button>
                                            <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => handleDelete(promo.id)}>
                                                <Trash2 className="h-3 w-3 text-destructive/70 hover:text-destructive" />
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteTargetId !== null} onOpenChange={(open) => {
 if (!open) {
setDeleteTargetId(null);
} 
}}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Are you absolutely sure?</DialogTitle>
                    <DialogDescription>
                        This will delete the promotion history entry. This action cannot be undone and may affect the salary step calculation.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button
                        variant="ghost"
                        onClick={() => setDeleteTargetId(null)}
                        className="btn-ghost-specular border-none px-6"
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="ghost-destructive"
                        onClick={confirmDelete}
                        className="btn-ghost-danger-specular border-none px-6"
                    >
                        Delete Log
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
        </>
    );
}
