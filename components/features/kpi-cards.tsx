"use client";

import { useAppStore } from "@/lib/store";
import { Card, CardContent } from "@/components/ui/card";
import { FileSpreadsheet, CheckCircle, Clock, AlertCircle } from "lucide-react";

export function KpiCards() {
    const { fileData, headers } = useAppStore();

    // Helper to find likely columns
    const findColumn = (keywords: string[]) =>
        headers.find(h => keywords.some(k => h.toLowerCase().includes(k.toLowerCase())));

    const statusCol = findColumn(['status', 'estado', 'situação']);

    // Default counts
    let total = fileData.length;
    let pending = 0;
    let inProgress = 0;
    let completed = 0;

    if (statusCol) {
        fileData.forEach(row => {
            const val = String(row[statusCol] || '').toLowerCase();
            if (val.includes('pendente') || val.includes('aguardando')) pending++;
            else if (val.includes('andamento') || val.includes('análise') || val.includes('analise')) inProgress++;
            else if (val.includes('conclui') || val.includes('finaliz') || val.includes('pago') || val.includes('ok')) completed++;
        });
    }

    const kpis = [
        {
            title: "Total de Casos",
            value: total.toString(),
            badge: total > 0 ? "100%" : "0%",
            badgeColor: "bg-primary/10 text-primary",
            icon: FileSpreadsheet,
            iconColor: "text-primary",
            iconBg: "bg-primary/10",
        },
        {
            title: "Pendentes",
            value: pending.toString(),
            badge: total > 0 ? `${Math.round((pending / total) * 100)}%` : "0%",
            badgeColor: "bg-orange-50 text-orange-700",
            icon: AlertCircle,
            iconColor: "text-orange-600",
            iconBg: "bg-orange-100",
        },
        {
            title: "Em Andamento",
            value: inProgress.toString(),
            badge: total > 0 ? `${Math.round((inProgress / total) * 100)}%` : "0%",
            badgeColor: "bg-pink-50 text-pink-700",
            icon: Clock,
            iconColor: "text-purple-600",
            iconBg: "bg-purple-100",
        },
        {
            title: "Concluidos",
            value: completed.toString(),
            badge: total > 0 ? `${Math.round((completed / total) * 100)}%` : "0%",
            badgeColor: "bg-emerald-50 text-emerald-700",
            icon: CheckCircle,
            iconColor: "text-emerald-600",
            iconBg: "bg-emerald-100",
        },
    ];

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {kpis.map((kpi) => (
                <Card key={kpi.title} className="shadow-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className={`p-2 rounded-lg ${kpi.iconBg}`}>
                                <kpi.icon className={`h-5 w-5 ${kpi.iconColor}`} />
                            </div>
                            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${kpi.badgeColor}`}>
                                {kpi.badge}
                            </span>
                        </div>
                        <div className="mt-2">
                            <p className="text-xs font-medium text-muted-foreground">{kpi.title}</p>
                            <h3 className="text-2xl font-bold mt-0.5">{kpi.value}</h3>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
