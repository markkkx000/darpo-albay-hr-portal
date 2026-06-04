import { usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import type { PageProps } from '@/types';

export function ServerClock() {
    const { server_time } = usePage<PageProps & { server_time: string }>().props;
    
    // Default to current local time if server_time is missing
    const [currentTime, setCurrentTime] = useState<Date>(
        server_time ? new Date(server_time) : new Date()
    );

    useEffect(() => {
        // Tick every second
        const intervalId = setInterval(() => {
            setCurrentTime((prevTime) => new Date(prevTime.getTime() + 1000));
        }, 1000);

        return () => clearInterval(intervalId);
    }, [server_time]); // re-run if server_time prop changes (e.g., via page navigation)

    // Format: "May 24, 2026 • 08:38 PM (PHT)"
    // We'll extract the pieces manually since standard toLocaleString doesn't output this exact format reliably
    
    const formatterDate = new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
    
    const formatterTime = new Intl.DateTimeFormat('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
    
    // Get timezone abbreviation (e.g. PHT)
    // Note: This relies on the browser's local timezone configuration, 
    // but the actual time is synced to the server time.
    const formatterZone = new Intl.DateTimeFormat('en-US', {
        timeZoneName: 'short'
    });

    const dateStr = formatterDate.format(currentTime);
    const timeStr = formatterTime.format(currentTime);
    
    // Extract just the timezone abbreviation
    const parts = formatterZone.formatToParts(currentTime);
    const tzPart = parts.find(p => p.type === 'timeZoneName');
    const tzStr = tzPart ? tzPart.value : 'UTC';

    return (
        <div className="hidden md:flex items-center text-[13px] font-medium text-muted-foreground tracking-wide mr-4">
            <span className="hidden lg:inline">{dateStr}</span>
            <span className="hidden lg:inline mx-1.5">•</span>
            <span className="tabular-nums">{timeStr}</span>
            <span className="ml-1 text-[11px] opacity-70">({tzStr})</span>
        </div>
    );
}
