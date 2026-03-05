'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Trash2 } from 'lucide-react';

interface Standup {
    id: number;
    what_done: string;
    what_next: string;
    blockers: string | null;
    summary: string;
    created_at: string;
}

interface StandupCardProps {
    standup: Standup;
    onDelete: (id: number) => void;
}

export function StandupCard({ standup, onDelete }: StandupCardProps) {
    const [deleting, setDeleting] = useState(false);

    const handleDelete = async () => {
        setDeleting(true);

        try {
            const response = await fetch('/api/standups', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: standup.id }),
            });

            if (!response.ok) {
                throw new Error('Failed to delete standup');
            }

            onDelete(standup.id);
        } catch (error) {
            console.error(error);
        } finally {
            setDeleting(false);
        }
    };

    const formattedDate = new Date(standup.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });

    return (
        <Card className="overflow-hidden border-white/10 bg-black/35 shadow-[0_20px_60px_-40px_rgba(90,70,255,0.6)] backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-white/10 bg-white/5 px-6 py-3">
                <time className="text-sm font-semibold text-foreground">{formattedDate}</time>
                <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={handleDelete}
                    disabled={deleting}
                    className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                    aria-label="Delete standup"
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>

            <div className="space-y-6 p-6">
                <div>
                    <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Summary</h3>
                    <p className="text-base leading-relaxed text-foreground whitespace-pre-wrap break-words">{standup.summary}</p>
                </div>

                <div>
                    <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Accomplished</h3>
                    <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap break-words">{standup.what_done}</p>
                </div>

                <div>
                    <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Next Up</h3>
                    <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap break-words">{standup.what_next}</p>
                </div>

                {standup.blockers && (
                    <div>
                        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-destructive">Blockers</h3>
                        <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap break-words">{standup.blockers}</p>
                    </div>
                )}
            </div>
        </Card>
    );
}
