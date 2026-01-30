
import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/simple-toast";
import ExcelJS from "exceljs";

export function useFileHandler() {
    const { setSheets } = useAppStore();
    const router = useRouter();
    const toast = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const handleFileSelect = async (file: File) => {
        setIsLoading(true);
        try {
            const buffer = await file.arrayBuffer();
            let jsonData: any[] = [];
            const sheetsData: Record<string, { data: any[], headers: string[] }> = {};

            // Handle CSV files
            if (file.name.endsWith(".csv") || file.type === "text/csv") {
                const textDecoder = new TextDecoder("utf-8");
                const text = textDecoder.decode(buffer);
                const lines = text.split('\n').filter(line => line.trim());
                if (lines.length > 0) {
                    const firstLine = lines[0];
                    const separator = (firstLine.match(/;/g) || []).length > (firstLine.match(/,/g) || []).length ? ';' : ',';
                    const cleanStr = (s: string) => s.trim().replace(/^"|"$/g, '').trim();

                    const headers = firstLine.split(separator).map(h => cleanStr(h));
                    jsonData = lines.slice(1).map(line => {
                        const values = line.split(separator);
                        const row: any = {};
                        headers.forEach((header, index) => {
                            let val = values[index] || '';
                            val = cleanStr(val);
                            row[header] = val;
                        });
                        return row;
                    });
                }
            } else {
                // Handle Excel files
                const workbook = new ExcelJS.Workbook();
                await workbook.xlsx.load(buffer);

                workbook.eachSheet((worksheet, sheetId) => {
                    const worksheetName = worksheet.name;
                    if (worksheet) {
                        const currentSheetRows: any[] = [];
                        
                        // Smart CSV Detection
                        const firstRow = worksheet.getRow(1);
                        const firstCellText = firstRow.getCell(1).text || "";
                        const semicolonCount = (firstCellText.match(/;/g) || []).length;
                        const looksLikeSemicolonCSV = semicolonCount >= 3 || (semicolonCount >= 1 && firstCellText.includes(";") && (!firstRow.getCell(2).text?.trim()));

                        if (looksLikeSemicolonCSV) {
                            const cleanStr = (s: string) => s.trim().replace(/^"|"$/g, '').trim();
                            const headers = firstCellText.split(";").map(h => cleanStr(h));

                            worksheet.eachRow((row, rowNumber) => {
                                if (rowNumber === 1) return;
                                const rowContent = row.getCell(1).text || "";
                                if (!rowContent.trim()) return;
                                const values = rowContent.split(";");
                                const rowObject: any = {};
                                headers.forEach((header, index) => {
                                    rowObject[header] = cleanStr(values[index] || '');
                                });
                                currentSheetRows.push(rowObject);
                            });

                            if (currentSheetRows.length >= 0) {
                                sheetsData[worksheetName] = {
                                    data: currentSheetRows,
                                    headers: headers.filter(h => h && h.trim() !== '')
                                };
                            }
                        } else {
                            // Standard Excel Parsing
                            let bestHeaderRow = 1;
                            let maxScore = -1;
                            let bestHeaders: string[] = [];

                            for (let r = 1; r <= Math.min(50, worksheet.rowCount); r++) {
                                const row = worksheet.getRow(r);
                                if (row.actualCellCount === 0) continue;
                                let score = 0;
                                let rowHeaders: string[] = [];
                                let nonEmptyCount = 0;

                                row.eachCell((cell, colNumber) => {
                                    const val = cell.value?.toString().toLowerCase().trim() || "";
                                    if (val) nonEmptyCount++;
                                    if (val.includes("data") || val.includes("date") || val.includes("status") || val.includes("valor")) score += 2;
                                    rowHeaders[colNumber] = cell.value?.toString() || `Column${colNumber}`;
                                });
                                score += nonEmptyCount;

                                if (score > maxScore) {
                                    maxScore = score;
                                    bestHeaderRow = r;
                                    bestHeaders = rowHeaders;
                                }
                            }

                            for (let i = 1; i < bestHeaders.length; i++) {
                                if (!bestHeaders[i]) bestHeaders[i] = `Column${i}`;
                            }
                            if (maxScore <= 0) {
                                const row = worksheet.getRow(1);
                                row.eachCell((cell, colNumber) => {
                                    bestHeaders[colNumber] = cell.value?.toString() || `Column${colNumber}`;
                                });
                                bestHeaderRow = 1;
                            }

                            worksheet.eachRow((row, rowNumber) => {
                                if (rowNumber > bestHeaderRow) {
                                    const rowData: any = {};
                                    let hasData = false;
                                    row.eachCell((cell, colNumber) => {
                                        const header = bestHeaders[colNumber];
                                        if (header) {
                                            let cellValue: any = cell.value;
                                            if (cellValue && typeof cellValue === 'object') {
                                                if ('result' in cellValue) cellValue = cellValue.result;
                                                else if ('text' in cellValue) cellValue = cellValue.text;
                                                else if ('richText' in cellValue) cellValue = (cellValue as any).richText.map((rt: any) => rt.text).join('');
                                                else cellValue = String(cellValue);
                                            }
                                            rowData[header] = cellValue;
                                            if (cellValue !== null && cellValue !== undefined && String(cellValue).trim() !== '') hasData = true;
                                        }
                                    });
                                    if (hasData) currentSheetRows.push(rowData);
                                }
                            });

                            if (currentSheetRows.length >= 0) {
                                sheetsData[worksheetName] = {
                                    data: currentSheetRows,
                                    headers: bestHeaders.filter(h => h && h.trim() !== '')
                                };
                            }
                        }
                    }
                });
            }

            if (jsonData.length > 0) {
                sheetsData["Planilha 1"] = { data: jsonData, headers: Object.keys(jsonData[0] || {}) };
            }

            const finalSheets: Record<string, { data: any[], headers: string[] }> = {};
            let globalHasData = false;

            Object.keys(sheetsData).forEach(sheetName => {
                const sheetRows = sheetsData[sheetName].data;
                const transformedData = sheetRows.map((row: any, index: number) => {
                    const newRow: any = { ...row };
                    const rowKeys = Object.keys(row);
                    const firstKey = rowKeys.length > 0 ? rowKeys[0] : null;

                    if (firstKey) {
                        newRow["Chamado"] = row[firstKey];
                    } else {
                        let year = new Date().getFullYear();
                        const padIndex = String(index + 1).padStart(3, '0');
                        newRow["Chamado"] = `CS-${year}-${padIndex}`;
                    }

                    Object.keys(newRow).forEach(key => {
                        const lowerKey = key.toLowerCase();
                        if (lowerKey.includes("data") || lowerKey === "vencimento") {
                            let rawDate = newRow[key];
                            const strDate = String(rawDate).trim();
                            if (!isNaN(parseFloat(strDate)) && parseFloat(strDate) > 20000 && strDate.match(/^\d+(\.\d+)?$/)) {
                                const dateObj = new Date((parseFloat(strDate) - 25569) * 86400 * 1000 + 43200000);
                                newRow[key] = dateObj.toLocaleDateString("pt-BR");
                            } else if (strDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
                                const [year, month, day] = strDate.split('-');
                                newRow[key] = `${day}/${month}/${year}`;
                            } else if (strDate.match(/^\d{4}-\d{2}-\d{2}T/)) {
                                const dateObj = new Date(strDate);
                                newRow[key] = dateObj.toLocaleDateString("pt-BR");
                            }
                        }
                    });

                    return newRow;
                });

                const allKeys = Array.from(new Set(transformedData.flatMap(row => Object.keys(row))));
                const originalKeys = Object.keys(sheetRows[0] || {});
                const hasOriginalChamado = originalKeys.some(k => k.trim().toLowerCase() === "chamado");
                const visibleHeaders = allKeys.filter(k => k !== "Chamado" || hasOriginalChamado);
                const sortedHeaders = Array.from(new Set([...originalKeys.filter(k => visibleHeaders.includes(k)), ...visibleHeaders]));

                finalSheets[sheetName] = { data: transformedData, headers: sortedHeaders };
                globalHasData = true;
            });

            if (globalHasData) {
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
                            rows: allRowsForDB
                        })
                    });

                    if (!response.ok) throw new Error("Falha ao salvar no banco");

                    const savedFile = await response.json();
                    setSheets(finalSheets, file.name, savedFile.id);
                    toast.success("Arquivo Processado", "Os dados foram importados com sucesso.");
                    router.push("/editor");
                } catch (dbError) {
                    console.error("Erro de persistência:", dbError);
                    toast.error("Erro ao Salvar", "Falha ao salvar no banco, mas carregando visualização...");
                    setSheets(finalSheets, file.name, "local-id");
                    router.push("/editor");
                }
            } else {
                toast.error("Arquivo Vazio", "O arquivo selecionado não contém dados.");
            }

        } catch (error) {
            console.error("Erro ao ler arquivo:", error);
            toast.error("Erro de Leitura", "Falha ao processar o arquivo.");
        } finally {
            setIsLoading(false);
        }
    };

    return { handleFileSelect, isLoading };
}
