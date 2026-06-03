
import type { LucideIcon } from 'lucide-react';
import { Monitor, Moon, Sun } from 'lucide-react';

import { SlidingTabs  } from '@/components/ui/sliding-tabs';
import type {SlidingTab} from '@/components/ui/sliding-tabs';
import { useAppearance  } from '@/hooks/use-appearance';
import type {Appearance} from '@/hooks/use-appearance';

export default function AppearanceToggleTab({
    className = '',
}: { className?: string }) {
    const { appearance, updateAppearance } = useAppearance();

    const tabs: { value: Appearance; icon: LucideIcon; label: string }[] = [
        { value: 'light', icon: Sun, label: 'Light' },
        { value: 'dark', icon: Moon, label: 'Dark' },
        { value: 'system', icon: Monitor, label: 'System' },
    ];

    const slidingTabs: SlidingTab[] = tabs.map(tab => ({
        ...tab,
        active: appearance === tab.value,
    }));

    return (
        <SlidingTabs
            tabs={slidingTabs}
            layoutId="appearance-active"
            onChange={(val) => updateAppearance(val as Appearance)}
            className={className}
        />
    );
}
