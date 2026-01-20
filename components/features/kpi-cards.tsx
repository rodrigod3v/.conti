"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileSpreadsheet, CheckCircle, Clock, AlertCircle } from "lucide-react";

export function KpiCards() {
    const kpis = [
        {
            title: "Total de Casos",
            value: "1,248",
            description: "+180 vs mês anterior",
            icon: FileSpreadsheet,
            color: "text-blue-600",
        },
        {
            title: "Processados",
            value: "892",
            description: "71% do total",
            icon: CheckCircle,
            color: "text-emerald-600",
        },
        {
            title: "Pendentes",
            value: "356",
            description: "Ação necessária",
            icon: Clock,
            color: "text-amber-600",
        },
        {
            title: "Com Erro",
            value: "12",
            description: "Requer atenção",
            icon: AlertCircle,
            color: "text-red-600",
        },
    ];

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {kpis.map((kpi) => (
                <Card key={kpi.title}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            {kpi.title}
                        </CardTitle>
                        <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{kpi.value}</div>
                        <p className="text-xs text-muted-foreground">
                            {kpi.description}
                        </p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
