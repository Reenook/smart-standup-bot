import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

export const updateSession = async (request: NextRequest) => {
    // 1. Create an initial response
    let supabaseResponse = NextResponse.next({
        request: {
            headers: request.headers,
        },
    });

    // 2. Initialize the Supabase client
    const supabase = createServerClient(
        supabaseUrl!,
        supabaseKey!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    // Update the request cookies so the rest of the app sees them
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));

                    // Create a new response to reflect the new cookies
                    supabaseResponse = NextResponse.next({
                        request,
                    });

                    // Set the cookies on the outgoing response
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    );
                },
            },
        },
    );

    // 3. IMPORTANT: You must call a Supabase method (like getUser) 
    // to trigger the setAll logic if the session needs refreshing.
    const { data: { user } } = await supabase.auth.getUser();

    // 4. Return both the response (to be returned by middleware.ts) 
    // and the user/supabase client if you need them for protected routes.
    return { supabaseResponse, user };
};