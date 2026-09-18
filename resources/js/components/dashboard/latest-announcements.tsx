export function LatestAnnouncements({
    announcements,
}: {
    announcements: any[];
}) {
    return (
        <div className="matte-card elev-2 flex min-h-[300px] flex-1 flex-col">
            <div className="border-b border-border-1 p-5">
                <h3 className="text-lg font-bold">Latest Announcements</h3>
            </div>
            <div className="max-h-[300px] overflow-y-auto p-5">
                {!announcements || announcements.length === 0 ? (
                    <div className="flex min-h-[200px] items-center justify-center text-sm text-muted-foreground">
                        No recent announcements.
                    </div>
                ) : (
                    <div className="space-y-4">
                        {announcements.map((ann: any) => (
                            <div key={ann.id}>
                                <div className="truncate text-sm font-semibold">
                                    {ann.title}
                                </div>
                                <div className="mt-0.5 text-[10px] text-muted-foreground">
                                    Posted by {ann.author} • {ann.date}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
