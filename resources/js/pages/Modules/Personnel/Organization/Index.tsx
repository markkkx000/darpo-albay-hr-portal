import { Head, router } from '@inertiajs/react';
import { Plus, Edit, Building2, Building, Briefcase } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { SlidingTabs } from '@/components/ui/sliding-tabs';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
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
    const units = divisions.flatMap((d) => d.units || []);
    const positions = divisions.flatMap((d) => d.positions || []);

    const [activeTab, setActiveTab] = useState('divisions');

    const [isDivisionOpen, setIsDivisionOpen] = useState(false);
    const [isUnitOpen, setIsUnitOpen] = useState(false);
    const [isPositionOpen, setIsPositionOpen] = useState(false);

    const [editingDivision, setEditingDivision] = useState<Division | null>(
        null,
    );
    const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
    const [editingPosition, setEditingPosition] = useState<Position | null>(
        null,
    );

    const [formData, setFormData] = useState<any>({});
    const [processing, setProcessing] = useState(false);

    const openDivisionDialog = (div?: Division) => {
        setEditingDivision(div || null);
        setFormData(
            div
                ? { name: div.name, is_active: div.is_active }
                : { name: '', is_active: true },
        );
        setIsDivisionOpen(true);
    };

    const openUnitDialog = (unit?: Unit) => {
        setEditingUnit(unit || null);
        setFormData(
            unit
                ? {
                      name: unit.name,
                      division_id: unit.division_id.toString(),
                      is_active: unit.is_active,
                  }
                : { name: '', division_id: '', is_active: true },
        );
        setIsUnitOpen(true);
    };

    const openPositionDialog = (pos?: Position) => {
        setEditingPosition(pos || null);
        setFormData(
            pos
                ? {
                      name: pos.name,
                      division_id: pos.division_id.toString(),
                      is_active: pos.is_active,
                  }
                : { name: '', division_id: '', is_active: true },
        );
        setIsPositionOpen(true);
    };

    const handleDivisionSubmit = (e: React.SyntheticEvent) => {
        e.preventDefault();
        setProcessing(true);

        if (editingDivision) {
            router.put(
                organizationRoutes.divisions.update(editingDivision.id).url,
                formData,
                {
                    onSuccess: () => {
                        toast.success('Division updated successfully');
                        setIsDivisionOpen(false);
                        router.clearHistory();
                    },
                    onFinish: () => setProcessing(false),
                },
            );
        } else {
            router.post(organizationRoutes.divisions.store().url, formData, {
                onSuccess: () => {
                    toast.success('Division created successfully');
                    setIsDivisionOpen(false);
                    router.clearHistory();
                },
                onFinish: () => setProcessing(false),
            });
        }
    };

    const handleUnitSubmit = (e: React.SyntheticEvent) => {
        e.preventDefault();
        setProcessing(true);

        if (editingUnit) {
            router.put(
                organizationRoutes.units.update(editingUnit.id).url,
                formData,
                {
                    onSuccess: () => {
                        toast.success('Unit updated successfully');
                        setIsUnitOpen(false);
                        router.clearHistory();
                    },
                    onFinish: () => setProcessing(false),
                },
            );
        } else {
            router.post(organizationRoutes.units.store().url, formData, {
                onSuccess: () => {
                    toast.success('Unit created successfully');
                    setIsUnitOpen(false);
                    router.clearHistory();
                },
                onFinish: () => setProcessing(false),
            });
        }
    };

    const handlePositionSubmit = (e: React.SyntheticEvent) => {
        e.preventDefault();
        setProcessing(true);

        if (editingPosition) {
            router.put(
                organizationRoutes.positions.update(editingPosition.id).url,
                formData,
                {
                    onSuccess: () => {
                        toast.success('Position updated successfully');
                        setIsPositionOpen(false);
                        router.clearHistory();
                    },
                    onFinish: () => setProcessing(false),
                },
            );
        } else {
            router.post(organizationRoutes.positions.store().url, formData, {
                onSuccess: () => {
                    toast.success('Position created successfully');
                    setIsPositionOpen(false);
                    router.clearHistory();
                },
                onFinish: () => setProcessing(false),
            });
        }
    };

    return (
        <>
            <Head title="Organization Management" />

            <div className="mx-auto w-full max-w-5xl space-y-6 p-4">
                <div className="matte-card elev-1 flex flex-col justify-between gap-4 rounded-2xl px-6 py-5 md:flex-row md:items-center">
                    <div className="flex items-center gap-3">
                        <h1 className="t-headline">Organization Management</h1>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Manage Divisions, Units, and Positions.
                        </p>
                    </div>
                </div>

                <Tabs
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="w-full"
                >
                    <div className="mb-6 flex w-full">
                        <SlidingTabs
                            tabs={[
                                {
                                    value: 'divisions',
                                    label: (
                                        <span className="text-[10px] font-bold tracking-[0.2em] uppercase">
                                            Divisions
                                        </span>
                                    ),
                                    icon: Building2,
                                    active: activeTab === 'divisions',
                                },
                                {
                                    value: 'units',
                                    label: (
                                        <span className="text-[10px] font-bold tracking-[0.2em] uppercase">
                                            Units
                                        </span>
                                    ),
                                    icon: Building,
                                    active: activeTab === 'units',
                                },
                                {
                                    value: 'positions',
                                    label: (
                                        <span className="text-[10px] font-bold tracking-[0.2em] uppercase">
                                            Positions
                                        </span>
                                    ),
                                    icon: Briefcase,
                                    active: activeTab === 'positions',
                                },
                            ]}
                            layoutId="organization-tabs"
                            onChange={setActiveTab}
                            className="grid w-full grid-cols-3 rounded-2xl border-none bg-muted/40 p-1 [&_.sidebar-active-gradient]:rounded-xl [&_button]:rounded-xl [&_button]:py-2.5"
                        />
                    </div>

                    {/* Divisions Tab */}
                    <TabsContent value="divisions">
                        <div className="matte-card elev-2 rounded-2xl p-6">
                            <div className="mb-6 flex items-center justify-between">
                                <h2 className="text-lg font-bold">
                                    Divisions List
                                </h2>
                                <Button
                                    onClick={() => openDivisionDialog()}
                                    className="btn-specular gap-2 border-none px-6"
                                >
                                    <Plus className="h-4 w-4" /> Add Division
                                </Button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="border-b border-border/50 bg-muted/40 text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                                        <tr>
                                            <th className="px-6 py-4">Name</th>
                                            <th className="px-6 py-4">
                                                Status
                                            </th>
                                            <th className="px-6 py-4 text-right">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/30">
                                        {divisions.map((div) => (
                                            <tr
                                                key={div.id}
                                                className="transition-colors hover:bg-muted/40"
                                            >
                                                <td className="px-6 py-4 font-bold">
                                                    {div.name}
                                                </td>
                                                <td className="px-6 py-4 text-xs font-bold uppercase">
                                                    <span
                                                        className={cn(
                                                            'inline-flex items-center rounded-full px-2.5 py-0.5 tracking-wide shadow-sm',
                                                            div.is_active
                                                                ? 'status-badge-permanent'
                                                                : 'status-badge-unknown',
                                                        )}
                                                    >
                                                        {div.is_active
                                                            ? 'Active'
                                                            : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() =>
                                                            openDivisionDialog(
                                                                div,
                                                            )
                                                        }
                                                        className="btn-ghost-specular h-10 w-10 rounded-full border-none p-0"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                        {divisions.length === 0 && (
                                            <tr>
                                                <td
                                                    colSpan={3}
                                                    className="px-6 py-8 text-center text-muted-foreground"
                                                >
                                                    No divisions found.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </TabsContent>

                    {/* Units Tab */}
                    <TabsContent value="units">
                        <div className="matte-card elev-2 rounded-2xl p-6">
                            <div className="mb-6 flex items-center justify-between">
                                <h2 className="text-lg font-bold">
                                    Units List
                                </h2>
                                <Button
                                    onClick={() => openUnitDialog()}
                                    className="btn-specular gap-2 border-none px-6"
                                >
                                    <Plus className="h-4 w-4" /> Add Unit
                                </Button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="border-b border-border/50 bg-muted/40 text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                                        <tr>
                                            <th className="px-6 py-4">Name</th>
                                            <th className="px-6 py-4">
                                                Division
                                            </th>
                                            <th className="px-6 py-4">
                                                Status
                                            </th>
                                            <th className="px-6 py-4 text-right">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/30">
                                        {units.map((unit) => (
                                            <tr
                                                key={unit.id}
                                                className="transition-colors hover:bg-muted/40"
                                            >
                                                <td className="px-6 py-4 font-bold">
                                                    {unit.name}
                                                </td>
                                                <td className="px-6 py-4 text-muted-foreground">
                                                    {
                                                        divisions.find(
                                                            (d) =>
                                                                d.id ===
                                                                unit.division_id,
                                                        )?.name
                                                    }
                                                </td>
                                                <td className="px-6 py-4 text-xs font-bold uppercase">
                                                    <span
                                                        className={cn(
                                                            'inline-flex items-center rounded-full px-2.5 py-0.5 tracking-wide shadow-sm',
                                                            unit.is_active
                                                                ? 'status-badge-permanent'
                                                                : 'status-badge-unknown',
                                                        )}
                                                    >
                                                        {unit.is_active
                                                            ? 'Active'
                                                            : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() =>
                                                            openUnitDialog(unit)
                                                        }
                                                        className="btn-ghost-specular h-10 w-10 rounded-full border-none p-0"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                        {units.length === 0 && (
                                            <tr>
                                                <td
                                                    colSpan={4}
                                                    className="px-6 py-8 text-center text-muted-foreground"
                                                >
                                                    No units found.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </TabsContent>

                    {/* Positions Tab */}
                    <TabsContent value="positions">
                        <div className="matte-card elev-2 rounded-2xl p-6">
                            <div className="mb-6 flex items-center justify-between">
                                <h2 className="text-lg font-bold">
                                    Positions List
                                </h2>
                                <Button
                                    onClick={() => openPositionDialog()}
                                    className="btn-specular gap-2 border-none px-6"
                                >
                                    <Plus className="h-4 w-4" /> Add Position
                                </Button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="border-b border-border/50 bg-muted/40 text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                                        <tr>
                                            <th className="px-6 py-4">Name</th>
                                            <th className="px-6 py-4">
                                                Division
                                            </th>
                                            <th className="px-6 py-4">
                                                Status
                                            </th>
                                            <th className="px-6 py-4 text-right">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/30">
                                        {positions.map((pos) => (
                                            <tr
                                                key={pos.id}
                                                className="transition-colors hover:bg-muted/40"
                                            >
                                                <td className="px-6 py-4 font-bold">
                                                    {pos.name}
                                                </td>
                                                <td className="px-6 py-4 text-muted-foreground">
                                                    {
                                                        divisions.find(
                                                            (d) =>
                                                                d.id ===
                                                                pos.division_id,
                                                        )?.name
                                                    }
                                                </td>
                                                <td className="px-6 py-4 text-xs font-bold uppercase">
                                                    <span
                                                        className={cn(
                                                            'inline-flex items-center rounded-full px-2.5 py-0.5 tracking-wide shadow-sm',
                                                            pos.is_active
                                                                ? 'status-badge-permanent'
                                                                : 'status-badge-unknown',
                                                        )}
                                                    >
                                                        {pos.is_active
                                                            ? 'Active'
                                                            : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() =>
                                                            openPositionDialog(
                                                                pos,
                                                            )
                                                        }
                                                        className="btn-ghost-specular h-10 w-10 rounded-full border-none p-0"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                        {positions.length === 0 && (
                                            <tr>
                                                <td
                                                    colSpan={4}
                                                    className="px-6 py-8 text-center text-muted-foreground"
                                                >
                                                    No positions found.
                                                </td>
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
                        <DialogTitle>
                            {editingDivision ? 'Edit Division' : 'Add Division'}
                        </DialogTitle>
                    </DialogHeader>
                    <form
                        onSubmit={handleDivisionSubmit}
                        className="space-y-4 py-4"
                    >
                        <div className="space-y-2">
                            <Label>Division Name</Label>
                            <Input
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        name: e.target.value,
                                    })
                                }
                                required
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Switch
                                checked={formData.is_active}
                                onCheckedChange={(checked: boolean) =>
                                    setFormData({
                                        ...formData,
                                        is_active: checked,
                                    })
                                }
                            />
                            <Label>Active</Label>
                        </div>
                        <DialogFooter>
                            <Button
                                type="submit"
                                disabled={processing}
                                className="btn-specular"
                            >
                                Save Division
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Unit Dialog */}
            <Dialog open={isUnitOpen} onOpenChange={setIsUnitOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {editingUnit ? 'Edit Unit' : 'Add Unit'}
                        </DialogTitle>
                    </DialogHeader>
                    <form
                        onSubmit={handleUnitSubmit}
                        className="space-y-4 py-4"
                    >
                        <div className="space-y-2">
                            <Label>Unit Name</Label>
                            <Input
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        name: e.target.value,
                                    })
                                }
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Division</Label>
                            <Select
                                value={formData.division_id}
                                onValueChange={(v) =>
                                    setFormData({ ...formData, division_id: v })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Division" />
                                </SelectTrigger>
                                <SelectContent>
                                    {divisions.map((d) => (
                                        <SelectItem
                                            key={d.id}
                                            value={d.id.toString()}
                                        >
                                            {d.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center gap-2">
                            <Switch
                                checked={formData.is_active}
                                onCheckedChange={(checked: boolean) =>
                                    setFormData({
                                        ...formData,
                                        is_active: checked,
                                    })
                                }
                            />
                            <Label>Active</Label>
                        </div>
                        <DialogFooter>
                            <Button
                                type="submit"
                                disabled={processing}
                                className="btn-specular"
                            >
                                Save Unit
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Position Dialog */}
            <Dialog open={isPositionOpen} onOpenChange={setIsPositionOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {editingPosition ? 'Edit Position' : 'Add Position'}
                        </DialogTitle>
                    </DialogHeader>
                    <form
                        onSubmit={handlePositionSubmit}
                        className="space-y-4 py-4"
                    >
                        <div className="space-y-2">
                            <Label>Position Name</Label>
                            <Input
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        name: e.target.value,
                                    })
                                }
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Division</Label>
                            <Select
                                value={formData.division_id}
                                onValueChange={(v) =>
                                    setFormData({ ...formData, division_id: v })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Division" />
                                </SelectTrigger>
                                <SelectContent>
                                    {divisions.map((d) => (
                                        <SelectItem
                                            key={d.id}
                                            value={d.id.toString()}
                                        >
                                            {d.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center gap-2">
                            <Switch
                                checked={formData.is_active}
                                onCheckedChange={(checked: boolean) =>
                                    setFormData({
                                        ...formData,
                                        is_active: checked,
                                    })
                                }
                            />
                            <Label>Active</Label>
                        </div>
                        <DialogFooter>
                            <Button
                                type="submit"
                                disabled={processing}
                                className="btn-specular"
                            >
                                Save Position
                            </Button>
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
        { title: 'Organization Management', href: '#' },
    ],
};
