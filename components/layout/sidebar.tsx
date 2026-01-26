"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, FolderOpen, Settings, Plug, LogOut, Home, Table2 } from "lucide-react";

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
    const { fileData } = useAppStore();

    const displayedItems = sidebarItems.filter(item => {
        if (item.title === "Editor" || item.title === "Dashboard") {
            return fileData && fileData.length > 0;
        }
        return true;
    });

    return (
        <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-card transition-transform">
            <div className="flex h-full flex-col px-3 py-4">
                <div className="mb-10 flex items-center pl-4 pt-2">
                    <div className="logo-text flex items-baseline text-2xl font-extrabold">
                        <span className="text-action-orange">.</span>
                        <span className="text-deep-blue dark:text-white">conti</span>
                    </div>
                </div>

                <ul className="space-y-2 font-medium">
                    {displayedItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    className={cn(
                                        "flex items-center rounded-lg p-3 text-muted-foreground hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950 dark:hover:text-emerald-400 group transition-all",
                                        isActive && "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
                                    )}
                                >
                                    <item.icon className="h-5 w-5 flex-shrink-0 transition duration-75" />
                                    <span className="ml-3">{item.title}</span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>

                <div className="mt-auto">
                    <div className="border-t pt-4">
                        <button className="flex w-full items-center rounded-lg p-3 text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-all">
                            <LogOut className="h-5 w-5" />
                            <span className="ml-3">Sair</span>
                        </button>
                    </div>

                    <div className="mt-4 flex items-center gap-3 rounded-xl bg-muted/50 p-3">
                        <div className="h-10 w-10 overflow-hidden rounded-full border border-border">
                            <img src="https://github.com/shadcn.png" alt="User" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-medium text-foreground">Carlos Mendes</span>
                            <span className="text-xs text-muted-foreground">carlos@cpa.com.br</span>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
}
