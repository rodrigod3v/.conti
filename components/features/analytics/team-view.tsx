"use client";

import { useMemo } from "react";
import { DataRow } from "@/lib/store";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Trophy, Zap, Target } from "lucide-react";

interface TeamViewProps {
    data: DataRow[];
}

export function TeamView({ data }: TeamViewProps) {
    const metrics = useMemo(() => {
        const counts: Record<string, { total: number, finished: number, active: number }> = {};

        data.forEach(row => {
            const resp = String(row["Responsável"] || "Não atribuído");
            const status = String(row["Status"] || "").toLowerCase();
            const isFinished = status.includes("aprovado") || status.includes("concluído") || status.includes("ok");

            if (!counts[resp]) counts[resp] = { total: 0, finished: 0, active: 0 };

            counts[resp].total++;
            if (isFinished) counts[resp].finished++;
            else counts[resp].active++;
        });

        // Convert to array and sort by Total Cases
        return Object.entries(counts)
            .map(([name, stats]) => ({ name, ...stats }))
            .sort((a, b) => b.total - a.total);
    }, [data]);

    return (
        <div className="flex flex-col gap-6 h-full overflow-y-auto pr-2 pb-4 pt-2">

            {/* Top Performers Podiums */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Gold */}
                {metrics[0] && (
                    <div className="bg-gradient-to-b from-yellow-50 to-white dark:from-yellow-900/10 dark:to-[#1a242f] p-6 rounded-xl border border-yellow-200 dark:border-yellow-900/30 shadow-sm flex flex-col items-center text-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-3 opacity-20"><Trophy className="h-12 w-12 text-yellow-500" /></div>
                        <Avatar className="h-16 w-16 mb-3 border-4 border-yellow-100 dark:border-yellow-900">
                            <AvatarFallback className="bg-yellow-100 text-yellow-700 font-bold text-xl">{metrics[0].name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <h3 className="font-bold text-lg text-[#111418] dark:text-white">{metrics[0].name}</h3>
                        <p className="text-xs text-yellow-600 font-bold mb-4">Top Performer</p>
                        <div className="grid grid-cols-2 gap-4 w-full">
                            <div>
                                <p className="text-[10px] text-[#617589] uppercase font-bold">Total</p>
                                <p className="text-xl font-bold text-[#111418] dark:text-white">{metrics[0].total}</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-[#617589] uppercase font-bold">Concluídos</p>
                                <p className="text-xl font-bold text-emerald-600">{metrics[0].finished}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Silver */}
                {metrics[1] && (
                    <div className="bg-white dark:bg-[#1a242f] p-6 rounded-xl border border-[#dbe0e6] dark:border-[#2d3945] shadow-sm flex flex-col items-center text-center relative mt-4 md:mt-0">
                        <Avatar className="h-14 w-14 mb-3 border-4 border-gray-100 dark:border-gray-700">
                            <AvatarFallback className="bg-gray-100 text-gray-700 font-bold text-lg">{metrics[1].name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <h3 className="font-bold text-base text-[#111418] dark:text-white">{metrics[1].name}</h3>
                        <p className="text-xs text-gray-500 font-bold mb-4">2º Lugar</p>
                        <div className="grid grid-cols-2 gap-4 w-full">
                            <div>
                                <p className="text-[10px] text-[#617589] uppercase font-bold">Total</p>
                                <p className="text-lg font-bold text-[#111418] dark:text-white">{metrics[1].total}</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-[#617589] uppercase font-bold">Concluídos</p>
                                <p className="text-lg font-bold text-emerald-600">{metrics[1].finished}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Bronze */}
                {metrics[2] && (
                    <div className="bg-white dark:bg-[#1a242f] p-6 rounded-xl border border-[#dbe0e6] dark:border-[#2d3945] shadow-sm flex flex-col items-center text-center relative mt-4 md:mt-0">
                        <Avatar className="h-14 w-14 mb-3 border-4 border-orange-100 dark:border-orange-900/30">
                            <AvatarFallback className="bg-orange-100 text-orange-700 font-bold text-lg">{metrics[2].name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <h3 className="font-bold text-base text-[#111418] dark:text-white">{metrics[2].name}</h3>
                        <p className="text-xs text-orange-500 font-bold mb-4">3º Lugar</p>
                        <div className="grid grid-cols-2 gap-4 w-full">
                            <div>
                                <p className="text-[10px] text-[#617589] uppercase font-bold">Total</p>
                                <p className="text-lg font-bold text-[#111418] dark:text-white">{metrics[2].total}</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-[#617589] uppercase font-bold">Concluídos</p>
                                <p className="text-lg font-bold text-emerald-600">{metrics[2].finished}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Detailed List */}
            <div className="bg-white dark:bg-[#1a242f] rounded-xl border border-[#dbe0e6] dark:border-[#2d3945] shadow-sm flex flex-col overflow-hidden flex-1">
                <div className="p-4 border-b border-[#dbe0e6] dark:border-[#2d3945] flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/50">
                    <h4 className="font-bold text-[#111418] dark:text-white flex items-center gap-2"><Target className="h-4 w-4" /> Detalhamento da Equipe</h4>
                </div>
                <div className="overflow-auto flex-1 p-0">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-[#617589] bg-gray-50 dark:bg-[#1a242f] sticky top-0 z-10">
                            <tr>
                                <th className="px-6 py-3 font-bold uppercase tracking-wider">Membro</th>
                                <th className="px-6 py-3 font-bold uppercase tracking-wider text-right">Total</th>
                                <th className="px-6 py-3 font-bold uppercase tracking-wider text-right">Ativos</th>
                                <th className="px-6 py-3 font-bold uppercase tracking-wider text-right">Concluídos</th>
                                <th className="px-6 py-3 font-bold uppercase tracking-wider text-right">Eficiência</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#dbe0e6] dark:divide-[#2d3945]">
                            {metrics.map((m, i) => (
                                <tr key={m.name} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-[#111418] dark:text-white flex items-center gap-3">
                                        <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                                            {i + 1}
                                        </div>
                                        {m.name}
                                    </td>
                                    <td className="px-6 py-4 text-right font-bold">{m.total}</td>
                                    <td className="px-6 py-4 text-right text-amber-600">{m.active}</td>
                                    <td className="px-6 py-4 text-right text-emerald-600">{m.finished}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <span className="text-xs font-bold">{Math.round((m.finished / (m.total || 1)) * 100)}%</span>
                                            <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                <div className="bg-primary h-full rounded-full" style={{ width: `${(m.finished / (m.total || 1)) * 100}%` }}></div>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
