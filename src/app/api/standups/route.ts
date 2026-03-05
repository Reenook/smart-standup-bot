import { generateText, Output } from 'ai';
import { google } from '@ai-sdk/google';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import type { Standup, StandupInput, StandupResponse } from '@/lib/types';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!
);

const standupSchema = z.object({
    whatDone: z.string(),
    whatNext: z.string(),
    blockers: z.string().nullable(),
    summary: z.string(),
});

const CHUNKING_THRESHOLD = 3000;
const PROMPT_CHUNK_SIZE = 2200;
const PROMPT_CHUNK_OVERLAP = 80;
const MAX_CHUNKS = 3;

function normalizeStandupInput(input: string): string {
    return input.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
}

function chunkStandupInput(input: string): string[] {
    if (input.length <= CHUNKING_THRESHOLD) {
        return [input];
    }

    const chunks: string[] = [];
    let start = 0;

    while (start < input.length && chunks.length < MAX_CHUNKS) {
        const maxEnd = Math.min(start + PROMPT_CHUNK_SIZE, input.length);
        let end = maxEnd;

        if (maxEnd < input.length) {
            const windowText = input.slice(start, maxEnd);
            const breakAt = Math.max(windowText.lastIndexOf('\n\n'), windowText.lastIndexOf('. '));
            if (breakAt > PROMPT_CHUNK_SIZE * 0.5) {
                end = start + breakAt + (windowText[breakAt] === '.' ? 1 : 0);
            }
        }

        chunks.push(input.slice(start, end).trim());
        if (end >= input.length) {
            break;
        }

        start = Math.max(0, end - PROMPT_CHUNK_OVERLAP);
    }

    return chunks.filter(Boolean);
}

function buildStandupPrompt(rawInput: string): string {
    const normalized = normalizeStandupInput(rawInput);
    const chunks = chunkStandupInput(normalized);

    if (chunks.length === 1) {
        return `Parse this standup:\n\n${chunks[0]}`;
    }

    const truncated = chunks.length === MAX_CHUNKS && normalized.length > chunks.join('').length;
    const serializedChunks = chunks
        .map((chunk, index) => `[Chunk ${index + 1}/${chunks.length}]\n${chunk}`)
        .join('\n\n');

    return `Parse this standup. The input is split into chunks; combine all chunks before producing the final output.${truncated ? ' Input was trimmed to keep processing fast.' : ''}\n\n${serializedChunks}`;
}

export async function POST(req: Request): Promise<Response> {
    try {
        const body = await req.json() as StandupInput;
        const { rawInput } = body;

        if (!rawInput || typeof rawInput !== 'string') {
            return Response.json(
                { success: false, error: 'rawInput is required and must be a string' } satisfies StandupResponse,
                { status: 400 }
            );
        }

        // Use Gemini via AI SDK to parse and summarize standup
        const result = await generateText({
            model: google('gemini-3-flash-preview'),
            system: `You are a standup formatter. Parse the user's standup input and extract/summarize the data:
1. What they accomplished (what_done)
2. What they plan to do, also give them helpful suggestions that may help in the process (what_next)
3. Any blockers (blockers)
4. A clean detailed executive summary (summary)
Be concise but comprehensive. Format as JSON. Avoid Jargon`,
            prompt: buildStandupPrompt(rawInput),
            output: Output.object({
                schema: standupSchema,
            }),
        });

        const parsed = result.output;
        if (!parsed) {
            return Response.json(
                { success: false, error: 'AI output was empty' } satisfies StandupResponse,
                { status: 502 }
            );
        }

        // Save to Supabase
        const { data, error } = await supabase
            .from('standups')
            .insert([
                {
                    raw_input: rawInput,
                    what_done: parsed.whatDone,
                    what_next: parsed.whatNext,
                    blockers: parsed.blockers,
                    summary: parsed.summary,
                },
            ])
            .select()
            .single();

        if (error) {
            return Response.json(
                { success: false, error: error.message } satisfies StandupResponse,
                { status: 500 }
            );
        }

        return Response.json(
            { success: true, data: data as Standup } satisfies StandupResponse,
            { status: 201 }
        );
    } catch {
        return Response.json(
            { success: false, error: 'Failed to process standup' } satisfies StandupResponse,
            { status: 500 }
        );
    }
}

export async function GET(): Promise<Response> {
    try {
        const { data, error } = await supabase
            .from('standups')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            return Response.json(
                { success: false, error: error.message } satisfies StandupResponse,
                { status: 500 }
            );
        }

        return Response.json(data as Standup[] || []);
    } catch {
        return Response.json(
            { success: false, error: 'Failed to fetch standups' } satisfies StandupResponse,
            { status: 500 }
        );
    }
}

export async function DELETE(req: Request): Promise<Response> {
    try {
        const body = await req.json() as { id: number };
        const { id } = body;

        if (!id || typeof id !== 'number') {
            return Response.json(
                { success: false, error: 'id is required and must be a number' } satisfies StandupResponse,
                { status: 400 }
            );
        }

        const { error } = await supabase
            .from('standups')
            .delete()
            .eq('id', id);

        if (error) {
            return Response.json(
                { success: false, error: error.message } satisfies StandupResponse,
                { status: 500 }
            );
        }

        return Response.json({ success: true } satisfies StandupResponse);
    } catch {
        return Response.json(
            { success: false, error: 'Failed to delete standup' } satisfies StandupResponse,
            { status: 500 }
        );
    }
}

