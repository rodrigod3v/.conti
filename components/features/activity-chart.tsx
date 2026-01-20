"use client";

import { useAppStore } from "@/lib/store";
import { BarChart, Bar, XAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ActivityChart() {
    const { fileData, headers } = useAppStore();

    // Helper to find responsible column
    const respCol = headers.find(h =>
        ['responsável', 'responsavel', 'funcionario', 'colaborador', 'usuario'].some(k => h.toLowerCase().includes(k))
    );

    let data: { name: string; total: number }[] = [];

    if (respCol) {
        // Aggregate by responsible
        const counts: Record<string, number> = {};
        fileData.forEach(row => {
            const name = String(row[respCol] || 'Outros');
            // Check for empty strings/nulls
            const key = (name && name.trim() !== "") ? name : "Não Atribuído";
            counts[key] = (counts[key] || 0) + 1;
        });

        data = Object.entries(counts).map(([name, total]) => ({ name, total }));
        // Sort by total desc and take top 10
        data.sort((a, b) => b.total - a.total).slice(0, 10);
    } else {
        // Fallback or empty state
        data = [];
    }

    return (
        <Card className="col-span-1 md:col-span-2 shadow-sm">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Casos por Responsável</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                            {respCol ? `Distribuição por: ${respCol}` : "Nenhuma coluna de responsável detectada"}
                        </p>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    {data.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data} barSize={40}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                                <XAxis
                                    dataKey="name"
                                    stroke="#888888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    dy={10}
                                />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 4, 4]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex h-full items-center justify-center text-muted-foreground">
                            Sem dados para exibir
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
