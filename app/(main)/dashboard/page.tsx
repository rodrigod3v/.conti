"use client";



import { useAppStore } from "@/lib/store";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
    Folder,
    Clock,
    CheckCircle,
    Timer,
    TrendingUp,
    TrendingDown,
    Minus,
    Search,
    Bell,
    Upload,
    PlusCircle,
    Printer,
    Zap,
    MoreHorizontal,
    AlertCircle
} from "lucide-react";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { getStatusColor } from "@/lib/status-utils";
import { NewCaseWizard } from "@/components/features/new-case-wizard";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FinancialView } from "@/components/features/analytics/financial-view";
import { TeamView } from "@/components/features/analytics/team-view";
import { CasesGrid } from "@/components/features/analytics/cases-grid";

import { detectCurrencyColumn, detectTeamColumn, detectDateColumn, detectCategoryColumn, detectStatusColumn, calculateFinancials, parseCurrency } from "@/lib/analytics-utils";
import { ImportButton } from "@/components/features/import-button";

export default function DashboardPage() {
    const { fileData, headers } = useAppStore();
    const router = useRouter();
    const [isWizardOpen, setIsWizardOpen] = useState(false);

    // Smart Detection for Analytics
    const currencyColumn = useMemo(() => detectCurrencyColumn(fileData, headers), [fileData, headers]);
    const teamColumn = useMemo(() => detectTeamColumn(fileData, headers), [fileData, headers]);
    const dateColumn = useMemo(() => detectDateColumn(fileData, headers), [fileData, headers]);
    const categoryColumn = useMemo(() => detectCategoryColumn(fileData, headers), [fileData, headers]);
    // New Feature: Status Detection
    const statusColumn = useMemo(() => detectStatusColumn(fileData, headers), [fileData, headers]);

    // Pre-calculate Financials for Overview KPI
    const financials = useMemo(() => {
        if (!currencyColumn) return null;
        return calculateFinancials(fileData, currencyColumn);
    }, [fileData, currencyColumn]);

    // --- Metrics Calculation ---
    // --- Metrics Calculation ---
    // Helper to get Icon based on status string (Similar to getStatusColor logic)
    const getStatusIcon = (status: string) => {
        const s = status.toLowerCase();
        if (s.includes("aprovado") || s.includes("concluído") || s.includes("ok") || s.includes("pago")) return CheckCircle;
        if (s.includes("pendente") || s.includes("aguardando") || s.includes("espera")) return Clock;
        if (s.includes("erro") || s.includes("falha") || s.includes("atrasado")) return AlertCircle; // Need to import AlertCircle
        if (s.includes("análise") || s.includes("andamento")) return Timer;
        return Folder;
    };

    const metrics = useMemo(() => {
        const total = fileData.length;

        // Dynamic Status Aggregation
        const statusCounts: Record<string, number> = {};
        fileData.forEach(row => {
            if (row["Status"]) {
                const s = String(row["Status"]).trim();
                statusCounts[s] = (statusCounts[s] || 0) + 1;
            }
        });

        // Sort descending
        const topStatuses = Object.entries(statusCounts)
            .sort(([, a], [, b]) => b - a)
            .map(([name, count]) => ({
                name,
                count,
                colorClass: getStatusColor(name),
                Icon: getStatusIcon(name)
            }));

        // Legacy support (keep finished/pending specific counts if needed for other charts, matching the Top Statuses if possible)
        // But for the cards, we use topStatuses.
        // For the donut chart below, we might still want generic "Pending vs Finished" buckets, or purely dynamic?
        // User asked for "Cards" to inherit. I will keep the metrics object compatible but add topStatuses.

        const pending = fileData.filter(r => {
            const s = String(r["Status"] || "").toLowerCase();
            return s.includes("pendente") || s.includes("aguardando") || s.includes("análise");
        }).length;

        const finished = fileData.filter(r => {
            const s = String(r["Status"] || "").toLowerCase();
            return s.includes("aprovado") || s.includes("concluído") || s.includes("pago") || s.includes("ok");
        }).length;

        // Mock average time logic or calculation if dates exist
        const avgTime = "4.2 dias";

        return { total, pending, finished, avgTime, topStatuses };
    }, [fileData]);

    // --- Team Data Calculation ---
    // Group by "Responsável" and count
    const teamData = useMemo(() => {
        const counts: Record<string, number> = {};
        fileData.forEach(row => {
            const resp = String(row["Responsável"] || "Não atribuído");
            counts[resp] = (counts[resp] || 0) + 1;
        });

        return Object.entries(counts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3) // Top 3
            .map(([name, count]) => ({ name, count }));
    }, [fileData]);

    // --- Quick Status Distribution for Chart ---
    const statusDist = useMemo(() => {
        if (!fileData.length) return { progress: 0, waiting: 0, finished: 0 };
        // Simple mapping
        const finished = metrics.finished;
        const waiting = fileData.filter(r => String(r["Status"]).toLowerCase().includes("aguardando")).length;
        const progress = metrics.total - finished - waiting;

        return {
            progressPct: Math.round((progress / metrics.total) * 100) || 0,
            waitingPct: Math.round((waiting / metrics.total) * 100) || 0,
            finishedPct: Math.round((finished / metrics.total) * 100) || 0
        };
    }, [fileData, metrics]);

    // --- Monthly Volume Calculation (Real Data) ---
    const monthlyVolume = useMemo(() => {
        if (!dateColumn) return [];

        const monthCounts = new Array(12).fill(0);

        fileData.forEach(row => {
            const dateStr = String(row[dateColumn]);
            let dateObj: Date | null = null;

            // Try parsing various formats
            // 1. DD/MM/YYYY or DD-MM-YYYY
            if (dateStr.match(/^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4}/)) {
                const parts = dateStr.split(/[\/\-]/);
                // Brazil format DD/MM/YYYY
                dateObj = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
            }
            // 2. ISO or standard Date.parse
            else {
                const parsed = Date.parse(dateStr);
                if (!isNaN(parsed)) {
                    dateObj = new Date(parsed);
                }
            }

            if (dateObj && !isNaN(dateObj.getTime())) {
                monthCounts[dateObj.getMonth()]++;
            }
        });

        const maxCount = Math.max(...monthCounts, 5); // Avoid div/0, min scale 5
        const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

        return monthNames.map((name, idx) => ({
            name,
            count: monthCounts[idx],
            heightPct: maxCount ? (monthCounts[idx] / maxCount) * 100 : 0,
            idx // for filtering logic
        })).filter(item => item.count > 0);
    }, [dateColumn, fileData]);

    // --- Revenue by Status Calculation ---
    const financialsByStatus = useMemo(() => {
        if (!currencyColumn || !fileData.length) return [];

        const counts: Record<string, number> = {};
        fileData.forEach(row => {
            const rawStatus = statusColumn ? row[statusColumn] : row["Status"];
            const s = String(rawStatus || "Outros").trim();
            const val = parseCurrency(row[currencyColumn]);
            counts[s] = (counts[s] || 0) + val;
        });

        const totalRevenue = Object.values(counts).reduce((a, b) => a + b, 0);

        return Object.entries(counts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5) // Top 5
            .map(([name, value]) => ({
                name,
                value,
                pct: totalRevenue ? (value / totalRevenue) * 100 : 0,
                color: getStatusColor(name)
            }));
    }, [fileData, currencyColumn, statusColumn]);




    return (
        <div className="h-screen max-h-screen bg-background-light dark:bg-background-dark font-manrope overflow-hidden flex flex-col">
            {/* Header */}
            <header className="h-16 bg-white dark:bg-[#1a242f] border-b border-border/40 flex items-center justify-between px-8 shrink-0 shadow-sm z-10">
                <div className="flex flex-col justify-center">
                    <h2 className="text-xl font-bold text-[#111418] dark:text-white tracking-tight">Painel de Gestão</h2>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Controle Financeiro & Processos</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-9 gap-2 transition-all text-xs font-bold text-muted-foreground hover:text-foreground border border-transparent hover:border-border rounded-full px-4 hover:bg-muted/50"
                        onClick={() => setIsWizardOpen(true)}
                    >
                        <PlusCircle className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Novo</span>
                    </Button>
                    <div className="w-[1px] h-6 bg-border/60 mx-1 hidden md:block" />
                    <ImportButton variant="ghost" className="h-9 rounded-full px-4 text-muted-foreground hover:text-foreground border border-transparent hover:border-border/50" />
                </div>
            </header>

            {/* Dashboard Body - Tabbed Layout */}
            <div className="p-6 flex flex-col flex-1 min-h-0 overflow-hidden">
                <Tabs defaultValue="overview" className="flex flex-col h-full">
                    <div className="flex justify-between items-center mb-4 shrink-0">
                        <TabsList className="bg-[#f0f2f4] dark:bg-[#1a242f] p-1 border border-[#dbe0e6] dark:border-[#2d3945] rounded-xl h-auto">
                            <TabsTrigger value="overview" className="rounded-lg text-xs font-bold px-4 py-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-sm">Visão Geral</TabsTrigger>
                            <TabsTrigger value="status" className="rounded-lg text-xs font-bold px-4 py-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-sm">Status</TabsTrigger>
                            {currencyColumn && <TabsTrigger value="financial" className="rounded-lg text-xs font-bold px-4 py-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-sm">Financeiro</TabsTrigger>}
                            {teamColumn && <TabsTrigger value="team" className="rounded-lg text-xs font-bold px-4 py-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-sm">Equipe</TabsTrigger>}
                        </TabsList>

                        {/* Global Actions - REMOVED as per user request */}
                    </div>

                    {/* --- TAB: OVERVIEW (Original Dashboard) --- */}
                    <TabsContent value="overview" className="flex-1 min-h-0 flex flex-col gap-4 mt-0 data-[state=inactive]:hidden">
                        {/* KPI Section - Auto-fit Grid (Wraps as needed) */}
                        <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4 shrink-0">
                            {/* KPI Card 1: Total (Always First) */}
                            <div onClick={() => router.push("/editor")} className="cursor-pointer bg-white dark:bg-[#1a242f] p-4 rounded-xl border border-[#dbe0e6] dark:border-[#2d3945] flex flex-col gap-2 shadow-sm hover:shadow-md transition-shadow group">
                                <div className="flex justify-between items-start">
                                    <p className="text-[#617589] text-xs font-semibold uppercase tracking-wider group-hover:text-primary transition-colors">Total de Casos</p>
                                    <Folder className="text-primary h-4 w-4" />
                                </div>
                                <div className="flex items-end gap-2">
                                    <h3 className="text-xl font-extrabold text-[#111418] dark:text-white">{metrics.total}</h3>
                                    <span className="text-emerald-600 text-[10px] font-bold mb-1 flex items-center">
                                        <TrendingUp className="h-3 w-3 mr-1" /> +12%
                                    </span>
                                </div>
                                {/* Fake Sparkline */}
                                <div className="flex items-end gap-0.5 h-6 mt-1 opacity-80">
                                    {[40, 60, 80, 50, 70, 90, 100].map((h, i) => (
                                        <div key={i} className={`w-1 rounded-sm bg-primary ${i % 2 === 0 ? 'opacity-50' : ''}`} style={{ height: `${h}%` }}></div>
                                    ))}
                                </div>
                            </div>

                            {/* Dynamic KPI Cards (All Statuses) */}
                            {financials && (
                                <div className="bg-white dark:bg-[#1a242f] p-4 rounded-xl border border-[#dbe0e6] dark:border-[#2d3945] flex flex-col gap-2 shadow-sm hover:shadow-md transition-shadow group">
                                    <div className="flex justify-between items-start">
                                        <p className="text-[#617589] text-xs font-semibold uppercase tracking-wider group-hover:text-emerald-600 transition-colors">Receita Total</p>
                                        <div className="text-emerald-600 h-4 w-4 font-bold text-xs">$</div>
                                    </div>
                                    <div className="flex items-end gap-2">
                                        <h3 className="text-xl font-extrabold text-[#111418] dark:text-white">
                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(financials.total)}
                                        </h3>
                                        <span className="text-emerald-600 text-[10px] font-bold mb-1 flex items-center">
                                            <TrendingUp className="h-3 w-3 mr-1" />
                                        </span>
                                    </div>
                                    <div className="flex items-end gap-0.5 h-6 mt-1 opacity-80">
                                        {[30, 45, 60, 50, 70, 65, 80].map((h, i) => (
                                            <div key={i} className={`w-1 rounded-sm bg-emerald-500 ${i % 2 === 0 ? 'opacity-50' : ''}`} style={{ height: `${h}%` }}></div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {metrics.topStatuses.map((statusItem, idx) => {
                                const { name, count, colorClass, Icon } = statusItem;

                                // Determine visual color for texts/icons
                                let visualColor = "text-primary";
                                let barColor = "bg-primary";

                                if (colorClass.includes("amber")) { visualColor = "text-amber-500"; barColor = "bg-amber-500"; }
                                else if (colorClass.includes("emerald") || colorClass.includes("green")) { visualColor = "text-emerald-600"; barColor = "bg-emerald-600"; }
                                else if (colorClass.includes("red")) { visualColor = "text-red-600"; barColor = "bg-red-600"; }
                                else if (colorClass.includes("blue")) { visualColor = "text-blue-600"; barColor = "bg-blue-600"; }
                                else if (colorClass.includes("indigo")) { visualColor = "text-indigo-600"; barColor = "bg-indigo-600"; }

                                return (
                                    <div key={name} onClick={() => router.push(`/editor?column=Status&value=${encodeURIComponent(name)}`)} className="cursor-pointer bg-white dark:bg-[#1a242f] p-4 rounded-xl border border-[#dbe0e6] dark:border-[#2d3945] flex flex-col gap-2 shadow-sm hover:shadow-md transition-shadow group">
                                        <div className="flex justify-between items-start">
                                            <p className={`text-[#617589] text-xs font-semibold uppercase tracking-wider group-hover:${visualColor} transition-colors truncate pr-2`}>{name}</p>
                                            <Icon className={`${visualColor} h-4 w-4 shrink-0`} />
                                        </div>
                                        <div className="flex items-end gap-2">
                                            <h3 className="text-xl font-extrabold text-[#111418] dark:text-white">{count}</h3>
                                            <span className={`${visualColor} text-[10px] font-bold mb-1 flex items-center`}>
                                                <TrendingUp className="h-3 w-3 mr-1" /> {Math.floor(Math.random() * 20)}%
                                            </span>
                                        </div>
                                        <div className="flex items-end gap-0.5 h-6 mt-1 opacity-80">
                                            {[60, 70, 65, 75, 70, 80, 70].map((h, i) => (
                                                <div key={i} className={`w-1 rounded-sm ${barColor} ${i % 2 === 0 ? 'opacity-50' : ''}`} style={{ height: `${h}%` }}></div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Fallback Card: Only if 0 dynamic statuses exist (rare) */}
                            {metrics.topStatuses.length === 0 && (
                                <div onClick={() => router.push("/editor")} className="cursor-pointer bg-white dark:bg-[#1a242f] p-4 rounded-xl border border-[#dbe0e6] dark:border-[#2d3945] flex flex-col gap-2 shadow-sm hover:shadow-md transition-shadow group">
                                    <div className="flex justify-between items-start">
                                        <p className="text-[#617589] text-xs font-semibold uppercase tracking-wider group-hover:text-primary transition-colors">Média de Tempo</p>
                                        <Timer className="text-primary h-4 w-4" />
                                    </div>
                                    <div className="flex items-end gap-2">
                                        <h3 className="text-xl font-extrabold text-[#111418] dark:text-white">{metrics.avgTime}</h3>
                                        <span className="text-emerald-600 text-[10px] font-bold mb-1 flex items-center">
                                            <TrendingDown className="h-3 w-3 mr-1" /> -2%
                                        </span>
                                    </div>
                                    <div className="flex items-end gap-0.5 h-6 mt-1 opacity-80">
                                        {[100, 90, 85, 70, 60, 55, 50].map((h, i) => (
                                            <div key={i} className={`w-1 rounded-sm bg-primary ${i % 2 === 0 ? 'opacity-50' : ''}`} style={{ height: `${h}%` }}></div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Center & Right Panel - Flexible Grid (Fills remaining height) */}
                        <div className={`grid grid-cols-1 ${dateColumn ? 'lg:grid-cols-3' : 'lg:grid-cols-1'} gap-4 flex-1 min-h-0 pb-2`}>

                            {/* Main Chart (Left) - Takes 2/3 width if date exists */}
                            {dateColumn && (
                                <div className="lg:col-span-2 bg-white dark:bg-[#1a242f] rounded-xl border border-[#dbe0e6] dark:border-[#2d3945] p-5 shadow-sm flex flex-col h-full min-h-0 overflow-hidden">
                                    <div className="flex items-center justify-between mb-4 shrink-0">
                                        <div>
                                            <h4 className="text-base font-bold text-[#111418] dark:text-white leading-tight">Volume de Casos Mensal</h4>
                                            <p className="text-xs text-[#617589]">Análise detalhada de performance</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <div className="flex items-center gap-1.5 px-2 py-1 bg-[#f0f2f4] dark:bg-gray-800 rounded-lg text-[10px] font-bold text-foreground">
                                                <div className="w-1.5 h-1.5 rounded-full bg-primary"></div> Total
                                            </div>
                                            <div className="flex items-center gap-1.5 px-2 py-1 bg-[#f0f2f4] dark:bg-gray-800 rounded-lg text-[10px] font-bold text-foreground">
                                                <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div> Concluídos
                                            </div>
                                        </div>
                                    </div>

                                    {/* Chart Visualization - Fill available space */}
                                    <div className="relative flex-1 w-full flex items-end justify-between px-4 pb-2">
                                        {/* Months */}
                                        {monthlyVolume.map((item) => (
                                            <div
                                                key={item.name}
                                                onClick={() => {
                                                    const monthNum = String(item.idx + 1).padStart(2, '0');
                                                    router.push(`/editor?column=${encodeURIComponent(dateColumn!)}&value=${encodeURIComponent("/" + monthNum + "/")}`);
                                                }}
                                                className="flex flex-col items-center gap-2 flex-1 group cursor-pointer h-full justify-end"
                                            >
                                                <div className="relative w-full max-w-[40px] flex justify-center h-full items-end transition-all hover:scale-105">
                                                    {/* Background Bar */}
                                                    <div className="bg-primary/5 rounded-t w-full absolute bottom-0 h-[85%]"></div>

                                                    {/* Value Tooltip (Hover) */}
                                                    <div className="absolute -top-8 bg-sky-900 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 font-bold mb-1 pointer-events-none">
                                                        {item.count} Casos
                                                    </div>

                                                    {/* Active Bar */}
                                                    <div
                                                        className="bg-primary rounded-t w-full relative z-0 transition-all group-hover:bg-primary/90 shadow-[0_0_10px_rgba(var(--primary),0.2)]"
                                                        style={{ height: `${item.heightPct || 2}%` }} // Min 2% visibility
                                                    ></div>
                                                </div>
                                                <p className="text-[10px] font-bold text-[#617589]">{item.name}</p>
                                            </div>
                                        ))}

                                        {/* Decorative Line (SVG) */}
                                        <svg className="absolute bottom-[28px] left-0 w-full h-[80%] pointer-events-none opacity-40 overflow-visible" preserveAspectRatio="none">
                                            <path d="M 0,80 L 100,60 L 200,40 L 300,50 L 400,20 L 500,10 L 600,45 L 700,25 L 800,40 L 900,60 L 1000,10 L 1200,5" fill="none" stroke="#f59e0b" strokeWidth="2" vectorEffect="non-scaling-stroke"></path>
                                        </svg>
                                    </div>
                                </div>
                            )}

                            {/* Right Column - Status (Takes 1/3 width if date exists, else full) */}
                            <div className="lg:col-span-1 flex flex-col gap-4 h-full min-h-0">

                                {/* Status Chart Card */}
                                <div className="bg-white dark:bg-[#1a242f] rounded-xl border border-[#dbe0e6] dark:border-[#2d3945] p-5 shadow-sm shrink-0 flex flex-col relative overflow-hidden flex-1 min-h-[220px]">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="text-base font-bold text-[#111418] dark:text-white">Status Geral</h4>
                                        <div className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-bold">Em dia</div>
                                    </div>

                                    <div className="flex items-center justify-between h-full gap-2">
                                        <div className="relative h-28 w-28 shrink-0 flex items-center justify-center">
                                            {/* SVG Donut */}
                                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                                <path className="text-gray-100 dark:text-gray-800" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3"></path>
                                                <path className="text-primary" strokeDasharray="60, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3"></path>
                                                <path className="text-amber-500" strokeDasharray="25, 100" strokeDashoffset="-60" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3"></path>
                                                <path className="text-emerald-500" strokeDasharray="15, 100" strokeDashoffset="-85" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3"></path>
                                            </svg>
                                            <div className="absolute inset-0 flex items-center justify-center flex-col">
                                                <span className="text-xl font-extrabold text-[#111418] dark:text-white leading-none">100%</span>
                                            </div>
                                        </div>

                                        <div className="flex-1 flex flex-col gap-2 justify-center">
                                            <div className="flex items-center justify-between text-xs">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded bg-primary"></div>
                                                    <span className="text-[#617589]">Em Progresso</span>
                                                </div>
                                                <span className="font-bold text-foreground">60%</span>
                                            </div>
                                            <div className="flex items-center justify-between text-xs">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded bg-amber-500"></div>
                                                    <span className="text-[#617589]">Aguardando</span>
                                                </div>
                                                <span className="font-bold text-foreground">25%</span>
                                            </div>
                                            <div className="flex items-center justify-between text-xs">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded bg-emerald-500"></div>
                                                    <span className="text-[#617589]">Finalizados</span>
                                                </div>
                                                <span className="font-bold text-foreground">15%</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Revenue by Status Card (Conditional) */}
                                {currencyColumn && financialsByStatus.length > 0 && (
                                    <div className="bg-white dark:bg-[#1a242f] rounded-xl border border-[#dbe0e6] dark:border-[#2d3945] p-5 shadow-sm flex flex-col flex-1 min-h-[220px] overflow-hidden">
                                        <h4 className="text-sm font-bold text-[#111418] dark:text-white mb-4 shrink-0">Receita por Status</h4>
                                        <div className="flex flex-col gap-3 flex-1 overflow-auto">
                                            {financialsByStatus.map((item, i) => {
                                                // Determine dynamic color for the bar
                                                let barColor = "bg-gray-400";
                                                if (item.color.includes("emerald") || item.color.includes("green") || item.color.includes("success")) barColor = "bg-emerald-500";
                                                else if (item.color.includes("amber") || item.color.includes("yellow") || item.color.includes("warning")) barColor = "bg-amber-500";
                                                else if (item.color.includes("red") || item.color.includes("destructive") || item.color.includes("error")) barColor = "bg-red-500";
                                                else if (item.color.includes("blue") || item.color.includes("info")) barColor = "bg-blue-500";
                                                else if (item.color.includes("indigo") || item.color.includes("violet")) barColor = "bg-indigo-500";

                                                return (
                                                    <div key={i} className="flex flex-col gap-1">
                                                        <div className="flex justify-between items-center text-xs">
                                                            <span className="text-foreground font-medium truncate max-w-[120px] flex items-center gap-2">
                                                                <div className={`w-2 h-2 rounded-full ${barColor}`}></div>
                                                                {item.name}
                                                            </span>
                                                            <span className="text-[#617589] font-mono">
                                                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(item.value)}
                                                            </span>
                                                        </div>
                                                        <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                                            <div className={`h-full rounded-full ${barColor}`} style={{ width: `${item.pct}%` }}></div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Category Distribution Card (Conditional) */}
                                {categoryColumn && (
                                    <div className="bg-white dark:bg-[#1a242f] rounded-xl border border-[#dbe0e6] dark:border-[#2d3945] p-5 shadow-sm flex flex-col flex-1 min-h-[220px] overflow-hidden">
                                        <h4 className="text-sm font-bold text-[#111418] dark:text-white mb-4 shrink-0">Categorias Principais</h4>
                                        <div className="flex flex-col gap-3 flex-1 overflow-auto">
                                            {/* Calculate top categories on the fly */}
                                            {(() => {
                                                const counts: Record<string, number> = {};
                                                fileData.forEach(row => {
                                                    const c = String(row[categoryColumn!] || "Outros");
                                                    counts[c] = (counts[c] || 0) + 1;
                                                });
                                                const sorted = Object.entries(counts).sort(([, a], [, b]) => b - a).slice(0, 5);

                                                return sorted.map(([name, count], i) => (
                                                    <div key={i} className="flex flex-col gap-1">
                                                        <div className="flex justify-between items-center text-xs">
                                                            <span className="text-foreground font-medium truncate max-w-[120px]">{name}</span>
                                                            <span className="text-[#617589]">{count}</span>
                                                        </div>
                                                        <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                                            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(count / metrics.total) * 100}%` }}></div>
                                                        </div>
                                                    </div>
                                                ));
                                            })()}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </TabsContent>

                    {/* --- TAB: FINANCIAL --- */}
                    {currencyColumn && (
                        <TabsContent value="financial" className="flex-1 min-h-0 flex flex-col mt-0 data-[state=inactive]:hidden">
                            <FinancialView data={fileData} currencyColumn={currencyColumn} statusColumn={statusColumn} />
                        </TabsContent>
                    )}

                    {/* --- TAB: TEAM --- */}
                    {teamColumn && (
                        <TabsContent value="team" className="flex-1 min-h-0 flex flex-col mt-0 data-[state=inactive]:hidden">
                            <TeamView data={fileData} />
                        </TabsContent>
                    )}
                    {/* --- TAB: STATUS --- */}
                    <TabsContent value="status" className="flex-1 min-h-0 flex flex-col mt-0 data-[state=inactive]:hidden">
                        <CasesGrid data={fileData} headers={headers} />
                    </TabsContent>
                </Tabs>

                <NewCaseWizard open={isWizardOpen} onOpenChange={setIsWizardOpen} />
            </div>
        </div>
    );
}
