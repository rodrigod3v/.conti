"use client";

import { UploadZone } from "@/components/features/upload-zone";
import { QuickNavCards } from "@/components/features/quick-nav-cards";
import { RecentHistory } from "@/components/features/recent-history";
import { Calendar, Download } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { read, utils } from "xlsx";
import { Button } from "@/components/ui/button";

export default function Home() {
    const today = new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
    const { setFileData } = useAppStore();
    const router = useRouter();

    const handleFileSelect = async (file: File) => {
        try {
            const buffer = await file.arrayBuffer();
            let jsonData: any[] = [];
            let workbook;

            // Ensure UTF-8 for CSVs
            if (file.name.endsWith(".csv") || file.type === "text/csv") {
                const textDecoder = new TextDecoder("utf-8");
                const text = textDecoder.decode(buffer);
                workbook = read(text, { type: "string" });
            } else {
                workbook = read(buffer);
            }

            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            jsonData = utils.sheet_to_json(worksheet);

            if (jsonData.length > 0) {
                // Transformation Logic
                const transformedData = jsonData.map((row: any, index: number) => {
                    const newRow: any = { ...row };

                    // Normalize standard columns if they exist, but don't force them
                    const findKey = (candidates: string[]) => Object.keys(row).find(k => candidates.some(c => k.toLowerCase().trim() === c.toLowerCase().trim()));

                    // Ensure we have a "Chamado" or ID field for links
                    // User Request: Always use the FIRST item (column) as the ID/Chamado logic.
                    const rowKeys = Object.keys(row);
                    const firstKey = rowKeys.length > 0 ? rowKeys[0] : null;

                    if (firstKey) {
                        // Use the first column as the ID source logic
                        // We KEEP the original key (e.g. "Id do Pedido") so it displays correctly headers
                        // But we also ensure "Chamado" exists for internal routing/logic (hidden id)
                        newRow["Chamado"] = row[firstKey];

                        // We DO NOT delete the original key anymore.
                    } else {
                        // Fallback if row is empty (unlikely given check)
                        let year = new Date().getFullYear();
                        const padIndex = String(index + 1).padStart(3, '0');
                        newRow["Chamado"] = `CS-${year}-${padIndex}`;
                    }

                    // Format Dates if found
                    Object.keys(newRow).forEach(key => {
                        const lowerKey = key.toLowerCase();
                        if (lowerKey.includes("data") || lowerKey === "vencimento") {
                            let rawDate = newRow[key];
                            const strDate = String(rawDate).trim();

                            // 1. Check for Excel serial date
                            const numericDate = parseFloat(strDate);
                            if (!isNaN(numericDate) && numericDate > 20000 && strDate.match(/^\d+(\.\d+)?$/)) {
                                const dateObj = new Date((numericDate - 25569) * 86400 * 1000 + 43200000);
                                const day = String(dateObj.getUTCDate()).padStart(2, '0');
                                const month = String(dateObj.getUTCMonth() + 1).padStart(2, '0');
                                const year = dateObj.getUTCFullYear();
                                newRow[key] = `${day}/${month}/${year}`;
                            }
                            // 2. Check for ISO Date (YYYY-MM-DD)
                            else if (strDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
                                const [year, month, day] = strDate.split('-');
                                newRow[key] = `${day}/${month}/${year}`;
                            }
                            // 3. Check for ISO Date with Time (YYYY-MM-DDTHH:mm...)
                            else if (strDate.match(/^\d{4}-\d{2}-\d{2}T/)) {
                                const dateObj = new Date(strDate);
                                if (!isNaN(dateObj.getTime())) {
                                    const day = String(dateObj.getDate()).padStart(2, '0');
                                    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
                                    const year = dateObj.getFullYear();
                                    newRow[key] = `${day}/${month}/${year}`;
                                }
                            }
                            // 4. Leave DD/MM/YYYY as is, or try standard Date parse fallback?
                            // If it's something like MM/DD/YYYY we might be in trouble without user hint, 
                            // but let's assume if it is NOT YYYY-MM-DD and not numeric, it might be correct or just text.
                        }
                    });

                    return newRow;
                });

                // Headers Logic
                // We want to show all Original Keys.
                // We typically exclude "Chamado" from display if it was auto-generated or duplicated from first key, 
                // UNLESS "Chamado" was actually the name of the first key.
                const allKeys = Array.from(new Set(transformedData.flatMap(row => Object.keys(row))));

                // Filter out "Chamado" if we have another key that is acting as the ID (the first key).
                // Or simply: Use the keys from the first row of original data? 
                // Better: Filter out "Chamado" if it's not in the original file's header set?
                // But we don't have original header set easily here due to flatMap.
                // Let's rely on checking if "Chamado" is strictly needed.

                // If the user uploaded a file with "Chamado", keep it.
                // If we generated "Chamado" as a dupe of "Id do Pedido", hide it.
                // Simple heuristic: If "Chamado" is NOT the first key of the new rows (which might be "Id do Pedido" + "Chamado"), hide it?
                // actually transformedData row keys order might be mixed.

                // Best bet: Filter "Chamado" if "Chamado" is DIFFERENT from the link value source key?
                // Simpler: Just exclude "Chamado" from headers if `jsonData` keys didn't include it?
                const originalKeys = Object.keys(jsonData[0] || {});
                const hasOriginalChamado = originalKeys.some(k => k.trim().toLowerCase() === "chamado");

                const visibleHeaders = allKeys.filter(k => {
                    if (k === "Chamado" && !hasOriginalChamado) return false;
                    return true;
                });

                // Sort: First Key First (ID), then others
                // We need to identify the "First Key" across rows or just take visibleHeaders and likely original order.
                // Original order is best preserved from originalKeys.
                const sortedHeaders = [
                    ...originalKeys.filter(k => visibleHeaders.includes(k)), // Keep original order
                    ...visibleHeaders.filter(k => !originalKeys.includes(k)) // Append any new ones (unlikely besides formatted)
                ];

                // Save to Database
                try {
                    const response = await fetch('/api/files', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            name: file.name,
                            size: file.size,
                            rows: transformedData
                        })
                    });

                    if (!response.ok) throw new Error("Falha ao salvar no banco");

                    const savedFile = await response.json();
                    // Update store with new file ID (for Data Editor context)
                    setFileData(transformedData, sortedHeaders, file.name, savedFile.id);
                    // Ideally store the savedFile.id in the store too
                } catch (dbError) {
                    console.error("Erro de persistência:", dbError);
                    alert("Erro ao salvar no banco de dados, mas carregando visualização...");
                }

                router.push("/editor");
            } else {
                alert("O arquivo parece estar vazio.");
            }
        } catch (error) {
            console.error("Erro ao ler arquivo:", error);
            alert("Erro ao processar o arquivo. Verifique se é um Excel válido.");
        }
    };

    const downloadTemplate = () => {
        const headers = [
            "Chamado", "Observações", "Data", "Status do Pgto", "Responsável", "Área Responsável",
            "Data do Pgto", "Exceção", "Empresa", "Fornecedor", "Nome do Fornecedor",
            "Referencia", "Ordem", "Lançamento", "Forma de Pgto", "Data Lanç Contab",
            "Data Vencimento", "Montante", "Valor Liquido", "Texto de Item",
            "№ ID Fiscal", "Exercicio", "Bloq Pgto Item", "Tp Lanç Cont",
            "PCC", "IR", "Base ISS"
        ];

        const csvContent = headers.join(",") + "\n" +
            "CS-2025-001,Exemplo de observação,14/01/2025,Pendente,João Silva,Financeiro,15/01/2025,,,,,,,,0,0,0,,,,,,,\n";

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "modelo_importacao.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-4">
            {/* Header Section */}
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">Home</h1>
                    <p className="text-lg text-muted-foreground">
                        Gerencie seus arquivos contábeis e inicie novos processamentos.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        onClick={downloadTemplate}
                        className="gap-2 border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 hover:text-primary"
                    >
                        <Download className="h-4 w-4" />
                        Baixar Modelo CSV
                    </Button>
                    <div className="flex items-center gap-2 rounded-full border bg-white px-4 py-2 text-sm font-medium text-muted-foreground shadow-sm dark:bg-card">
                        <Calendar className="h-4 w-4" />
                        <span>{today}</span>
                    </div>
                </div>
            </div>

            {/* Upload Section */}
            <section>
                <UploadZone onFileSelect={handleFileSelect} />
            </section>

            {/* Quick Navigation Cards */}
            <section>
                <QuickNavCards />
            </section>

            {/* Recent History */}
            <section>
                <RecentHistory />
            </section>
        </div>
    );
}
