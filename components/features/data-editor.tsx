"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Save, Download } from "lucide-react";

export function DataEditor() {
    const { fileData, headers, fileName, updateCell } = useAppStore();
    const [isSaving, setIsSaving] = useState(false);

    if (!fileData || fileData.length === 0) {
        return (
            <div className="flex h-[50vh] flex-col items-center justify-center rounded-xl border bg-muted/10 p-8 text-center">
                <h3 className="text-xl font-semibold">Nenhum dado carregado</h3>
                <p className="text-muted-foreground">Faça upload de uma planilha na página inicial para começar.</p>
            </div>
        );
    }

    const handleSave = () => {
        setIsSaving(true);
        // Simulate API call
        setTimeout(() => {
            setIsSaving(false);
            alert("Dados salvos com sucesso! (Simulação)");
        }, 1000);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">{fileName || "Dados Importados"}</h2>
                    <p className="text-sm text-muted-foreground">{fileData.length} linhas encontradas</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Exportar
                    </Button>
                    <Button onClick={handleSave} disabled={isSaving} className="bg-emerald-600 hover:bg-emerald-700">
                        <Save className="mr-2 h-4 w-4" />
                        {isSaving ? "Salvando..." : "Salvar Alterações"}
                    </Button>
                </div>
            </div>

            <div className="rounded-md border bg-white shadow-sm dark:bg-card">
                <div className="relative w-full overflow-auto" style={{ maxHeight: '70vh' }}>
                    <Table>
                        <TableHeader className="sticky top-0 z-10 bg-muted/50">
                            <TableRow>
                                <TableHead className="w-[50px]">#</TableHead>
                                {headers.map((header) => (
                                    <TableHead key={header} className="min-w-[150px] font-bold text-foreground">
                                        {header}
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {fileData.map((row, rowIndex) => (
                                <TableRow key={rowIndex}>
                                    <TableCell className="font-medium text-muted-foreground">{rowIndex + 1}</TableCell>
                                    {headers.map((header) => (
                                        <TableCell key={`${rowIndex}-${header}`} className="p-2">
                                            <Input
                                                value={row[header] as string || ""}
                                                onChange={(e) => updateCell(rowIndex, header, e.target.value)}
                                                className="h-8 border-transparent bg-transparent shadow-none hover:bg-muted/50 focus-visible:bg-white focus-visible:ring-1 focus-visible:ring-emerald-500"
                                            />
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}
