"use client";

import { UploadZone } from "@/components/features/upload-zone";
import { QuickNavCards } from "@/components/features/quick-nav-cards";
import { RecentHistory } from "@/components/features/recent-history";
import { Calendar, Download } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import ExcelJS from "exceljs";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/simple-toast";

export default function Home() {
    const today = new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
    const { setFileData, setSheets } = useAppStore();
    const router = useRouter();
    const toast = useToast();

    const handleFileSelect = async (file: File) => {
        try {
            const buffer = await file.arrayBuffer();
            let jsonData: any[] = [];

            // Dictionary to hold all sheets data
            const sheetsData: Record<string, { data: any[], headers: string[] }> = {};

            // Handle CSV files
            if (file.name.endsWith(".csv") || file.type === "text/csv") {
                const textDecoder = new TextDecoder("utf-8");
                const text = textDecoder.decode(buffer);
                const lines = text.split('\n').filter(line => line.trim());
                if (lines.length > 0) {
                    const headers = lines[0].split(',').map(h => h.trim());
                    jsonData = lines.slice(1).map(line => {
                        const values = line.split(',');
                        const row: any = {};
                        headers.forEach((header, index) => {
                            row[header] = values[index]?.trim() || '';
                        });
                        return row;
                    });

                    // Logic to process the single CSV sheet
                    if (jsonData.length > 0) {
                        // ... (Transformation logic reused or duplicated?)
                        // Since CSV is simple, we can just process it here or assume the transformation logic below can be function-ized.
                        // For simplicity, let's process it right here to reuse the final save block logic which we'll need to adapt.

                        // Note: We need to standardize how we process rows to avoid code duplication with the Excel loop.
                        // Let's create a helper function inside handleFileSelect or just process it.
                    }
                    // For CSV, we just create one sheet named "Planilha 1"
                    // But wait, the existing code below (lines 75+) processes `jsonData`.
                    // We need to support MULTIPLE `jsonData` arrays now.
                }
            } else {
                // Handle Excel files with ExcelJS
                const workbook = new ExcelJS.Workbook();
                await workbook.xlsx.load(buffer);

                // Iterate over ALL sheets
                workbook.eachSheet((worksheet, sheetId) => {
                    const currentSheetRows: any[] = [];

                    // --- Smart Header Detection ---
                    let bestHeaderRow = 1;
                    let maxScore = -1;
                    let bestHeaders: string[] = [];

                    // Scan first 50 rows to find the best header candidate
                    for (let r = 1; r <= Math.min(50, worksheet.rowCount); r++) {
                        const row = worksheet.getRow(r);
                        if (row.actualCellCount === 0) continue;

                        let score = 0;
                        let rowHeaders: string[] = [];
                        let nonEmptyCount = 0;

                        row.eachCell((cell, colNumber) => {
                            const val = cell.value?.toString().toLowerCase().trim() || "";
                            if (val) nonEmptyCount++;

                            // Boost score for known keywords
                            if (val.includes("data") || val.includes("date")) score += 2;
                            if (val.includes("status") || val.includes("estado")) score += 2;
                            if (val.includes("valor") || val.includes("montante") || val.includes("amount") || val.includes("total")) score += 2;
                            if (val.includes("nome") || val.includes("name") || val.includes("responsavel")) score += 2;
                            if (val.includes("chamado") || val.includes("caso") || val.includes("id")) score += 2;

                            // Penalty for numbers (headers are usually text)
                            if (/^\d+$/.test(val)) score -= 1;

                            rowHeaders[colNumber] = cell.value?.toString() || `Column${colNumber}`;
                        });

                        // Base score: density
                        score += nonEmptyCount;

                        if (score > maxScore) {
                            maxScore = score;
                            bestHeaderRow = r;
                            bestHeaders = rowHeaders;
                        }
                    }

                    // Fill sparse array gaps in bestHeaders
                    for (let i = 1; i < bestHeaders.length; i++) {
                        if (!bestHeaders[i]) bestHeaders[i] = `Column${i}`;
                    }

                    // Fallback to Row 1 if nothing reasonable found
                    if (maxScore <= 0) {
                        const row = worksheet.getRow(1);
                        row.eachCell((cell, colNumber) => {
                            bestHeaders[colNumber] = cell.value?.toString() || `Column${colNumber}`;
                        });
                        bestHeaderRow = 1;
                    }

                    // Extract Data using the Best Header Row
                    worksheet.eachRow((row, rowNumber) => {
                        if (rowNumber > bestHeaderRow) {
                            const rowData: any = {};
                            let hasData = false;

                            row.eachCell((cell, colNumber) => {
                                const header = bestHeaders[colNumber];
                                if (header) {
                                    let cellValue: any = cell.value;
                                    // Handle formulas
                                    if (cellValue && typeof cellValue === 'object' && 'result' in cellValue) {
                                        cellValue = cellValue.result;
                                    }
                                    // Handle rich text
                                    if (cellValue && typeof cellValue === 'object' && 'richText' in cellValue) {
                                        cellValue = (cellValue as any).richText.map((rt: any) => rt.text).join('');
                                    }

                                    rowData[header] = cellValue;

                                    // Check if truly non-empty
                                    if (cellValue !== null && cellValue !== undefined && String(cellValue).trim() !== '') {
                                        hasData = true;
                                    }
                                }
                            });

                            if (hasData) {
                                currentSheetRows.push(rowData);
                            }
                        }
                    });

                    // Always keep the sheet unless it's completely empty AND nameless? 
                    // No, existing logic was to keep if headers found. Now we always try to find something.
                    if (currentSheetRows.length >= 0) {
                        sheetsData[worksheet.name] = {
                            data: currentSheetRows,
                            headers: bestHeaders.filter(h => h && h.trim() !== '')
                        };
                    }
                });
            }

            // If CSV, `jsonData` is populated, but `sheetsData` is empty.
            // If Excel, `sheetsData` is populated, `jsonData` is empty.
            // Let's unify.
            if (jsonData.length > 0) {
                // It was a CSV
                sheetsData["Planilha 1"] = { data: jsonData, headers: Object.keys(jsonData[0] || {}) };
            }

            // Now Process Each Sheet in sheetsData
            const finalSheets: Record<string, { data: any[], headers: string[] }> = {};
            let globalHasData = false;

            Object.keys(sheetsData).forEach(sheetName => {
                const sheetRows = sheetsData[sheetName].data;
                // REMOVED: if (sheetRows.length === 0) return; // Keep empty sheets for tabs!

                // Transformation Logic (replicated from original)
                const transformedData = sheetRows.map((row: any, index: number) => {
                    const newRow: any = { ...row };

                    // Normalize standard columns if they exist, but don't force them
                    const findKey = (candidates: string[]) => Object.keys(row).find(k => candidates.some(c => k.toLowerCase().trim() === c.toLowerCase().trim()));

                    // Ensure we have a "Chamado" or ID field for links
                    // User Request: Always use the FIRST item (column) as the ID/Chamado logic.
                    const rowKeys = Object.keys(row);
                    const firstKey = rowKeys.length > 0 ? rowKeys[0] : null;

                    if (firstKey) {
                        newRow["Chamado"] = row[firstKey];
                    } else {
                        // Fallback
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
                            // 3. Check for ISO Date with Time
                            else if (strDate.match(/^\d{4}-\d{2}-\d{2}T/)) {
                                const dateObj = new Date(strDate);
                                if (!isNaN(dateObj.getTime())) {
                                    const day = String(dateObj.getDate()).padStart(2, '0');
                                    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
                                    const year = dateObj.getFullYear();
                                    newRow[key] = `${day}/${month}/${year}`;
                                }
                            }
                        }
                    });

                    return newRow;
                });

                // Headers Logic
                const allKeys = Array.from(new Set(transformedData.flatMap(row => Object.keys(row))));
                const originalKeys = Object.keys(sheetRows[0] || {});
                const hasOriginalChamado = originalKeys.some(k => k.trim().toLowerCase() === "chamado");

                const visibleHeaders = allKeys.filter(k => {
                    if (k === "Chamado" && !hasOriginalChamado) return false;
                    return true;
                });

                const sortedHeaders = Array.from(new Set([
                    ...originalKeys.filter(k => visibleHeaders.includes(k)),
                    ...visibleHeaders.filter(k => !originalKeys.includes(k))
                ]));

                finalSheets[sheetName] = { data: transformedData, headers: sortedHeaders };
                globalHasData = true;
            });

            if (globalHasData) {
                // Save to Database (We'll save the PRIMARY/FIRST sheet to DB for now, or need API update)
                // Since this is a "Fake" DB save (mock), we can just save the metadata or first sheet.
                // Or we can construct a "merged" row set for the DB? 
                // For now, let's just save the file metadata and use `setSheets` for local state.

                // Note: The /api/files endpoint might expect `rows`. We'll send the FIRST sheet's rows.
                // Flatten all sheets into a single array for DB persistence
                // We add a "__sheetName__" property to each row so we can reconstruct them later
                const allRowsForDB: any[] = [];

                Object.keys(finalSheets).forEach(sheetName => {
                    const rows = finalSheets[sheetName].data;
                    const rowsWithMeta = rows.map(r => ({ ...r, __sheetName__: sheetName }));
                    allRowsForDB.push(...rowsWithMeta);
                });

                try {
                    const response = await fetch('/api/files', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            name: file.name,
                            size: file.size,
                            rows: allRowsForDB // Saving ALL sheets with metadata
                        })
                    });

                    if (!response.ok) throw new Error("Falha ao salvar no banco");

                    const savedFile = await response.json();

                    toast.success("Arquivo Processado", "Os dados foram importados com sucesso.");

                    // NEW: Use setSheets instead of setFileData
                    setSheets(finalSheets, file.name, savedFile.id);

                } catch (dbError) {
                    console.error("Erro de persistência:", dbError);
                    toast.error("Erro ao Salvar", "Falha ao salvar no banco, mas carregando visualização...");
                    // Fallback local load
                    setSheets(finalSheets, file.name, "local-id");
                }

                router.push("/editor");
            } else {
                toast.error("Arquivo Vazio", "O arquivo selecionado não contém dados.");
            }
        } catch (error) {
            console.error("Erro ao ler arquivo:", error);
            toast.error("Erro de Leitura", "Falha ao processar o arquivo. Verifique se é válido.");
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
        <div className="space-y-4 p-8 max-w-7xl mx-auto">
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
