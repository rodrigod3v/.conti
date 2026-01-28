"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

// --- Types ---
type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
    id: string;
    message: string;
    description?: string;
    type: ToastType;
    duration?: number;
    action?: {
        label: string;
        onClick: () => void;
    };
}

interface ToastContextType {
    toasts: Toast[];
    addToast: (toast: Omit<Toast, "id">) => void;
    removeToast: (id: string) => void;
}

// --- Context ---
const ToastContext = createContext<ToastContextType | undefined>(undefined);

// --- Provider ---
export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = useCallback((toast: Omit<Toast, "id">) => {
        const id = Math.random().toString(36).substring(2, 9);
        const newToast = { ...toast, id };

        setToasts((prev) => {
            // 1. Remove duplicates (same message) to "bump" the new one
            const filtered = prev.filter(t => t.message !== toast.message);
            // 2. Add new toast to end
            const updated = [...filtered, newToast];
            // 3. Strict Limit: Keep only the last 3
            if (updated.length > 3) {
                return updated.slice(updated.length - 3);
            }
            return updated;
        });

        if (toast.duration !== Infinity) {
            setTimeout(() => {
                removeToast(id);
            }, toast.duration || 4000);
        }
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
            {children}
            <Toaster />
        </ToastContext.Provider>
    );
}

// --- Hook ---
export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within a ToastProvider");
    }

    const toast = (
        message: string,
        type: ToastType = "info",
        options?: { description?: string; duration?: number; action?: { label: string; onClick: () => void } }
    ) => {
        context.addToast({ message, type, ...options });
    };

    return {
        toast,
        // Shortcuts
        success: (msg: string, desc?: string) => toast(msg, "success", { description: desc }),
        error: (msg: string, desc?: string) => toast(msg, "error", { description: desc }),
        warning: (msg: string, desc?: string) => toast(msg, "warning", { description: desc }),
        item: (msg: string, desc?: string) => toast(msg, "info", { description: desc }),
        // Action toast
        action: (msg: string, label: string, onClick: () => void, desc?: string) =>
            toast(msg, "info", { description: desc, duration: 8000, action: { label, onClick } })
    };
}

// --- Component ---
function Toaster() {
    const { toasts, removeToast } = useContext(ToastContext)!;

    if (toasts.length === 0) return null;

    return (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 w-full max-w-md pointer-events-none items-center">
            {toasts.map((t) => (
                <div
                    key={t.id}
                    className={cn(
                        "pointer-events-auto flex items-center gap-4 px-6 py-3 rounded-full shadow-2xl border transition-all animate-in slide-in-from-top-full zoom-in-95 duration-200",
                        "bg-white/95 backdrop-blur-md dark:bg-zinc-900/95",
                        t.type === "success" && "border-emerald-500/20 text-emerald-950 dark:text-emerald-50",
                        t.type === "error" && "border-red-500/20 text-red-950 dark:text-red-50",
                        t.type === "warning" && "border-amber-500/20 text-amber-950 dark:text-amber-50",
                        t.type === "info" && "border-blue-500/20 text-blue-950 dark:text-blue-50"
                    )}
                >
                    {/* Icon */}
                    <div className="shrink-0">
                        {t.type === "success" && <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />}
                        {t.type === "error" && <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />}
                        {t.type === "warning" && <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />}
                        {t.type === "info" && <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
                    </div>

                    {/* Content */}
                    <div className="flex flex-col">
                        <p className="text-sm font-bold leading-none">
                            {t.message}
                        </p>
                        {t.description && (
                            <p className="text-[10px] text-muted-foreground font-medium mt-1 leading-none opacity-80">
                                {t.description}
                            </p>
                        )}
                    </div>

                    {/* Action Button - Compact */}
                    {t.action && (
                        <button
                            onClick={() => {
                                t.action?.onClick();
                                removeToast(t.id);
                            }}
                            className="text-xs font-bold px-3 py-1 rounded-full bg-primary/10 hover:bg-primary/20 text-primary transition-colors whitespace-nowrap ml-2"
                        >
                            {t.action.label}
                        </button>
                    )}

                    {/* Close */}
                    <button
                        onClick={() => removeToast(t.id)}
                        className="ml-1 text-muted-foreground hover:text-foreground transition-colors p-0.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            ))}
        </div>
    );
}
