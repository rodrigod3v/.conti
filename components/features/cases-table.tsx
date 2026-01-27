"use client";

import { useAppStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

export function CasesTable() {
    const { fileData, headers } = useAppStore();

    if (!fileData || fileData.length === 0) {
        return (
            <Card className="col-span-1 border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                    <p>Nenhum dado carregado.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="col-span-1 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Todos os Casos</CardTitle>
                    <p className="text-sm text-muted-foreground">Lista completa dos casos importados.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="ghost" className="text-sm">
                        Total: {fileData.length}
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[400px] w-full rounded-md border">
                    <div className="w-max min-w-full">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-muted-foreground uppercase bg-muted/30 sticky top-0 backdrop-blur-sm z-10">
                                <tr>
                                    {headers.map((header) => (
                                        <th key={header} className="px-4 py-2 font-medium whitespace-nowrap bg-muted/30">
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {fileData.map((row, index) => (
                                    <tr key={index} className="hover:bg-muted/20">
                                        {headers.map((header) => (
                                            <td key={`${index}-${header}`} className="px-4 py-2 whitespace-nowrap">
                                                {formatCell(row[header], header)}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <ScrollBar orientation="horizontal" />
                </ScrollArea>
            </CardContent>
        </Card>
    );
}

function formatCell(value: any, header: string) {
    if (value === null || value === undefined) return "";

    const headerLower = header.toLowerCase();
    const isDateColumn = headerLower.includes("data") || headerLower.includes("date") || headerLower.includes("dia") || headerLower.includes("prazo") || headerLower.includes("vencimento");

    // If it's a date column
    if (isDateColumn) {
        // Handle Excel serial numbers (approximate check for recent years)
        if (typeof value === "number" && value > 35000 && value < 60000) {
            const date = new Date(Math.round((value - 25569) * 86400 * 1000));
            // Adjust for timezone offset if needed, but usually formatting in UTC or local is enough.
            // Excel dates are often local.
            // Use simple string formatting to DD/MM/YYYY
            return date.toLocaleDateString("pt-BR");
        }

        // Handle ISO strings or other date strings
        const date = new Date(value);
        if (!isNaN(date.getTime()) && value.toString().length > 4) { // avoid formatting simple numbers like '2024' as a full date if not checking strictly
            return date.toLocaleDateString("pt-BR");
        }
    }

    return value.toString();
}
