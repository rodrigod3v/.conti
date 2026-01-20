import { FileSpreadsheet, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const recentFiles = [
    {
        id: 1,
        name: "Balanço_Anual_2023.xlsx",
        date: "12 Out 2023",
        status: "Processado",
        size: "12.4 MB",
    },
    {
        id: 2,
        name: "Clientes_Inadimplentes_Nov.csv",
        date: "10 Nov 2023",
        status: "Pendente",
        size: "2.1 MB",
    },
    {
        id: 3,
        name: "Fluxo_Caixa_Q4.xlsx",
        date: "15 Jan 2024",
        status: "Em Análise",
        size: "5.8 MB",
    },
];

export function RecentHistory() {
    return (
        <div className="rounded-2xl border bg-white shadow-sm dark:bg-card">
            <div className="flex items-center justify-between border-b px-6 py-4">
                <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-foreground">Histórico Recente</h2>
                </div>
                <Button variant="ghost" className="text-sm text-muted-foreground hover:text-foreground">
                    Ver todos
                </Button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-muted/30 text-xs uppercase text-muted-foreground">
                        <tr>
                            <th className="px-6 py-3 font-medium">Nome do Arquivo</th>
                            <th className="px-6 py-3 font-medium">Data de Envio</th>
                            <th className="px-6 py-3 font-medium">Status</th>
                            <th className="px-6 py-3 font-medium text-right">Ação</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {recentFiles.map((file) => (
                            <tr key={file.id} className="group hover:bg-muted/20">
                                <td className="whitespace-nowrap px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                                            <FileSpreadsheet className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-foreground">{file.name}</p>
                                            <p className="text-xs text-muted-foreground">{file.size}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-muted-foreground">
                                    {file.date}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4">
                                    <Badge
                                        variant="outline"
                                        className={`
                        ${file.status === 'Processado' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : ''}
                        ${file.status === 'Pendente' ? 'border-amber-200 bg-amber-50 text-amber-700' : ''}
                        ${file.status === 'Em Análise' ? 'border-blue-200 bg-blue-50 text-blue-700' : ''}
                    `}
                                    >
                                        {file.status}
                                    </Badge>
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-right">
                                    <Button variant="ghost" className="font-medium text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700">
                                        Abrir
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
