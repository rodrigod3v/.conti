"use client";

import { useMemo } from "react";
import { DataRow } from "@/lib/store";
import { calculateFinancials, parseCurrency } from "@/lib/analytics-utils";
import { DollarSign, TrendingUp, CreditCard, PieChart } from "lucide-react";
import { getStatusColor } from "@/lib/status-utils";

interface FinancialViewProps {
    data: DataRow[];
    currencyColumn: string;
    statusColumn?: string | null;
}

export function FinancialView({ data, currencyColumn, statusColumn }: FinancialViewProps) {
    const metrics = useMemo(() => {
        const { total, avg, max } = calculateFinancials(data, currencyColumn);

        // Group by Status
        const byStatus: Record<string, number> = {};
        data.forEach(r => {
            // Use statusColumn if available, else fallback to "Status" string, else "Outros"
            const rawStatus = statusColumn ? r[statusColumn] : r["Status"];
            const status = String(rawStatus || "Outros").trim();
            const val = parseCurrency(r[currencyColumn]);
            byStatus[status] = (byStatus[status] || 0) + val;
        });

        // Top Statuses by Value
        const topStatus = Object.entries(byStatus)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([name, val]) => ({ name, val, color: getStatusColor(name) }));

        return { total, avg, max, topStatus };
    }, [data, currencyColumn]);

    const formatBRL = (val: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

    return (
        <div className="flex flex-col gap-6 h-full overflow-y-auto pr-2 pb-4 pt-2">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-[#1a242f] p-5 rounded-xl border border-[#dbe0e6] dark:border-[#2d3945] shadow-sm flex flex-col gap-2">
                    <div className="flex justify-between items-start">
                        <p className="text-xs font-bold uppercase text-[#617589]">Receita Total</p>
                        <DollarSign className="text-emerald-500 h-5 w-5" />
                    </div>
                    <h3 className="text-2xl font-extrabold text-[#111418] dark:text-white">{formatBRL(metrics.total)}</h3>
                    <span className="text-xs text-emerald-600 font-bold flex items-center">+8% vs mês anterior</span>
                </div>

                <div className="bg-white dark:bg-[#1a242f] p-5 rounded-xl border border-[#dbe0e6] dark:border-[#2d3945] shadow-sm flex flex-col gap-2">
                    <div className="flex justify-between items-start">
                        <p className="text-xs font-bold uppercase text-[#617589]">Ticket Médio</p>
                        <CreditCard className="text-blue-500 h-5 w-5" />
                    </div>
                    <h3 className="text-2xl font-extrabold text-[#111418] dark:text-white">{formatBRL(metrics.avg)}</h3>
                    <span className="text-xs text-[#617589]">Média por caso</span>
                </div>

                <div className="bg-white dark:bg-[#1a242f] p-5 rounded-xl border border-[#dbe0e6] dark:border-[#2d3945] shadow-sm flex flex-col gap-2">
                    <div className="flex justify-between items-start">
                        <p className="text-xs font-bold uppercase text-[#617589]">Maior Valor</p>
                        <TrendingUp className="text-amber-500 h-5 w-5" />
                    </div>
                    <h3 className="text-2xl font-extrabold text-[#111418] dark:text-white">{formatBRL(metrics.max)}</h3>
                    <span className="text-xs text-[#617589]">Caso de maior impacto</span>
                </div>
            </div>

            {/* Charts Area */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1">
                {/* Revenue by Status Bar Chart */}
                <div className="bg-white dark:bg-[#1a242f] p-6 rounded-xl border border-[#dbe0e6] dark:border-[#2d3945] shadow-sm flex flex-col">
                    <h4 className="font-bold text-[#111418] dark:text-white mb-6">Receita por Status</h4>
                    <div className="flex flex-col gap-4 flex-1 justify-center">
                        {metrics.topStatus.map((item, i) => (
                            <div key={item.name} className="flex items-center gap-3">
                                <div className="w-24 text-xs font-bold text-right truncate dark:text-gray-300">{item.name}</div>
                                <div className="flex-1 h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden relative group">
                                    <div
                                        className={`h-full rounded-full transition-all duration-500 ${item.color.replace('text-', 'bg-').replace('700', '500').replace('600', '500')}`} // Hacky color mapping for demo
                                        style={{ width: `${(item.val / metrics.total) * 100}%` }}
                                    ></div>
                                </div>
                                <div className="w-24 text-xs font-bold text-[#111418] dark:text-white text-right">{formatBRL(item.val)}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Placeholder for Another Chart (e.g. Trend) */}
                <div className="bg-white dark:bg-[#1a242f] p-6 rounded-xl border border-[#dbe0e6] dark:border-[#2d3945] shadow-sm flex flex-col items-center justify-center text-center opacity-80">
                    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-full mb-3">
                        <PieChart className="h-8 w-8 text-gray-400" />
                    </div>
                    <h4 className="font-bold text-[#111418] dark:text-white">Distribuição de Receita</h4>
                    <p className="text-xs text-[#617589] max-w-[200px] mt-1">Em breve, você poderá ver a projeção de faturamento baseada nos casos em andamento.</p>
                </div>
            </div>
        </div>
    );
}
