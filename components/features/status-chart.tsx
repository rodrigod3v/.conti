"use client";

import { useAppStore } from "@/lib/store";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const COLORS = ["#10b981", "#005f73", "#f97316", "#3b82f6", "#ef4444", "#8b5cf6", "#ec4899", "#9ca3af"];

export function StatusChart() {
    const { fileData, headers } = useAppStore();

    // Helper to find status column
    const statusCol = headers.find(h =>
        ['status', 'situacao', 'estado', 'fase'].some(k => h.toLowerCase().includes(k))
    );

    let data: { name: string; value: number; color: string }[] = [];

    if (statusCol) {
        const counts: Record<string, number> = {};
        fileData.forEach(row => {
            const val = String(row[statusCol] || 'Desconhecido');
            // Trim and Capitalize for cleaner grouping
            const key = val.trim();
            counts[key] = (counts[key] || 0) + 1;
        });

        data = Object.entries(counts).map(([name, value], index) => ({
            name,
            value,
            color: COLORS[index % COLORS.length]
        }));
    }

    return (
        <Card className="col-span-1 shadow-sm">
            <CardHeader>
                <CardTitle>Status</CardTitle>
                <p className="text-sm text-muted-foreground">
                    {statusCol ? "Visão geral do fluxo" : "Coluna de Status não detectada"}
                </p>
            </CardHeader>
            <CardContent>
                {data.length > 0 ? (
                    <>
                        <div className="h-[200px] w-full relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={data}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={0}
                                        dataKey="value"
                                        startAngle={90}
                                        endAngle={-270}
                                    >
                                        {data.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-3xl font-bold">100%</span>
                                <span className="text-xs text-muted-foreground">Total</span>
                            </div>
                        </div>
                        <div className="mt-4 grid grid-cols-2 gap-4">
                            {data.map((item) => (
                                <div key={item.name} className="flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                                    <div className="text-xs text-muted-foreground truncate" title={item.name}>
                                        <span className="font-medium text-foreground">{item.name}</span> ({Math.round((item.value / fileData.length) * 100)}%)
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="flex h-[200px] items-center justify-center text-muted-foreground">
                        Sem dados para exibir
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
