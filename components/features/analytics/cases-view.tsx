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
    DollarSign
} from "lucide-react";
import { parseCurrency } from "@/lib/analytics-utils";

interface CasesViewProps {
    data: DataRow[];
    headers: string[];
}

export function CasesView({ data, headers }: CasesViewProps) {
    const router = useRouter();

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

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-4 overflow-y-auto pr-2 h-full">
            {data.map((row, idx) => {
                const title = String(row[titleColumn] || "Sem Título");
                const status = statusCol ? String(row[statusCol]) : null;
                const dateVal = dateCol ? String(row[dateCol]) : null;
                const resp = respCol ? String(row[respCol]) : null;
                const valRaw = valueCol ? row[valueCol] : null;
                const category = categoryCol ? String(row[categoryCol]) : null;

                const statusColor = status ? getStatusColor(status) : "text-gray-600 bg-gray-100";
                const displayValue = valRaw ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(parseCurrency(valRaw)) : null;

                return (
                    <div
                        key={idx}
                        onClick={() => router.push(`/editor?column=${encodeURIComponent(titleColumn)}&value=${encodeURIComponent(title)}`)}
                        className="bg-white dark:bg-[#1a242f] rounded-xl border border-[#dbe0e6] dark:border-[#2d3945] p-5 shadow-sm hover:shadow-md hover:border-primary/50 transition-all cursor-pointer group flex flex-col gap-3 relative"
                    >
                        {/* Header */}
                        <div className="flex justify-between items-start gap-2">
                            <h4 className="font-bold text-[#111418] dark:text-white line-clamp-2 text-base group-hover:text-primary transition-colors">
                                {title}
                            </h4>
                            {status && (
                                <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase shrink-0 ${statusColor.replace('text-', 'bg-').replace('600', '100').replace('500', '100')} ${statusColor}`}>
                                    {status}
                                </span>
                            )}
                        </div>

                        {/* Divider */}
                        <div className="h-px bg-gray-100 dark:bg-gray-800 w-full my-1"></div>

                        {/* Details Grid */}
                        <div className="flex flex-col gap-2 text-xs text-[#617589]">
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
                                    {/* Could use date formatting if we parsed it, but raw string is safer if format varies */}
                                </div>
                            )}
                        </div>

                        {/* Footer (Value) */}
                        {displayValue && (
                            <div className="mt-auto pt-2 flex items-center justify-end">
                                <span className="font-extrabold text-[#111418] dark:text-white text-sm bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded-lg border border-gray-100 dark:border-gray-700">
                                    {displayValue}
                                </span>
                            </div>
                        )}

                        {/* Hover Indicator */}
                        <div className="absolute top-1/2 right-2 opacity-0 group-hover:opacity-100 transition-opacity transform -translate-y-1/2 translate-x-1 group-hover:translate-x-0">
                            <ChevronRight className="h-5 w-5 text-primary" />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
