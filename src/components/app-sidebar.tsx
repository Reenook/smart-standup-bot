'use client';

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
    Plus,
    BadgeCheck,
    Calendar,
    ChevronsUpDown,
    LogOut,
    MoreHorizontal,
    Sparkles,
    Terminal,
    Trash2,
} from "lucide-react";

import {
    Avatar,
    AvatarFallback,
} from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuAction,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
    useSidebar,
} from "@/components/ui/sidebar";
import type { Standup } from '@/lib/types';

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
    initialStandups: Standup[];
}

export function AppSidebar({ initialStandups, ...props }: AppSidebarProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { isMobile } = useSidebar();

    const selectedId = searchParams.get("id");
    const [standups, setStandups] = React.useState<Standup[]>(initialStandups);

    React.useEffect(() => {
        setStandups(initialStandups);
    }, [initialStandups]);

    const handleSelect = React.useCallback((id: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("id", id.toString());
        router.push(`?${params.toString()}`);
    }, [router, searchParams]);

    const handleCreateNew = React.useCallback(() => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete("id");
        const nextQuery = params.toString();
        router.push(nextQuery ? `?${nextQuery}` : "/");
    }, [router, searchParams]);

    // Listen for new standups
    React.useEffect(() => {
        const handleStandupAdded = (event: CustomEvent<Standup>) => {
            setStandups((prev) => [event.detail, ...prev]);
            handleSelect(event.detail.id);
        };
        const handleStandupDeleted = (event: CustomEvent<number>) => {
            setStandups((prev) => prev.filter((standup) => standup.id !== event.detail));
        };
        window.addEventListener('standupAdded', handleStandupAdded as EventListener);
        window.addEventListener('standupDeleted', handleStandupDeleted as EventListener);
        return () => {
            window.removeEventListener('standupAdded', handleStandupAdded as EventListener);
            window.removeEventListener('standupDeleted', handleStandupDeleted as EventListener);
        };
    }, [handleSelect]);

    return (
        <Sidebar
            collapsible="icon"
            variant="inset"
            className="border-white/10 bg-white/5 backdrop-blur-2xl shadow-[0_25px_80px_-50px_rgba(90,70,255,0.8)]"
            {...props}
        >
            {/* 1. HEADER: Team/App Switcher Style */}
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-white/10 hover:bg-white/5"
                        >
                            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-white/10 text-white">
                                <Terminal className="size-4" />
                            </div>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-semibold">Standup Bot</span>
                                <span className="truncate text-xs text-muted-foreground">Enterprise AI</span>
                            </div>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            {/* 2. CONTENT: History Section (Styled like NavProjects) */}
            <SidebarContent>
                <SidebarGroup>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                onClick={handleCreateNew}
                                isActive={!selectedId}
                                className="rounded-2xl border border-white/10 bg-white/5 data-[active=true]:bg-white/10 data-[active=true]:text-white hover:bg-white/10"
                            >
                                <Plus className="size-4" />
                                <span>Add New Standup</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarGroup>
                <SidebarGroup>
                    <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        History
                    </SidebarGroupLabel>
                    <SidebarMenu>
                        {standups.map((standup) => (
                            <SidebarMenuItem key={standup.id}>
                                <SidebarMenuButton
                                    isActive={selectedId === standup.id.toString()}
                                    onClick={() => handleSelect(standup.id)}
                                    tooltip={standup.summary}
                                    className="rounded-2xl data-[active=true]:bg-white/10 data-[active=true]:text-white hover:bg-white/5"
                                >
                                    <Calendar className="size-4" />
                                    <span className="truncate">{standup.what_done}</span>
                                </SidebarMenuButton>

                                {/* Optional: Action menu for each item */}
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <SidebarMenuAction showOnHover aria-label={`Entry actions for standup ${standup.id}`}>
                                            <MoreHorizontal />
                                        </SidebarMenuAction>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent side={isMobile ? "bottom" : "right"} align={isMobile ? "end" : "start"}>
                                        <DropdownMenuItem className="text-destructive">
                                            <Trash2 className="size-4 mr-2" />
                                            Delete Entry
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>

            {/* 3. FOOTER: User Profile Style */}
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                            <SidebarMenuButton size="lg" className="data-[state=open]:bg-white/10 hover:bg-white/5">
                                <Avatar className="h-8 w-8 rounded-lg">
                                    <AvatarFallback className="rounded-lg">SB</AvatarFallback>
                                </Avatar>
                                    <div className="grid flex-1 text-left text-sm leading-tight">
                                        <span className="truncate font-medium">User Name</span>
                                        <span className="truncate text-xs">user@example.com</span>
                                    </div>
                                    <ChevronsUpDown className="ml-auto size-4" />
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" side="right" align="end">
                                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem><Sparkles className="mr-2 size-4" /> Upgrade</DropdownMenuItem>
                                <DropdownMenuItem><BadgeCheck className="mr-2 size-4" /> Account</DropdownMenuItem>
                                <DropdownMenuItem><LogOut className="mr-2 size-4" /> Log out</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>

            <SidebarRail />
        </Sidebar>
    );
}
