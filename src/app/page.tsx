import { createClient } from "@supabase/supabase-js";
import { StandupFormContainer } from '@/components/standup-form-container';
import { StandupDetail } from '@/components/standup-detail';
import { StandupHistoryFeed } from '@/components/standup-history-feed';
import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import type { Standup } from '@/lib/types';

const headerDateFormatter = new Intl.DateTimeFormat('en-US');

async function getStandups(): Promise<Standup[]> {
  const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!
  );

  const { data, error } = await supabase
      .from('standups')
      .select('*')
      .order('created_at', { ascending: false });

  if (error) {
    console.error("Supabase error:", error);
    return [];
  }

  return data || [];
}


export default async function Home({
                                     searchParams,
                                   }: {
  searchParams: Promise<{ id?: string }>;
}) {
  const standups = await getStandups();
  const { id } = await searchParams;

  // Logic to find the selected standup based on the URL ID
  // Default to the first (latest) standup if no ID is provided
  const selectedStandup = id
      ? standups.find((s) => s.id.toString() === id)
      : standups[0];

  return (
      <SidebarProvider>
        <AppSidebar initialStandups={standups} />
        <SidebarInset>
          {/* Top Header with the Toggle Button and Context Title */}
          <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border/60 bg-background/20 px-4 backdrop-blur-xl">
            <SidebarTrigger className="" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <div className="flex flex-1 items-center justify-between gap-4">
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-foreground">Standup Dashboard</span>
                <span className="text-xs text-muted-foreground">
                  Track daily updates, summaries, and blockers in one place.
                </span>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold text-muted-foreground">
                {selectedStandup
                  ? `Update from ${headerDateFormatter.format(new Date(selectedStandup.created_at))}`
                  : "No updates yet"}
              </div>
            </div>
          </header>

          {/* Main Content Body */}
          <main className="flex flex-1 flex-col gap-6 p-4 lg:p-6">
            <div className="mx-auto w-full max-w-7xl px-0 lg:px-0 space-y-4">
              <div className="rounded-3xl border border-white/10 bg-black/40 shadow-[0_25px_90px_-50px_rgba(90,70,255,0.7)] backdrop-blur-xl">
              <div className="grid gap-0 lg:grid-cols-2 lg:divide-x lg:divide-white/10">
                {/* Input Section */}
                <section className="space-y-3 p-4">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Post a Standup</h2>
                    <div className="mt-4">
                      <StandupFormContainer />
                    </div>
                  </div>
                  <StandupHistoryFeed initialStandups={standups} selectedId={selectedStandup?.id} />
                </section>

                {/* AI Summary Section */}
                <section className="space-y-3 p-4">
                  {selectedStandup ? (
                      <StandupDetail selectedStandup={selectedStandup} />
                  ) : (
                    <p className="text-muted-foreground italic">No history available yet.</p>
                  )}
                </section>
              </div>
              </div>
            </div>
          </main>
        </SidebarInset>
      </SidebarProvider>
  );
}
