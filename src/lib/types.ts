export interface Standup {
    id: number;
    what_done: string;
    what_next: string;
    blockers: string | null;
    summary: string;
    created_at: string;
}

export interface StandupInput {
    rawInput: string;
}

export interface StandupResponse {
    success: boolean;
    error?: string;
    data?: Standup;
}
