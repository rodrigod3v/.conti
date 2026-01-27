"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, FolderOpen, Settings, Plug, LogOut, Home, Table2, ChevronLeft } from "lucide-react";

const sidebarItems = [
    {
        title: "Home",
        href: "/",
        icon: Home,
    },
    {
        title: "Editor",
        href: "/editor",
        icon: Table2,
    },
    {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        title: "Configurações",
        href: "/settings",
        icon: Settings,
    },
    {
        title: "Integrações",
        href: "/integrations",
        icon: Plug,
    },
];

import { useAppStore } from "@/lib/store";

export function Sidebar() {
    const pathname = usePathname();
    const { fileData, isSidebarOpen, toggleSidebar } = useAppStore();

    const mainItems = sidebarItems.filter(item => ["Home", "Editor", "Dashboard"].includes(item.title));
    const systemItems = sidebarItems.filter(item => ["Configurações", "Integrações"].includes(item.title));

    const displayedMainItems = mainItems.filter(item => {
        if (item.title === "Editor" || item.title === "Dashboard") {
            return fileData && fileData.length > 0;
        }
        return true;
    });

    return (
        <aside
            className={cn(
                "fixed left-0 top-0 z-40 h-screen w-48 border-r bg-card transition-transform duration-300 ease-in-out",
                !isSidebarOpen && "-translate-x-full"
            )}
        >
            <div className="flex h-full flex-col px-3 py-4">
                <div className="mb-10 flex items-center justify-between pl-4 pt-2">
                    <div className="logo-text flex items-baseline text-xl font-extrabold">
                        <span className="text-action-orange">.</span>
                        <span className="text-deep-blue dark:text-white">conti</span>
                    </div>
                    <button
                        onClick={toggleSidebar}
                        className="mr-2 rounded-lg p-1 text-muted-foreground hover:bg-muted"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                </div>

                <ul className="space-y-1 font-medium">
                    {displayedMainItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    className={cn(
                                        "flex items-center rounded-lg p-2 text-sm text-muted-foreground hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950 dark:hover:text-emerald-400 group transition-all",
                                        isActive && "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
                                    )}
                                >
                                    <item.icon className="h-4 w-4 flex-shrink-0 transition duration-75" />
                                    <span className="ml-3">{item.title}</span>
                                </Link>
                            </li>
                        );
                    })}

                    <li className="my-2 border-t mx-2 opacity-50" />

                    {systemItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    className={cn(
                                        "flex items-center rounded-lg p-2 text-sm text-muted-foreground hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950 dark:hover:text-emerald-400 group transition-all",
                                        isActive && "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
                                    )}
                                >
                                    <item.icon className="h-4 w-4 flex-shrink-0 transition duration-75" />
                                    <span className="ml-3">{item.title}</span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>

                <div className="mt-auto">
                    <div className="border-t pt-4">
                        <button className="flex w-full items-center rounded-lg p-2 text-sm text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-all">
                            <LogOut className="h-4 w-4" />
                            <span className="ml-3">Sair</span>
                        </button>
                    </div>

                    <div className="mt-4 flex items-center gap-3 rounded-xl bg-muted/50 p-2">
                        <div className="h-8 w-8 overflow-hidden rounded-full border border-border">
                            <img src="https://github.com/shadcn.png" alt="User" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-medium text-foreground">Carlos Mendes</span>
                            <span className="text-[10px] text-muted-foreground">carlos@cpa.com.br</span>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
}
