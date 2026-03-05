'use client';

import { useId, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import type { StandupResponse, Standup } from '@/lib/types';

export function StandupFormContainer() {
    const fieldId = useId();
    const errorId = useId();
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!input.trim()) {
            setError('Please enter your standup');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('/api/standups', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rawInput: input }),
            });

            if (!response.ok) {
                const errorData = await response.json() as StandupResponse;
                throw new Error(errorData.error || 'Failed to submit standup');
            }

            const data = await response.json() as StandupResponse;

            if (data.success && data.data) {
                // Emit custom event to update sidebar and detail view
                window.dispatchEvent(
                    new CustomEvent('standupAdded', { detail: data.data as Standup })
                );
                setInput('');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4" aria-busy={loading}>
            <div className="space-y-2">
                <label htmlFor={fieldId} className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Daily Standup
                </label>
                <Textarea
                    id={fieldId}
                    name="dailyStandup"
                    autoComplete="off"
                    placeholder="What did you accomplish today? What is next? Any blockers?…"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={loading}
                    aria-invalid={Boolean(error)}
                    aria-describedby={error ? errorId : undefined}
                    className="min-h-32 resize-none border-white/10 bg-black/30 text-foreground placeholder:text-muted-foreground/70 focus-visible:ring-2 focus-visible:ring-[#7a6aff]/60"
                />
            </div>

            {error && (
                <div
                    id={errorId}
                    role="alert"
                    aria-live="polite"
                    className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive"
                >
                    {error}
                </div>
            )}

            <Button
                type="submit"
                disabled={loading}
                className="w-full rounded-sm bg-[#6c5ce7] text-white hover:bg-[#7a6aff] hover:text-white shadow-[0_12px_30px_-15px_rgba(108,92,231,0.9)] ring-1 ring-white/10 transition-transform active:translate-y-[1px] active:shadow-[0_6px_18px_-10px_rgba(108,92,231,0.9)]"
            >
                {loading ? (
                    <span className="inline-flex items-center gap-2">
                        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Processing…
                    </span>
                ) : (
                    'Submit Standup'
                )}
            </Button>
        </form>
    );
}
