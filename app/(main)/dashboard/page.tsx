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
    MoreHorizontal
} from "lucide-react";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { NewCaseWizard } from "@/components/features/new-case-wizard";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
    const { fileData } = useAppStore();
    const router = useRouter();
    const [isWizardOpen, setIsWizardOpen] = useState(false);

    // --- Metrics Calculation ---
    const metrics = useMemo(() => {
        const total = fileData.length;

        const pending = fileData.filter(r => {
            const s = String(r["Status"] || "").toLowerCase();
            return s.includes("pendente") || s.includes("aguardando") || s.includes("análise");
        }).length;

        const finished = fileData.filter(r => {
            const s = String(r["Status"] || "").toLowerCase();
            return s.includes("aprovado") || s.includes("concluído") || s.includes("pago") || s.includes("ok");
        }).length;

        // Mock average time logic or calculation if dates exist
        // For now hardcoded to match design feeling but maybe valid if we had start/end dates
        const avgTime = "4.2 dias";

        return { total, pending, finished, avgTime };
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


    return (
        <div className="h-screen max-h-screen bg-background-light dark:bg-background-dark font-manrope overflow-hidden flex flex-col">
            {/* Header */}
            <header className="h-14 bg-white dark:bg-[#1a242f] border-b border-[#dbe0e6] dark:border-[#2d3945] flex items-center justify-between px-6 shrink-0">
                <div className="flex items-center gap-4">
                    <h2 className="text-lg font-bold text-[#111418] dark:text-white">Visão Geral do Sistema</h2>
                    <div className="h-4 w-px bg-gray-300 dark:bg-gray-600"></div>
                    <p className="text-sm text-[#617589] capitalize">{format(new Date(), "MMMM yyyy", { locale: ptBR })}</p>
                </div>
                <div className="flex items-center gap-6">
                    <div className="relative flex items-center hidden md:flex">
                        <Search className="absolute left-3 text-[#617589] h-4 w-4" />
                        <input
                            className="bg-[#f0f2f4] dark:bg-gray-800 border-none rounded-lg pl-9 pr-4 py-1.5 text-sm w-64 focus:ring-2 focus:ring-primary/50 transition-all outline-none text-foreground"
                            placeholder="Buscar processos..."
                            type="text"
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="p-2 text-[#617589] hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                            <Bell className="h-5 w-5" />
                        </button>
                        <div className="h-8 w-8 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                            US
                        </div>
                    </div>
                </div>
            </header>

            {/* Dashboard Body - Scroll internal if needed, but try fix */}
            <div className="p-6 flex flex-col gap-4 flex-1 min-h-0 overflow-hidden">

                {/* KPI Section - Fixed Height */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
                    {/* KPI Card 1 */}
                    <div className="bg-white dark:bg-[#1a242f] p-4 rounded-xl border border-[#dbe0e6] dark:border-[#2d3945] flex flex-col gap-2 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start">
                            <p className="text-[#617589] text-xs font-semibold uppercase tracking-wider">Total de Casos</p>
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

                    {/* KPI Card 2 */}
                    <div className="bg-white dark:bg-[#1a242f] p-4 rounded-xl border border-[#dbe0e6] dark:border-[#2d3945] flex flex-col gap-2 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start">
                            <p className="text-[#617589] text-xs font-semibold uppercase tracking-wider">Pendentes</p>
                            <Clock className="text-amber-500 h-4 w-4" />
                        </div>
                        <div className="flex items-end gap-2">
                            <h3 className="text-xl font-extrabold text-[#111418] dark:text-white">{metrics.pending}</h3>
                            <span className="text-amber-500 text-[10px] font-bold mb-1 flex items-center">
                                <Minus className="h-3 w-3 mr-1" /> 0%
                            </span>
                        </div>
                        <div className="flex items-end gap-0.5 h-6 mt-1 opacity-80">
                            {[60, 70, 65, 75, 70, 80, 70].map((h, i) => (
                                <div key={i} className={`w-1 rounded-sm bg-amber-500 ${i % 2 === 0 ? 'opacity-50' : ''}`} style={{ height: `${h}%` }}></div>
                            ))}
                        </div>
                    </div>

                    {/* KPI Card 3 */}
                    <div className="bg-white dark:bg-[#1a242f] p-4 rounded-xl border border-[#dbe0e6] dark:border-[#2d3945] flex flex-col gap-2 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start">
                            <p className="text-[#617589] text-xs font-semibold uppercase tracking-wider">Finalizados</p>
                            <CheckCircle className="text-emerald-600 h-4 w-4" />
                        </div>
                        <div className="flex items-end gap-2">
                            <h3 className="text-xl font-extrabold text-[#111418] dark:text-white">{metrics.finished}</h3>
                            <span className="text-red-500 text-[10px] font-bold mb-1 flex items-center">
                                <TrendingDown className="h-3 w-3 mr-1" /> -8%
                            </span>
                        </div>
                        <div className="flex items-end gap-0.5 h-6 mt-1 opacity-80">
                            {[90, 100, 80, 70, 60, 50, 45].map((h, i) => (
                                <div key={i} className={`w-1 rounded-sm bg-emerald-600 ${i % 2 === 0 ? 'opacity-50' : ''}`} style={{ height: `${h}%` }}></div>
                            ))}
                        </div>
                    </div>

                    {/* KPI Card 4 */}
                    <div className="bg-white dark:bg-[#1a242f] p-4 rounded-xl border border-[#dbe0e6] dark:border-[#2d3945] flex flex-col gap-2 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start">
                            <p className="text-[#617589] text-xs font-semibold uppercase tracking-wider">Média de Tempo</p>
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
                </div>

                {/* Center & Right Panel - Flex Grow */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-0">

                    {/* Main Chart (Left) - Flexible Height */}
                    <div className="lg:col-span-9 bg-white dark:bg-[#1a242f] rounded-xl border border-[#dbe0e6] dark:border-[#2d3945] p-5 shadow-sm flex flex-col h-full min-h-0">
                        <div className="flex items-center justify-between mb-4 shrink-0">
                            <div>
                                <h4 className="text-base font-bold text-[#111418] dark:text-white leading-tight">Volume de Casos Mensal</h4>
                                <p className="text-xs text-[#617589]">Análise detalhada de performance por semestre</p>
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
                            {['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'].map((month, idx) => {
                                // Simulated heights
                                const heights = [40, 55, 70, 60, 80, 90];
                                const h = heights[idx];
                                return (
                                    <div key={month} className="flex flex-col items-center gap-2 w-12 group cursor-pointer h-full justify-end">
                                        <div className="relative w-full flex justify-center h-full items-end">
                                            {/* Background Bar - relative height */}
                                            <div className="bg-primary/10 rounded-t w-full absolute bottom-0 h-4/5"></div>
                                            {/* Active Bar */}
                                            <div
                                                className="bg-primary rounded-t w-full relative z-0 transition-all group-hover:bg-primary/90"
                                                style={{ height: `${h}%` }}
                                            ></div>
                                            {/* Dot on Line */}
                                            <div
                                                className="absolute left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-amber-500 shadow-lg z-10 border border-white"
                                                style={{ bottom: `${h * 0.8}%`, marginBottom: '4px' }}
                                            ></div>
                                        </div>
                                        <p className="text-[10px] font-bold text-[#617589]">{month}</p>
                                    </div>
                                )
                            })}

                            {/* Decorative Line (SVG) */}
                            <svg className="absolute bottom-[20px] left-0 w-full h-4/5 pointer-events-none opacity-50 overflow-visible" preserveAspectRatio="none">
                                <path d="M 30,80 L 150,60 L 270,40 L 390,50 L 510,20 L 630,10" fill="none" stroke="#f59e0b" strokeWidth="2" vectorEffect="non-scaling-stroke"></path>
                            </svg>
                        </div>
                    </div>

                    {/* Quick Actions (Right) */}
                    <div className="lg:col-span-3 flex flex-col gap-4 h-full">
                        <div className="bg-white dark:bg-[#1a242f] rounded-xl border border-[#dbe0e6] dark:border-[#2d3945] p-5 shadow-sm flex flex-col gap-3 flex-1 overflow-auto">
                            <h4 className="text-sm font-bold text-[#111418] dark:text-white">Ações Rápidas</h4>
                            <div className="flex flex-col gap-2">
                                <Button
                                    variant="ghost"
                                    className="w-full justify-start h-auto py-2 px-3 bg-primary/5 text-primary hover:bg-primary/10 hover:text-primary border border-primary/20"
                                    onClick={() => router.push("/")}
                                >
                                    <Upload className="mr-3 h-4 w-4" />
                                    <span className="text-xs font-bold">Upload</span>
                                </Button>

                                <Button
                                    variant="ghost"
                                    className="w-full justify-start h-auto py-2 px-3 border border-[#dbe0e6] hover:bg-gray-50 dark:hover:bg-gray-800 dark:border-[#2d3945] text-foreground"
                                    onClick={() => setIsWizardOpen(true)}
                                >
                                    <PlusCircle className="mr-3 h-4 w-4" />
                                    <span className="text-xs font-bold">Novo Caso</span>
                                </Button>

                                <Button variant="ghost" className="w-full justify-start h-auto py-2 px-3 border border-[#dbe0e6] hover:bg-gray-50 dark:hover:bg-gray-800 dark:border-[#2d3945] text-foreground">
                                    <Printer className="mr-3 h-4 w-4" />
                                    <span className="text-xs font-bold">Imprimir</span>
                                </Button>
                            </div>
                        </div>

                        <div className="bg-primary rounded-xl p-5 text-white flex flex-col gap-3 shadow-lg shadow-primary/20 shrink-0">
                            <div className="bg-white/20 w-8 h-8 rounded-lg flex items-center justify-center">
                                <Zap className="text-white h-4 w-4" />
                            </div>
                            <div>
                                <h5 className="font-bold text-sm">Upgrade IA</h5>
                                <p className="text-[10px] opacity-90 mt-0.5 leading-tight">Funcionalidades avançadas.</p>
                            </div>
                            <button className="bg-white text-primary font-bold py-1.5 px-3 rounded-lg text-[10px] mt-1 hover:bg-white/90 transition-all self-start">
                                Em Breve
                            </button>
                        </div>
                    </div>
                </div>

                {/* Bottom Row Cards - Fixed Height/Shrinkable */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[25%] shrink-0 min-h-[140px]">

                    {/* Status Chart Card */}
                    <div className="bg-white dark:bg-[#1a242f] rounded-xl border border-[#dbe0e6] dark:border-[#2d3945] p-4 shadow-sm h-full overflow-hidden flex flex-col justify-center">
                        <div className="flex items-center gap-6 justify-center sm:justify-start h-full">
                            <div className="relative h-24 w-24 shrink-0">
                                {/* SVG Donut */}
                                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                    <path className="text-gray-100 dark:text-gray-800" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4"></path>
                                    <path className="text-primary" strokeDasharray="60, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4"></path>
                                    <path className="text-amber-500" strokeDasharray="25, 100" strokeDashoffset="-60" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4"></path>
                                    <path className="text-emerald-500" strokeDasharray="15, 100" strokeDashoffset="-85" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4"></path>
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center flex-col">
                                    <span className="text-sm font-bold text-foreground">100%</span>
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

                    {/* Team Performance Card */}
                    <div className="bg-white dark:bg-[#1a242f] rounded-xl border border-[#dbe0e6] dark:border-[#2d3945] p-4 shadow-sm h-full overflow-y-auto flex flex-col">
                        <h4 className="text-sm font-bold text-[#111418] dark:text-white mb-2 shrink-0">Desempenho da Equipe</h4>
                        <div className="flex flex-col gap-3 flex-1 overflow-auto">
                            {(teamData.length > 0 ? teamData : [
                                { name: "Ana Souza", count: 42, role: "Analista Sênior" },
                                { name: "Pedro Silva", count: 38, role: "Analista Pleno" },
                                { name: "Carlos Mendes", count: 12, role: "Assistente" }
                            ]).map((member, i) => (
                                <div key={i} className="flex items-center justify-between group">
                                    <div className="flex items-center gap-2">
                                        <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[10px] font-bold border border-primary/20 shrink-0">
                                            {member.name.charAt(0)}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-foreground truncate max-w-[80px]">{member.name}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="text-right">
                                            <span className="text-[10px] font-bold text-foreground block">{member.count} Casos</span>
                                            <div className="w-16 h-1 bg-gray-100 dark:bg-gray-700 rounded-full mt-0.5 overflow-hidden">
                                                <div
                                                    className={`h-full ${i === 2 ? 'bg-amber-500' : 'bg-primary'}`}
                                                    style={{ width: `${Math.min(member.count * 1.5, 100)}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <NewCaseWizard open={isWizardOpen} onOpenChange={setIsWizardOpen} />
            </div>
        </div>
    );
}
