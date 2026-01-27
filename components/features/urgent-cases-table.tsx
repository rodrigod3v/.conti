"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const urgentCases = [
    {
        id: "#CS-2024-001",
        client: "Empresa ABC Ltda",
        service: "Balanço Anual",
        responsible: { name: "Ana", image: "https://i.pravatar.cc/150?u=a042581f4e29026024d" },
        deadline: "Hoje",
        status: "Critico"
    },
    {
        id: "#CS-2024-042",
        client: "Tech Solutions S.A.",
        service: "Folha de Pagamento",
        responsible: { name: "Carlos", image: "https://i.pravatar.cc/150?u=a042581f4e29026704d" },
        deadline: "Amanhã",
        status: "Aguardando Docs"
    }
];

export function UrgentCasesTable() {
    return (
        <Card className="col-span-1 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between p-4">
                <div>
                    <CardTitle className="text-base font-bold">Casos Urgentes</CardTitle>
                    <p className="text-xs text-muted-foreground">Itens que requerem atenção imediata or vencem hoje.</p>
                </div>
                <Button variant="ghost" className="text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 h-8">
                    Ver todos →
                </Button>
            </CardHeader>
            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-muted-foreground uppercase bg-muted/30">
                            <tr>
                                <th className="px-4 py-2 font-medium">ID</th>
                                <th className="px-4 py-2 font-medium">Cliente</th>
                                <th className="px-4 py-2 font-medium">Tipo de Serviço</th>
                                <th className="px-4 py-2 font-medium">Responsável</th>
                                <th className="px-4 py-2 font-medium">Prazo</th>
                                <th className="px-4 py-2 font-medium text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {urgentCases.map((item) => (
                                <tr key={item.id} className="hover:bg-muted/20">
                                    <td className="px-4 py-2 text-muted-foreground text-xs">{item.id}</td>
                                    <td className="px-4 py-2 font-medium flex items-center gap-2">
                                        <div className="h-6 w-6 rounded bg-slate-800 text-white flex items-center justify-center text-[10px] font-bold">
                                            {item.client.substring(0, 2).toUpperCase()}
                                        </div>
                                        {item.client}
                                    </td>
                                    <td className="px-4 py-2 text-muted-foreground text-xs">{item.service}</td>
                                    <td className="px-4 py-2">
                                        <Avatar className="h-6 w-6">
                                            <AvatarImage src={item.responsible.image} />
                                            <AvatarFallback>{item.responsible.name[0]}</AvatarFallback>
                                        </Avatar>
                                    </td>
                                    <td className="px-4 py-2 font-bold text-red-500 text-xs">{item.deadline}</td>
                                    <td className="px-4 py-2 text-right">
                                        <Badge variant="outline" className={cn(
                                            "text-[10px] px-1.5 py-0.5",
                                            item.status === 'Critico' ? "border-red-200 bg-red-50 text-red-700" :
                                                "border-orange-200 bg-orange-50 text-orange-700"
                                        )}>
                                            {item.status}
                                        </Badge>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
}
