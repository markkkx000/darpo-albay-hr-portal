import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { toast } from 'sonner';
import { Plus, History, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/date-picker';
import { Card, CardContent } from '@/components/ui/card';
import type { Employee } from './EmployeeCard';

export function PromotionHistorySection({ employee }: { employee: Employee & { promotion_histories?: any[] } }) {
    const [showForm, setShowForm] = useState(false);
    const { data, setData, post, processing, reset, errors } = useForm({
        position_name: '',
        promotion_date: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/personnel/${employee.id}/promotions`, {
            onSuccess: () => {
                toast.success('Promotion logged successfully.');
                reset();
                setShowForm(false);
            },
            preserveScroll: true,
        });
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' });
    };

    return (
        <Card className="matte-card elev-2 mt-6 border-none overflow-hidden">
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
                                <Input
                                    id="position_name"
                                    value={data.position_name}
                                    onChange={e => setData('position_name', e.target.value)}
                                    placeholder="e.g. Senior Developer"
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
                            <div key={promo.id} className="relative pl-8">
                                <div className="absolute left-0 top-1.5 h-[22px] w-[22px] rounded-full bg-surface-1 border border-primary/30 flex items-center justify-center">
                                    <div className="h-2 w-2 rounded-full bg-primary/80" />
                                </div>
                                <div className="flex flex-col group">
                                    <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{promo.position_name}</span>
                                    <span className="text-[11px] text-muted-foreground font-medium flex items-center gap-1 mt-0.5">
                                        <Clock className="h-3 w-3" />
                                        {formatDate(promo.promotion_date)}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
