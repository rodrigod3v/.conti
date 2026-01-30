"use client";

import { DataRow } from "@/lib/store";
import { useRouter } from "next/navigation";
import { getStatusColor } from "@/lib/status-utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
    Calendar,
    User,
    Tag,
    ChevronRight,
    FileText,
    DollarSign,
    Layers,
    Filter
} from "lucide-react";
import { parseCurrency } from "@/lib/analytics-utils";
import { useState } from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface CasesGridProps {
    data: DataRow[];
    headers: string[];
}

export function CasesGrid({ data, headers }: CasesGridProps) {
    const router = useRouter();
    const [filter, setFilter] = useState("all");

    if (!data.length) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center opacity-60">
                <FileText className="h-12 w-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-bold text-[#111418] dark:text-white">Nenhum caso encontrado</h3>
                <p className="text-sm text-[#617589]">Adicione dados à sua planilha para visualizar os casos aqui.</p>
            </div>
        );
    }

    const titleColumn = headers[0]; // Assume first column is the identifier/title

    // Helper to find relevant columns dynamically
    const findCol = (keywords: string[]) => headers.find(h => keywords.some(k => h.toLowerCase().includes(k)));

    const statusCol = findCol(["status", "estado", "situação"]);
    const dateCol = findCol(["data", "date", "criado", "emissão"]);
    const respCol = findCol(["responsável", "owner", "atribuído", "user"]);
    const valueCol = findCol(["valor", "preço", "custo", "receita"]);
    const categoryCol = findCol(["categoria", "tipo", "assunto", "produto"]);

    // Group items by Status
    const groupedData: Record<string, DataRow[]> = {};
    const allStatuses: string[] = [];

    data.forEach(row => {
        const s = statusCol ? String(row[statusCol] || "Sem Status") : "Geral";
        if (!groupedData[s]) {
            groupedData[s] = [];
            allStatuses.push(s);
        }
        groupedData[s].push(row);
    });

    allStatuses.sort();

    // Apply Filter
    const displayStatuses = filter === "all" ? allStatuses : allStatuses.filter(s => s === filter);

    return (
        <div className="flex flex-col h-full overflow-hidden">
            {/* Filter Header */}
            <div className="flex items-center justify-between mb-4 shrink-0 px-1">
                <div className="flex items-center gap-2 text-sm text-[#617589]">
                    <Layers className="h-4 w-4" />
                    <span className="font-semibold">Quadro de Status</span>
                </div>
                <div className="flex items-center gap-2">
                    <Filter className="h-3.5 w-3.5 text-[#617589]" />
                    <Select value={filter} onValueChange={setFilter}>
                        <SelectTrigger className="w-[180px] h-8 text-xs bg-white dark:bg-[#1a242f] border-[#dbe0e6] dark:border-[#2d3945]">
                            <SelectValue placeholder="Filtrar por Status" />
                        </SelectTrigger>
                        <SelectContent align="end">
                            <SelectItem value="all">Todos os Status</SelectItem>
                            {allStatuses.map(s => (
                                <SelectItem key={s} value={s}>{s}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto pr-2 pb-4 flex flex-col gap-8">
                {displayStatuses.map((statusGroup) => {
                    const statusColor = getStatusColor(statusGroup);
                    const colorName = statusColor.replace('text-', '').split('-')[0];
                    const bgColor = statusColor.replace('text-', 'bg-').replace('600', '50');

                    return (
                        <div key={statusGroup} className="flex flex-col gap-4 animate-in fade-in duration-500">
                            {/* Section Header */}
                            <div className="flex items-center gap-2 sticky top-0 bg-[#f8f9fa] dark:bg-[#111418] z-10 py-2 -mx-1 px-1 bg-opacity-90 backdrop-blur-sm">
                                <div className={`h-3 w-3 rounded-full ${statusColor.replace('text-', 'bg-')}`}></div>
                                <h3 className="text-sm font-bold text-[#111418] dark:text-white uppercase tracking-wider">{statusGroup}</h3>
                                <span className="text-xs text-gray-400 font-medium">({groupedData[statusGroup].length})</span>
                            </div>

                            {/* Grid for this Status */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {groupedData[statusGroup].map((row, idx) => {
                                    const title = String(row[titleColumn] || "Sem Título");
                                    const dateVal = dateCol ? String(row[dateCol]) : null;
                                    const resp = respCol ? String(row[respCol]) : null;
                                    const valRaw = valueCol ? row[valueCol] : null;
                                    const category = categoryCol ? String(row[categoryCol]) : null;
                                    const displayValue = valRaw ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(parseCurrency(valRaw)) : null;

                                    return (
                                        <div
                                            key={idx}
                                            onClick={() => router.push(`/editor?column=${encodeURIComponent(titleColumn)}&value=${encodeURIComponent(title)}`)}
                                            className={`bg-white dark:bg-[#1a242f] rounded-xl border-l-4 p-5 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col gap-3 relative border-y border-r border-gray-200 dark:border-gray-700`}
                                            style={{ borderLeftColor: `var(--theme-${colorName}-500, ${statusColor.includes('emerald') ? '#10b981' : statusColor.includes('amber') ? '#f59e0b' : statusColor.includes('blue') ? '#3b82f6' : '#6b7280'})` }}
                                        >
                                            {/* Explicit Tailwind Border Class fallback */}
                                            <div className={`absolute inset-y-0 left-0 w-1 rounded-l-xl ${statusColor.replace('text-', 'bg-')}`}></div>

                                            {/* Header */}
                                            <div className="flex justify-between items-start gap-2 pl-2">
                                                <h4 className="font-bold text-[#111418] dark:text-white line-clamp-2 text-base group-hover:text-primary transition-colors">
                                                    {title}
                                                </h4>
                                                {/* Value Badge (Top Right) */}
                                                {displayValue && (
                                                    <span className={`text-[10px] font-extrabold px-2 py-1 rounded-md ${bgColor} ${statusColor} shrink-0`}>
                                                        {displayValue}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Details Grid */}
                                            <div className="flex flex-col gap-2 text-xs text-[#617589] pl-2 mt-1">
                                                {category && (
                                                    <div className="flex items-center gap-2">
                                                        <Tag className="h-3.5 w-3.5 text-gray-400" />
                                                        <span className="truncate">{category}</span>
                                                    </div>
                                                )}

                                                {resp && (
                                                    <div className="flex items-center gap-2">
                                                        <User className="h-3.5 w-3.5 text-gray-400" />
                                                        <span className="truncate">{resp}</span>
                                                    </div>
                                                )}

                                                {dateVal && (
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="h-3.5 w-3.5 text-gray-400" />
                                                        <span>{dateVal}</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Hover Indicator */}
                                            <div className="absolute top-1/2 right-2 opacity-0 group-hover:opacity-100 transition-opacity transform -translate-y-1/2 translate-x-1 group-hover:translate-x-0">
                                                <ChevronRight className={`h-5 w-5 ${statusColor}`} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
