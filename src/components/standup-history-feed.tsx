'use client';

import { useEffect, useId, useMemo, useState } from 'react';
import type { Standup } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface StandupHistoryFeedProps {
    initialStandups: Standup[];
    selectedId?: number;
}

const historyDateFormatter = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
});

export function StandupHistoryFeed({ initialStandups, selectedId }: StandupHistoryFeedProps) {
    const contentId = useId();
    const [standups, setStandups] = useState<Standup[]>(initialStandups);
    const [isOpen, setIsOpen] = useState(true);

    useEffect(() => {
        setStandups(initialStandups);
    }, [initialStandups]);

    useEffect(() => {
        const handleStandupAdded = (event: CustomEvent<Standup>) => {
            setStandups((prev) => [event.detail, ...prev]);
        };

        const handleStandupDeleted = (event: CustomEvent<number>) => {
            setStandups((prev) => prev.filter((s) => s.id !== event.detail));
        };

        window.addEventListener('standupAdded', handleStandupAdded as EventListener);
        window.addEventListener('standupDeleted', handleStandupDeleted as EventListener);

        return () => {
            window.removeEventListener('standupAdded', handleStandupAdded as EventListener);
            window.removeEventListener('standupDeleted', handleStandupDeleted as EventListener);
        };
    }, []);

    const headerText = useMemo(() => {
        return standups.length > 0 ? `History Feed (${standups.length})` : 'History Feed';
    }, [standups.length]);

    return (
        <Card className="border-white/10 bg-black/35 shadow-[0_20px_60px_-40px_rgba(90,70,255,0.6)] backdrop-blur-xl">
            <button
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                aria-expanded={isOpen}
                aria-controls={contentId}
                className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7a6aff]/60"
            >
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {headerText}
                </span>
                {isOpen ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                )}
            </button>
            {isOpen && (
                <div id={contentId} className="border-t border-white/10 bg-white/5 px-4 py-3">
                    {standups.length === 0 ? (
                        <p className="text-sm text-muted-foreground italic">No history available yet.</p>
                    ) : (
                        <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
                            {standups.map((standup) => {
                                const isSelected = selectedId === standup.id;
                                return (
                                    <div
                                        key={standup.id}
                                        className={`group relative rounded-2xl border p-4 transition-colors ${
                                            isSelected
                                                ? 'border-white/20 bg-white/10'
                                                : 'border-white/10 bg-black/20 hover:bg-black/30'
                                        }`}
                                    >
                                        <span
                                            className={`absolute left-2 top-3 h-[calc(100%-1.5rem)] w-1 rounded-full ${
                                                isSelected ? 'bg-[#7a6aff]' : 'bg-transparent group-hover:bg-white/20'
                                            }`}
                                        />
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="text-xs font-semibold text-muted-foreground">
                                                {historyDateFormatter.format(new Date(standup.created_at))}
                                            </div>
                                            {standup.blockers && (
                                                <span className="inline-flex items-center rounded-md bg-destructive/10 px-2 py-1 text-xs font-semibold text-destructive">
                                                    Blocker
                                                </span>
                                            )}
                                        </div>
                                        <p className="mt-2 text-sm text-foreground leading-relaxed break-words">
                                            {standup.summary}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </Card>
    );
}
