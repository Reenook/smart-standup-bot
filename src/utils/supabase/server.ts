import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

// Define the resolved type for the cookie store
type CookieStore = Awaited<ReturnType<typeof cookies>>;

export const createClient = (cookieStore: CookieStore) => {
    return createServerClient(
        supabaseUrl!,
        supabaseKey!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        );
                    } catch {
                        // This catch is standard for Next.js Server Components
                        // where setting cookies isn't possible after headers are sent.
                    }
                },
            },
        },
    );
};