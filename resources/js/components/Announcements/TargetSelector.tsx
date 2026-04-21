import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface Props {
    targetType: string;
    targetId: string | number | null;
    onTargetTypeChange: (value: string) => void;
    onTargetIdChange: (value: string) => void;
    departments: { id: number; name: string }[];
    positions: { id: number; name: string }[];
    users: { id: number; name: string }[];
    error?: string;
    targetIdError?: string;
}

export function TargetSelector({
    targetType,
    targetId,
    onTargetTypeChange,
    onTargetIdChange,
    departments,
    positions,
    users,
    error,
    targetIdError,
}: Props) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
                <label className="text-sm font-medium">Target Audience</label>
                <Select value={targetType} onValueChange={onTargetTypeChange}>
                    <SelectTrigger className={cn(error && "border-destructive")}>
                        <SelectValue placeholder="Select audience type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Everyone</SelectItem>
                        <SelectItem value="department">Specific Department</SelectItem>
                        <SelectItem value="position">Specific Position</SelectItem>
                        <SelectItem value="user">Specific Employee</SelectItem>
                    </SelectContent>
                </Select>
                {error && <p className="text-xs text-destructive">{error}</p>}
            </div>

            {targetType !== 'all' && (
                <div className="space-y-2">
                    <label className="text-sm font-medium">
                        {targetType === 'department' && 'Select Department'}
                        {targetType === 'position' && 'Select Position'}
                        {targetType === 'user' && 'Select Employee'}
                    </label>
                    <Select 
                        value={targetId ? targetId.toString() : undefined} 
                        onValueChange={onTargetIdChange}
                    >
                        <SelectTrigger className={cn(targetIdError && "border-destructive")}>
                            <SelectValue placeholder={`Select ${targetType}`} />
                        </SelectTrigger>
                        <SelectContent>
                            {targetType === 'department' && departments.map((dept) => (
                                <SelectItem key={dept.id} value={dept.id.toString()}>
                                    {dept.name}
                                </SelectItem>
                            ))}
                            {targetType === 'position' && positions.map((pos) => (
                                <SelectItem key={pos.id} value={pos.id.toString()}>
                                    {pos.name}
                                </SelectItem>
                            ))}
                            {targetType === 'user' && users.map((user) => (
                                <SelectItem key={user.id} value={user.id.toString()}>
                                    {user.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {targetIdError && <p className="text-xs text-destructive">{targetIdError}</p>}
                </div>
            )}
        </div>
    );
}
