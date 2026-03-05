'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Standup } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle2, Trash2, TriangleAlert } from 'lucide-react';

interface StandupDetailProps {
    selectedStandup: Standup;
}

const detailDateFormatter = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
});

export function StandupDetail({ selectedStandup }: StandupDetailProps) {
    const router = useRouter();
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleDelete = async () => {
        if (!window.confirm('Delete this standup entry? This cannot be undone.')) {
            return;
        }

        setError(null);
        setDeleting(true);

        try {
            const response = await fetch('/api/standups', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: selectedStandup.id }),
            });

            if (!response.ok) {
                throw new Error('Failed to delete');
            }

            window.dispatchEvent(new CustomEvent('standupDeleted', { detail: selectedStandup.id }));
            router.push('/');
            router.refresh();
        } catch (deleteError) {
            console.error(deleteError);
            setError('Could not delete this standup. Please try again.');
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
                <div>
                    <h1 className="text-2xl font-semibold text-foreground">Standup #{selectedStandup.id}</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {detailDateFormatter.format(new Date(selectedStandup.created_at))}
                    </p>
                </div>
                <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={handleDelete}
                    disabled={deleting}
                    className="text-destructive hover:bg-destructive/10"
                >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                </Button>
            </div>

            {error && (
                <div role="alert" aria-live="polite" className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
                    {error}
                </div>
            )}

            <Card className="overflow-hidden border-white/10 bg-black/35 p-0 shadow-[0_20px_60px_-40px_rgba(90,70,255,0.6)] backdrop-blur-xl">
                <div className="flex items-center justify-between border-b border-white/10 bg-white/5 px-5 py-3">
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Summary</h2>
                </div>
                <div className="px-5 py-4">
                    <p className="whitespace-pre-wrap break-words text-base leading-relaxed text-foreground">{selectedStandup.summary}</p>
                </div>
            </Card>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <Card className="overflow-hidden border-white/10 bg-black/30 shadow-[0_16px_50px_-40px_rgba(90,70,255,0.5)] backdrop-blur-xl">
                    <div className="border-b border-white/10 bg-white/5 px-5 py-3">
                        <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                            Accomplished
                        </h2>
                    </div>
                    <div className="px-5 py-4">
                        <p className="whitespace-pre-wrap break-words leading-relaxed text-foreground">{selectedStandup.what_done}</p>
                    </div>
                </Card>

                <Card className="overflow-hidden border-white/10 bg-black/30 shadow-[0_16px_50px_-40px_rgba(90,70,255,0.5)] backdrop-blur-xl">
                    <div className="border-b border-white/10 bg-white/5 px-5 py-3">
                        <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            <ArrowRight className="h-4 w-4" aria-hidden="true" />
                            Next Up
                        </h2>
                    </div>
                    <div className="px-5 py-4">
                        <p className="whitespace-pre-wrap break-words leading-relaxed text-foreground">{selectedStandup.what_next}</p>
                    </div>
                </Card>

                {selectedStandup.blockers && (
                    <div className="md:col-span-2">
                        <Card className="overflow-hidden border-destructive/40 bg-destructive/10 shadow-[0_18px_60px_-40px_rgba(255,80,80,0.5)] backdrop-blur-xl">
                            <div className="border-b border-destructive/40 bg-destructive/10 px-5 py-3">
                                <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-destructive">
                                    <TriangleAlert className="h-4 w-4" aria-hidden="true" />
                                    Blockers
                                </h2>
                            </div>
                            <div className="px-5 py-4">
                                <p className="whitespace-pre-wrap break-words leading-relaxed text-foreground">{selectedStandup.blockers}</p>
                            </div>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
}
