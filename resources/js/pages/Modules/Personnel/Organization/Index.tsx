import { Head, router } from '@inertiajs/react';
import { Plus, Edit, Building2, Building, Briefcase } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { index as personnelIndexRoute } from '@/routes/personnel';
import organizationRoutes from '@/routes/personnel/organization';

interface Unit {
    id: number;
    name: string;
    division_id: number;
    is_active: boolean;
}

interface Position {
    id: number;
    name: string;
    division_id: number;
    is_active: boolean;
}

interface Division {
    id: number;
    name: string;
    is_active: boolean;
    units: Unit[];
    positions: Position[];
}

interface Props {
    divisions: Division[];
}

export default function Index({ divisions }: Props) {
    const units = divisions.flatMap(d => d.units || []);
    const positions = divisions.flatMap(d => d.positions || []);

    const [isDivisionOpen, setIsDivisionOpen] = useState(false);
    const [isUnitOpen, setIsUnitOpen] = useState(false);
    const [isPositionOpen, setIsPositionOpen] = useState(false);

    const [editingDivision, setEditingDivision] = useState<Division | null>(null);
    const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
    const [editingPosition, setEditingPosition] = useState<Position | null>(null);

    const [formData, setFormData] = useState<any>({});
    const [processing, setProcessing] = useState(false);

    const openDivisionDialog = (div?: Division) => {
        setEditingDivision(div || null);
        setFormData(div ? { name: div.name, is_active: div.is_active } : { name: '', is_active: true });
        setIsDivisionOpen(true);
    };

    const openUnitDialog = (unit?: Unit) => {
        setEditingUnit(unit || null);
        setFormData(unit ? { name: unit.name, division_id: unit.division_id.toString(), is_active: unit.is_active } : { name: '', division_id: '', is_active: true });
        setIsUnitOpen(true);
    };

    const openPositionDialog = (pos?: Position) => {
        setEditingPosition(pos || null);
        setFormData(pos ? { name: pos.name, division_id: pos.division_id.toString(), is_active: pos.is_active } : { name: '', division_id: '', is_active: true });
        setIsPositionOpen(true);
    };

    const handleDivisionSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);

        if (editingDivision) {
            router.put(organizationRoutes.divisions.update(editingDivision.id).url, formData, {
                onSuccess: () => {
                    toast.success('Division updated successfully');
                    setIsDivisionOpen(false);
                },
                onFinish: () => setProcessing(false)
            });
        } else {
            router.post(organizationRoutes.divisions.store().url, formData, {
                onSuccess: () => {
                    toast.success('Division created successfully');
                    setIsDivisionOpen(false);
                },
                onFinish: () => setProcessing(false)
            });
        }
    };

    const handleUnitSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);

        if (editingUnit) {
            router.put(organizationRoutes.units.update(editingUnit.id).url, formData, {
                onSuccess: () => {
                    toast.success('Unit updated successfully');
                    setIsUnitOpen(false);
                },
                onFinish: () => setProcessing(false)
            });
        } else {
            router.post(organizationRoutes.units.store().url, formData, {
                onSuccess: () => {
                    toast.success('Unit created successfully');
                    setIsUnitOpen(false);
                },
                onFinish: () => setProcessing(false)
            });
        }
    };

    const handlePositionSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);

        if (editingPosition) {
            router.put(organizationRoutes.positions.update(editingPosition.id).url, formData, {
                onSuccess: () => {
                    toast.success('Position updated successfully');
                    setIsPositionOpen(false);
                },
                onFinish: () => setProcessing(false)
            });
        } else {
            router.post(organizationRoutes.positions.store().url, formData, {
                onSuccess: () => {
                    toast.success('Position created successfully');
                    setIsPositionOpen(false);
                },
                onFinish: () => setProcessing(false)
            });
        }
    };

    return (
        <>
            <Head title="Organization Management" />
            
            <div className="p-4 w-full max-w-5xl mx-auto space-y-6">
                <div className="matte-card elev-1 flex flex-col md:flex-row md:items-center justify-between gap-4 px-6 py-5 rounded-2xl">
                    <div className="flex items-center gap-3">
                        <h1 className="t-headline">Organization Management</h1>
                        <p className="text-muted-foreground text-sm mt-2">
                            Manage Divisions, Units, and Positions.
                        </p>
                    </div>
                </div>

                <Tabs defaultValue="divisions" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 mb-6 bg-muted/40 p-1 rounded-xl">
                        <TabsTrigger value="divisions" className="rounded-lg data-[state=active]:sidebar-active-gradient data-[state=active]:sidebar-active-text font-bold uppercase text-[10px] tracking-widest gap-2 py-2.5">
                            <Building2 className="h-4 w-4" /> Divisions
                        </TabsTrigger>
                        <TabsTrigger value="units" className="rounded-lg data-[state=active]:sidebar-active-gradient data-[state=active]:sidebar-active-text font-bold uppercase text-[10px] tracking-widest gap-2 py-2.5">
                            <Building className="h-4 w-4" /> Units
                        </TabsTrigger>
                        <TabsTrigger value="positions" className="rounded-lg data-[state=active]:sidebar-active-gradient data-[state=active]:sidebar-active-text font-bold uppercase text-[10px] tracking-widest gap-2 py-2.5">
                            <Briefcase className="h-4 w-4" /> Positions
                        </TabsTrigger>
                    </TabsList>
                    
                    {/* Divisions Tab */}
                    <TabsContent value="divisions">
                        <div className="matte-card elev-2 p-6 rounded-2xl">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-lg font-bold">Divisions List</h2>
                                <Button onClick={() => openDivisionDialog()} className="btn-specular gap-2 px-6 border-none">
                                    <Plus className="h-4 w-4" /> Add Division
                                </Button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-[10px] text-muted-foreground uppercase bg-muted/40 font-bold tracking-widest border-b border-border/50">
                                        <tr>
                                            <th className="px-6 py-4">Name</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/30">
                                        {divisions.map(div => (
                                            <tr key={div.id} className="hover:bg-muted/40 transition-colors">
                                                <td className="px-6 py-4 font-bold">{div.name}</td>
                                                <td className="px-6 py-4 text-xs font-bold uppercase">
                                                    <span className={cn(
                                                        "inline-flex items-center rounded-full px-2.5 py-0.5 tracking-wide shadow-sm",
                                                        div.is_active ? 'status-badge-permanent' : 'status-badge-unknown'
                                                    )}>
                                                        {div.is_active ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <Button variant="ghost" size="sm" onClick={() => openDivisionDialog(div)} className="h-8 w-8 p-0 rounded-full hover:bg-primary/10 hover:text-primary">
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                        {divisions.length === 0 && (
                                            <tr>
                                                <td colSpan={3} className="px-6 py-8 text-center text-muted-foreground">No divisions found.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </TabsContent>

                    {/* Units Tab */}
                    <TabsContent value="units">
                        <div className="matte-card elev-2 p-6 rounded-2xl">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-lg font-bold">Units List</h2>
                                <Button onClick={() => openUnitDialog()} className="btn-specular gap-2 px-6 border-none">
                                    <Plus className="h-4 w-4" /> Add Unit
                                </Button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-[10px] text-muted-foreground uppercase bg-muted/40 font-bold tracking-widest border-b border-border/50">
                                        <tr>
                                            <th className="px-6 py-4">Name</th>
                                            <th className="px-6 py-4">Division</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/30">
                                        {units.map(unit => (
                                            <tr key={unit.id} className="hover:bg-muted/40 transition-colors">
                                                <td className="px-6 py-4 font-bold">{unit.name}</td>
                                                <td className="px-6 py-4 text-muted-foreground">{divisions.find(d => d.id === unit.division_id)?.name}</td>
                                                <td className="px-6 py-4 text-xs font-bold uppercase">
                                                    <span className={cn(
                                                        "inline-flex items-center rounded-full px-2.5 py-0.5 tracking-wide shadow-sm",
                                                        unit.is_active ? 'status-badge-permanent' : 'status-badge-unknown'
                                                    )}>
                                                        {unit.is_active ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <Button variant="ghost" size="sm" onClick={() => openUnitDialog(unit)} className="h-8 w-8 p-0 rounded-full hover:bg-primary/10 hover:text-primary">
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                        {units.length === 0 && (
                                            <tr>
                                                <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">No units found.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </TabsContent>

                    {/* Positions Tab */}
                    <TabsContent value="positions">
                        <div className="matte-card elev-2 p-6 rounded-2xl">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-lg font-bold">Positions List</h2>
                                <Button onClick={() => openPositionDialog()} className="btn-specular gap-2 px-6 border-none">
                                    <Plus className="h-4 w-4" /> Add Position
                                </Button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-[10px] text-muted-foreground uppercase bg-muted/40 font-bold tracking-widest border-b border-border/50">
                                        <tr>
                                            <th className="px-6 py-4">Name</th>
                                            <th className="px-6 py-4">Division</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/30">
                                        {positions.map(pos => (
                                            <tr key={pos.id} className="hover:bg-muted/40 transition-colors">
                                                <td className="px-6 py-4 font-bold">{pos.name}</td>
                                                <td className="px-6 py-4 text-muted-foreground">{divisions.find(d => d.id === pos.division_id)?.name}</td>
                                                <td className="px-6 py-4 text-xs font-bold uppercase">
                                                    <span className={cn(
                                                        "inline-flex items-center rounded-full px-2.5 py-0.5 tracking-wide shadow-sm",
                                                        pos.is_active ? 'status-badge-permanent' : 'status-badge-unknown'
                                                    )}>
                                                        {pos.is_active ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <Button variant="ghost" size="sm" onClick={() => openPositionDialog(pos)} className="h-8 w-8 p-0 rounded-full hover:bg-primary/10 hover:text-primary">
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                        {positions.length === 0 && (
                                            <tr>
                                                <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">No positions found.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Division Dialog */}
            <Dialog open={isDivisionOpen} onOpenChange={setIsDivisionOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingDivision ? 'Edit Division' : 'Add Division'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleDivisionSubmit} className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Division Name</Label>
                            <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                        </div>
                        <div className="flex items-center gap-2">
                            <Switch checked={formData.is_active} onCheckedChange={(checked: boolean) => setFormData({...formData, is_active: checked})} />
                            <Label>Active</Label>
                        </div>
                        <DialogFooter>
                            <Button type="submit" disabled={processing} className="btn-specular">Save Division</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Unit Dialog */}
            <Dialog open={isUnitOpen} onOpenChange={setIsUnitOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingUnit ? 'Edit Unit' : 'Add Unit'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleUnitSubmit} className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Unit Name</Label>
                            <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                        </div>
                        <div className="space-y-2">
                            <Label>Division</Label>
                            <Select value={formData.division_id} onValueChange={v => setFormData({...formData, division_id: v})}>
                                <SelectTrigger><SelectValue placeholder="Select Division" /></SelectTrigger>
                                <SelectContent>
                                    {divisions.map(d => <SelectItem key={d.id} value={d.id.toString()}>{d.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center gap-2">
                            <Switch checked={formData.is_active} onCheckedChange={(checked: boolean) => setFormData({...formData, is_active: checked})} />
                            <Label>Active</Label>
                        </div>
                        <DialogFooter>
                            <Button type="submit" disabled={processing} className="btn-specular">Save Unit</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Position Dialog */}
            <Dialog open={isPositionOpen} onOpenChange={setIsPositionOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingPosition ? 'Edit Position' : 'Add Position'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handlePositionSubmit} className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Position Name</Label>
                            <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                        </div>
                        <div className="space-y-2">
                            <Label>Division</Label>
                            <Select value={formData.division_id} onValueChange={v => setFormData({...formData, division_id: v})}>
                                <SelectTrigger><SelectValue placeholder="Select Division" /></SelectTrigger>
                                <SelectContent>
                                    {divisions.map(d => <SelectItem key={d.id} value={d.id.toString()}>{d.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center gap-2">
                            <Switch checked={formData.is_active} onCheckedChange={(checked: boolean) => setFormData({...formData, is_active: checked})} />
                            <Label>Active</Label>
                        </div>
                        <DialogFooter>
                            <Button type="submit" disabled={processing} className="btn-specular">Save Position</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}

Index.layout = {
    breadcrumbs: [
        { title: 'Personnel Directory', href: personnelIndexRoute().url },
        { title: 'Organization Management', href: '#' }
    ],
};
