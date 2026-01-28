"use client";

import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { Sidebar } from "@/components/layout/sidebar";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store";

export function MainLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isLoginPage = pathname === "/login";
    const { isSidebarOpen, toggleSidebar } = useAppStore();

    if (isLoginPage) {
        return <>{children}</>;
    }

    return (
        <>
            <Sidebar />

            {!isSidebarOpen && (
                <button
                    onClick={toggleSidebar}
                    className="fixed left-4 top-4 z-50 rounded-lg bg-white/80 p-2 shadow-sm backdrop-blur-sm transition-all hover:bg-white dark:bg-neutral-800/80 dark:hover:bg-neutral-800"
                >
                    <Menu className="h-5 w-5 text-muted-foreground" />
                </button>
            )}

            <main
                className={cn(
                    "min-h-screen transition-all duration-300 ease-in-out flex flex-col",
                    isSidebarOpen ? "sm:ml-48" : "ml-0"
                )}
            >
                <div className="flex-1 animate-in fade-in slide-in-from-bottom-4 duration-700 w-full">
                    {children}
                </div>
            </main>
        </>
    );
}
