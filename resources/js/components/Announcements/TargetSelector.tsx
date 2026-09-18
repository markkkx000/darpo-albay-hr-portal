import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface Props {
    targetType: string;
    targetId: string | number | null;
    onTargetTypeChange: (value: string) => void;
    onTargetIdChange: (value: string) => void;
    divisions: { id: number; name: string }[];
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
    divisions,
    positions,
    users,
    error,
    targetIdError,
}: Props) {
    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
                <label className="text-sm font-medium">Target Audience</label>
                <Select value={targetType} onValueChange={onTargetTypeChange}>
                    <SelectTrigger
                        className={cn(error && 'border-destructive')}
                    >
                        <SelectValue placeholder="Select audience type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Everyone</SelectItem>
                        <SelectItem value="division">
                            Specific Division
                        </SelectItem>
                        <SelectItem value="position">
                            Specific Position
                        </SelectItem>
                        <SelectItem value="user">Specific Employee</SelectItem>
                    </SelectContent>
                </Select>
                {error && <p className="text-xs text-destructive">{error}</p>}
            </div>

            {targetType !== 'all' && (
                <div className="space-y-2">
                    <label className="text-sm font-medium">
                        {targetType === 'division' && 'Select Division'}
                        {targetType === 'position' && 'Select Position'}
                        {targetType === 'user' && 'Select Employee'}
                    </label>
                    <Select
                        value={targetId ? targetId.toString() : undefined}
                        onValueChange={onTargetIdChange}
                    >
                        <SelectTrigger
                            className={cn(
                                targetIdError && 'border-destructive',
                            )}
                        >
                            <SelectValue placeholder={`Select ${targetType}`} />
                        </SelectTrigger>
                        <SelectContent>
                            {targetType === 'division' &&
                                divisions.map((div) => (
                                    <SelectItem
                                        key={div.id}
                                        value={div.id.toString()}
                                    >
                                        {div.name}
                                    </SelectItem>
                                ))}
                            {targetType === 'position' &&
                                positions.map((pos) => (
                                    <SelectItem
                                        key={pos.id}
                                        value={pos.id.toString()}
                                    >
                                        {pos.name}
                                    </SelectItem>
                                ))}
                            {targetType === 'user' &&
                                users.map((user) => (
                                    <SelectItem
                                        key={user.id}
                                        value={user.id.toString()}
                                    >
                                        {user.name}
                                    </SelectItem>
                                ))}
                        </SelectContent>
                    </Select>
                    {targetIdError && (
                        <p className="text-xs text-destructive">
                            {targetIdError}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}
