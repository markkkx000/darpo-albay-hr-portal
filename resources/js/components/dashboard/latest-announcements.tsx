export function LatestAnnouncements({ announcements }: { announcements: any[] }) {
    return (
        <div className="matte-card elev-2 flex flex-col flex-1 min-h-[300px]">
            <div className="p-5 border-b border-border-1">
                <h3 className="text-lg font-bold">Latest Announcements</h3>
            </div>
            <div className="p-5 overflow-y-auto max-h-[300px]">
                {!announcements || announcements.length === 0 ? (
                    <div className="text-sm text-muted-foreground min-h-[200px] flex items-center justify-center">No recent announcements.</div>
                ) : (
                    <div className="space-y-4">
                        {announcements.map((ann: any) => (
                            <div key={ann.id}>
                                <div className="text-sm font-semibold truncate">{ann.title}</div>
                                <div className="text-[10px] text-muted-foreground mt-0.5">Posted by {ann.author} • {ann.date}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
