'use client';

import { useState, useEffect } from 'react';
import type { Standup } from '@/lib/types';

interface StandupSidebarProps {
    initialStandups: Standup[];
}

const sidebarDateFormatter = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
});

export function StandupSidebar({ initialStandups }: StandupSidebarProps) {
    const [standups, setStandups] = useState<Standup[]>(initialStandups);
    const [selectedId, setSelectedId] = useState<number | null>(
        initialStandups.length > 0 ? initialStandups[0].id : null
    );

    useEffect(() => {
        const handleStandupAdded = (event: CustomEvent<Standup>) => {
            setStandups((prev) => [event.detail, ...prev]);
            setSelectedId(event.detail.id);
        };

        const handleStandupDeleted = (event: CustomEvent<number>) => {
            setStandups((prev) => prev.filter((s) => s.id !== event.detail));
            setSelectedId((prev) => (prev === event.detail ? null : prev));
        };

        window.addEventListener('standupAdded', handleStandupAdded as EventListener);
        window.addEventListener('standupDeleted', handleStandupDeleted as EventListener);

        return () => {
            window.removeEventListener('standupAdded', handleStandupAdded as EventListener);
            window.removeEventListener('standupDeleted', handleStandupDeleted as EventListener);
        };
    }, []);

    const formatDate = (dateString: string): string => {
        return sidebarDateFormatter.format(new Date(dateString));
    };

    const getBlockerCount = (standup: Standup): number => {
        return standup.blockers ? 1 : 0;
    };

    return (
        <div className="flex flex-col flex-1 gap-2 overflow-y-auto p-3">
            {standups.length === 0 ? (
                <div className="flex items-center justify-center py-12 text-sidebar-foreground/60">
                    <p className="text-sm">No standups yet</p>
                </div>
            ) : (
                standups.map((standup) => (
                    <button
                        key={standup.id}
                        type="button"
                        onClick={() => setSelectedId(standup.id)}
                        className={`group relative w-full text-left px-4 py-3 rounded-2xl transition-colors border ${
                            selectedId === standup.id
                                ? 'bg-white/10 text-sidebar-foreground border-white/20 shadow-[0_12px_30px_-22px_rgba(90,70,255,0.7)]'
                                : 'bg-black/20 text-sidebar-foreground hover:bg-white/5 border-transparent hover:border-white/10'
                        }`}
                    >
                        <span
                            className={`absolute left-2 top-3 h-[calc(100%-1.5rem)] w-1 rounded-full ${
                                selectedId === standup.id ? 'bg-[#7a6aff]' : 'bg-transparent group-hover:bg-white/20'
                            }`}
                        />
                        <div className="text-sm font-semibold truncate">
                            {formatDate(standup.created_at)}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                            {standup.blockers && (
                                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold bg-red-500/15 text-red-400">
                  {getBlockerCount(standup)} Blocker
                </span>
                            )}
                            <span className="text-xs text-sidebar-foreground/70">
                {standup.summary.slice(0, 30)}…
              </span>
                        </div>
                    </button>
                ))
            )}
        </div>
    );
}
