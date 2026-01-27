"use client";

import { useState, useMemo, useEffect, useRef } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import {
    Save,
    Download,
    Search,
    Filter,
    Calendar as CalendarIcon,
    AlertCircle,
    Check,
    Pencil,
    Trash2,
    ChevronLeft,
    ChevronRight,
    ListFilter,
    ArrowUpDown,
    ArrowUp,
    ArrowDown
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";
import * as XLSX from "xlsx";

// --- Helper Components ---

const StatusBadge = ({ status }: { status: string }) => {
    // Normalizing status for comparison
    const s = status?.toString().toLowerCase().trim() || "";

    if (s === "pendente") {
        return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-none">Pendente</Badge>;
    }
    if (s === "aprovado") {
        return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-none">Aprovado</Badge>;
    }
    if (s === "resolvido") {
        return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-none">Resolvido</Badge>;
    }
    if (s === "erro" || s === "missing") {
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-200 border-none">Erro</Badge>;
    }
    if (s === "em análise" || s === "em analise") {
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-none">Em Análise</Badge>;
    }
    if (s === "cancelado") {
        return <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-200 border-none">Cancelado</Badge>;
    }

    return <Badge variant="secondary">{status}</Badge>;
};

const ActionsCell = ({ rowId }: { rowId: number }) => {
    return (
        <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                <Pencil className="h-4 w-4" />
            </Button>
            {/* Example: Only show Check if approved? Or maybe an action to approve? For now showing pencil only as per standard edit */}
        </div>
    );
};

// Mock data generator if store is empty (for dev/preview)
const generateMockData = () => {
    const statuses = ["Pendente", "Aprovado", "Erro", "Em Análise", "Pendente", "Erro", "Aprovado"];
    const names = ["Ana Souza", "Carlos Silva", "Mariana Luz", "João Paulo", "Pedro Santos", "Fernanda Lima", "Roberto Almeida", "Lúcia Ferreira"];

    return Array.from({ length: 15 }).map((_, i) => ({
        "Caso": `CS-2024-0${89 + i}`,
        "Responsável": names[i % names.length],
        "Data": i % 2 === 0 ? "12/05/2024" : "10/05/2024",
        "Status": statuses[i % statuses.length],
        "Valor (R$)": (Math.random() * 10000).toFixed(2),
    }));
};

const ObservationCell = ({ value, globalIndex, header, updateCell }: { value: string, globalIndex: number, header: string, updateCell: any }) => {
    const [currentVal, setCurrentVal] = useState(String(value || ""));
    const [isOpen, setIsOpen] = useState(false);

    const handleSaveObs = () => {
        updateCell(globalIndex, header, currentVal);
        setIsOpen(false);
    };

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <div
                    className="text-sm text-foreground/80 block max-w-[150px] truncate cursor-pointer hover:bg-muted/50 rounded px-1 py-0.5 transition-colors border border-transparent hover:border-border/40"
                    title="Clique para editar"
                >
                    {value || <span className="text-muted-foreground/50 italic text-xs">Adicionar obs...</span>}
                </div>
            </PopoverTrigger>
            <PopoverContent className="w-96 p-4">
                <div className="space-y-4">
                    <h4 className="font-medium leading-none text-sm text-muted-foreground">Editar Observação</h4>
                    <div className="relative">
                        <Input
                            value={currentVal}
                            onChange={(e) => setCurrentVal(e.target.value)}
                            maxLength={30}
                            className="h-9 pr-12"
                            placeholder="Digite a observação..."
                        />
                        <span className="absolute right-2 top-2.5 text-[10px] text-muted-foreground font-mono">
                            {currentVal.length}/30
                        </span>
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setIsOpen(false)}>Cancelar</Button>
                        <Button size="sm" className="h-7 text-xs bg-teal-700 hover:bg-teal-800 text-white" onClick={handleSaveObs}>Salvar</Button>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
};

export function DataEditor() {
    const { fileData, headers, fileName, updateCell, setFileData } = useAppStore();
    const [isSaving, setIsSaving] = useState(false);
    const tableContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = tableContainerRef.current;
        if (!container) return;

        const handleWheel = (e: WheelEvent) => {
            // Find the actual scrollable element (shadcn Table wrapper)
            const scrollTarget = container.querySelector('[data-slot="table-container"]') || container;

            if (e.deltaY !== 0) {
                // If scrolling vertically, convert to horizontal for the table
                e.preventDefault();
                scrollTarget.scrollLeft += e.deltaY;
            }
        };

        container.addEventListener('wheel', handleWheel, { passive: false });

        return () => {
            container.removeEventListener('wheel', handleWheel);
        };
    }, []);

    // Local state for UI
    const [searchTerm, setSearchTerm] = useState("");
    const [filterColumn, setFilterColumn] = useState<string>("all");
    const [filterValue, setFilterValue] = useState<string>("all");
    const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
    const itemsPerPage = 15;

    // Load mock data if empty (For Verification Purpose)
    // Removed auto-mock to avoid user confusion.
    // useEffect(() => {
    //     if (!fileData || fileData.length === 0) {
    //         const mock = generateMockData();
    //         // Infer headers from first row
    //         const mockHeaders = Object.keys(mock[0]);
    //         setFileData(mock, mockHeaders, "lançamentos contábeis de Maio/2024");
    //     }
    // }, [fileData, setFileData]);

    // Computed Data
    const uniqueValues = useMemo(() => {
        if (filterColumn === "all") return [];
        const values = new Set<string>();
        fileData.forEach(row => {
            if (row[filterColumn]) {
                values.add(String(row[filterColumn]));
            }
        });
        return Array.from(values).sort();
    }, [fileData, filterColumn]);

    const errorCount = useMemo(() => {
        return fileData.filter(row =>
            String(row["Status"]).toLowerCase() === "erro" ||
            String(row["Status"]).toLowerCase() === "missing"
        ).length;
    }, [fileData]);

    const filteredData = useMemo(() => {
        let data = fileData;

        // Search
        if (searchTerm) {
            const lowerSearch = searchTerm.toLowerCase();
            data = data.filter(row =>
                Object.values(row).some(val => {
                    const strVal = String(val).toLowerCase();
                    if (strVal.includes(lowerSearch)) return true;

                    // Check formatted number/currency
                    const num = parseFloat(String(val).replace("R$", "").replace(".", "").replace(",", "."));
                    if (!isNaN(num)) {
                        const formatted = new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2 }).format(num);
                        if (formatted.includes(lowerSearch)) return true;
                    }

                    return false;
                })
            );
        }

        // Column Filter
        if (filterColumn !== "all" && filterValue !== "all") {
            data = data.filter(row =>
                String(row[filterColumn]) === filterValue
            );
        }

        // Date Filter
        if (dateFilter) {
            const filterDateStr = format(dateFilter, "dd/MM/yyyy");
            data = data.filter(row => {
                // Assuming format dd/MM/yyyy in data
                return String(row["Data"]) === filterDateStr;
            });
        }

        // Sorting
        if (sortConfig) {
            data.sort((a, b) => {
                const aValue = a[sortConfig.key];
                const bValue = b[sortConfig.key];

                if (aValue === bValue) return 0;

                // Handle numbers disguised as strings
                const aNum = parseFloat(String(aValue).replace("R$", "").replace(".", "").replace(",", "."));
                const bNum = parseFloat(String(bValue).replace("R$", "").replace(".", "").replace(",", "."));

                if (!isNaN(aNum) && !isNaN(bNum)) {
                    return sortConfig.direction === "asc" ? aNum - bNum : bNum - aNum;
                }

                const aStr = String(aValue).toLowerCase();
                const bStr = String(bValue).toLowerCase();

                if (aStr < bStr) return sortConfig.direction === "asc" ? -1 : 1;
                if (aStr > bStr) return sortConfig.direction === "asc" ? 1 : -1;
                return 0;
            });
        }

        return data;
    }, [fileData, searchTerm, filterColumn, filterValue, dateFilter, sortConfig]);

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const paginatedData = filteredData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            const allIndices = new Set(paginatedData.map((_, idx) => (currentPage - 1) * itemsPerPage + idx));
            setSelectedRows(allIndices);
        } else {
            setSelectedRows(new Set());
        }
    };

    const handleSelectRow = (rowIndex: number, checked: boolean) => {
        const newSelected = new Set(selectedRows);
        if (checked) {
            newSelected.add(rowIndex);
        } else {
            newSelected.delete(rowIndex);
        }
        setSelectedRows(newSelected);
        setSelectedRows(newSelected);
    };

    const handleSort = (key: string) => {
        setSortConfig(current => {
            if (current?.key === key) {
                return current.direction === "asc"
                    ? { key, direction: "desc" }
                    : null;
            }
            return { key, direction: "asc" };
        });
    };

    const handleSave = async () => {
        setIsSaving(true);
        // Simulate save
        await new Promise(resolve => setTimeout(resolve, 1000));
        alert("Alterações salvas (Simulação)");
        setIsSaving(false);
    };

    const handleExport = () => {
        if (!fileData || fileData.length === 0) return;

        const worksheet = XLSX.utils.json_to_sheet(fileData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Dados");

        // Generate filename
        const exportName = fileName ? `${fileName.replace(/\.[^/.]+$/, "")}_editado.xlsx` : "dados_exportados.xlsx";
        XLSX.writeFile(workbook, exportName);
    };

    // Helper to render specialized cells
    const renderCell = (header: string, row: any, rowIndex: number, globalIndex: number) => {
        const value = row[header];
        const headerLower = header.toLowerCase();

        if (headerLower === "chamado" || headerLower === "caso") {
            const displayValue = value || "Link";
            return (
                <Link href={`/cases/${row["Chamado"] || row["Caso"] || value}`} className="font-medium text-blue-600 hover:underline hover:text-blue-800 line-clamp-1 block" title={String(value)}>
                    {value}
                </Link>
            );
        }

        if (headerLower === "observações" || headerLower === "observacoes") {
            // Interactive observation cell
            return <ObservationCell value={value} globalIndex={globalIndex} header={header} updateCell={updateCell} />;
        }

        if (headerLower === "status") {
            return (
                <div className="flex items-center justify-center">
                    <StatusBadge status={String(value)} />
                </div>
            );
        }

        if (headerLower === "responsável" || headerLower === "responsavel") {
            return (
                <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${value}`} />
                        <AvatarFallback>{String(value).substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-sm">{value}</span>
                </div>
            );
        }

        if (headerLower.includes("data")) {
            const num = parseFloat(String(value));
            // Check if it's an Excel serial date (usually > 30000 for recent dates)
            if (!isNaN(num) && num > 20000) {
                // Convert Excel serial date to JS Date
                const date = new Date((num - 25569) * 86400 * 1000 + 43200000);
                return <span className="text-sm text-foreground/80">{format(date, "dd/MM/yyyy")}</span>;
            }
        }

        if (headerLower.includes("valor") || headerLower.includes("montante")) {
            const num = parseFloat(String(value).replace("R$", "").replace(".", "").replace(",", "."));
            const display = isNaN(num) ? value :
                new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2 }).format(num);

            const isError = String(row["Status"]).toLowerCase() === "erro";
            const colorClass = isError && num < 0 ? "text-red-500 font-bold" : "";

            return (
                <div className={`flex items-center justify-end gap-2 text-right font-mono ${colorClass}`}>
                    <span>{display}</span>
                    {isError && <AlertCircle className="h-4 w-4 text-red-500" />}
                </div>
            );
        }

        return <span className="text-sm text-foreground/80 block max-w-[200px] truncate" title={String(value)}>{value}</span>;
    };


    if (!fileData) return null;

    return (
        <div className="h-[calc(100vh-100px)] flex flex-col gap-4">
            {/* Header Section */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between shrink-0">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <h1 className="text-xl font-bold tracking-tight">Editor de Dados</h1>
                        {errorCount > 0 && (
                            <div className="flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-600 ring-1 ring-inset ring-red-600/10">
                                <AlertCircle className="h-3 w-3" />
                                {errorCount} erros encontrados
                            </div>
                        )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Gerencie lançamentos contábeis de {fileName ? fileName.replace("lançamentos contábeis de ", "") : "Maio/2024"}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" className="h-9 gap-2" onClick={handleExport}>
                        <Download className="h-4 w-4" />
                        Exportar Sheets
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="h-9 gap-2 bg-teal-700 hover:bg-teal-800 text-white shadow-sm"
                    >
                        {isSaving ? (
                            "Salvando..."
                        ) : (
                            <>
                                <Save className="h-4 w-4" />
                                Salvar Alterações
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {/* Filters Section */}
            <div className="flex flex-col gap-3 rounded-lg border bg-card p-2 md:flex-row md:items-center bg-white shrink-0">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por caso, responsável ou valor..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 h-9 border-muted-foreground/20"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <div className="h-8 w-[1px] bg-border mx-2 hidden md:block" />

                    <Select value={filterColumn} onValueChange={(val) => { setFilterColumn(val); setFilterValue("all"); }}>
                        <SelectTrigger className="w-[180px] border-muted-foreground/20 h-9">
                            <div className="flex items-center gap-2">
                                <Filter className="h-4 w-4 text-muted-foreground" />
                                <SelectValue placeholder="Filtrar por..." />
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todas as colunas</SelectItem>
                            {headers.map(header => (
                                <SelectItem key={header} value={header}>{header}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {filterColumn !== "all" && (
                        <Select value={filterValue} onValueChange={setFilterValue}>
                            <SelectTrigger className="w-[180px] border-muted-foreground/20 h-9">
                                <div className="flex items-center gap-2">
                                    <ListFilter className="h-4 w-4 text-muted-foreground" />
                                    <SelectValue placeholder="Selecione valor..." />
                                </div>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos</SelectItem>
                                {uniqueValues.map(val => (
                                    <SelectItem key={val} value={val}>{val}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}

                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className={cn(
                                "h-9 border-muted-foreground/20 gap-2 font-normal text-muted-foreground",
                                dateFilter && "text-teal-700 border-teal-200 bg-teal-50"
                            )}>
                                <CalendarIcon className="h-4 w-4" />
                                {dateFilter ? format(dateFilter, "dd/MM/yyyy", { locale: ptBR }) : "Maio 2024"}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end">
                            <Calendar
                                mode="single"
                                selected={dateFilter}
                                onSelect={setDateFilter}
                                initialFocus
                                locale={ptBR}
                            />
                            {dateFilter && (
                                <div className="p-3 border-t bg-muted/20">
                                    <Button
                                        variant="ghost"
                                        className="w-full text-xs h-8 text-muted-foreground hover:text-red-600"
                                        onClick={() => setDateFilter(undefined)}
                                    >
                                        Limpar filtro
                                    </Button>
                                </div>
                            )}
                        </PopoverContent>
                    </Popover>

                    {errorCount > 0 && (
                        <Button variant="outline" className="h-9 border-red-200 bg-red-50 text-red-600 hover:bg-red-100 gap-2">
                            <AlertCircle className="h-4 w-4" />
                            Erros ({errorCount})
                        </Button>
                    )}
                </div>
            </div>

            {/* Table Section */}
            <div className="rounded-lg border bg-white shadow-sm flex flex-col flex-1 min-h-0 overflow-hidden">
                <div
                    ref={tableContainerRef}
                    className="flex-1 overflow-auto relative scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
                >
                    <Table>
                        <TableHeader className="bg-gray-50/95 sticky top-0 z-20 shadow-sm backdrop-blur-sm">
                            <TableRow className="hover:bg-transparent border-b border-gray-200">
                                <TableHead className="w-[40px] pl-4 bg-transparent">
                                    <Checkbox
                                        checked={paginatedData.length > 0 && selectedRows.size === paginatedData.length}
                                        onCheckedChange={(c) => handleSelectAll(c === true)}
                                    />
                                </TableHead>
                                {headers.map((header) => {
                                    const hLower = header.toLowerCase();
                                    const isNumeric = hLower.includes("valor") || hLower.includes("montante");
                                    const isStatus = hLower === "status";

                                    return (
                                        <TableHead
                                            key={header}
                                            className={cn(
                                                "h-9 font-semibold text-xs uppercase tracking-wider text-muted-foreground/80 cursor-pointer hover:text-foreground transition-colors select-none bg-transparent",
                                                isNumeric && "text-right pr-6",
                                                isStatus && "text-center"
                                            )}
                                            onClick={() => handleSort(header)}
                                        >
                                            <div className={cn("flex items-center gap-2", isNumeric && "justify-end", isStatus && "justify-center")}>
                                                {header}
                                            </div>
                                        </TableHead>
                                    );
                                })}
                                <TableHead className="text-right pr-4 bg-transparent w-[80px] h-12 text-xs uppercase tracking-wider font-semibold">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedData.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={headers.length + 2} className="h-24 text-center">
                                        Nenhum resultado encontrado.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedData.map((row, index) => {
                                    const globalIndex = (currentPage - 1) * itemsPerPage + index;
                                    const isSelected = selectedRows.has(globalIndex);
                                    const isError = String(row["Status"]).toLowerCase() === "erro" || String(row["Status"]).toLowerCase() === "missing";

                                    return (
                                        <TableRow
                                            key={globalIndex}
                                            className={`
                                            group transition-colors 
                                            hover:bg-blue-50/50
                                            even:bg-gray-50/30
                                            border-b border-gray-100
                                            ${isSelected ? "bg-blue-50/80 hover:bg-blue-100/80" : ""}
                                            ${isError ? "bg-red-50/30 hover:bg-red-50/50 border-l-2 border-l-red-500" : ""}
                                        `}
                                        >
                                            <TableCell className="pl-4 py-2">
                                                <Checkbox
                                                    checked={isSelected}
                                                    onCheckedChange={(c) => handleSelectRow(globalIndex, c === true)}
                                                />
                                            </TableCell>
                                            {headers.map((header) => (
                                                <TableCell key={`${globalIndex}-${header}`} className="py-1 h-9">
                                                    {renderCell(header, row, index, globalIndex)}
                                                </TableCell>
                                            ))}
                                            <TableCell className="text-right pr-4 py-1 h-9">
                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {String(row["Status"]).toLowerCase() === "aprovado" ? (
                                                        <Check className="h-4 w-4 text-emerald-600" />
                                                    ) : (
                                                        <Link href={`/cases/${row["Chamado"] || row["chamado"] || row["Caso"] || row["caso"]}`}>
                                                            <Pencil className="h-4 w-4 text-muted-foreground cursor-pointer hover:text-teal-600" />
                                                        </Link>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Footer / Pagination */}
                <div className="flex items-center justify-between border-t p-2 text-sm text-muted-foreground bg-white z-20 shrink-0">
                    <div>
                        Mostrando <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> a <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredData.length)}</span> de <span className="font-medium">{filteredData.length}</span> resultados
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="h-8 w-8"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <div className="flex items-center gap-1">
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                let p = currentPage;
                                if (totalPages <= 5) {
                                    p = i + 1;
                                } else if (currentPage <= 3) {
                                    p = i + 1;
                                } else if (currentPage >= totalPages - 2) {
                                    p = totalPages - 4 + i;
                                } else {
                                    p = currentPage - 2 + i;
                                }

                                // Safety check
                                if (p < 1 || p > totalPages) return null;

                                return (
                                    <Button
                                        key={p}
                                        variant={p === currentPage ? "default" : "ghost"}
                                        size="sm"
                                        className={cn("h-8 w-8 text-xs", p === currentPage ? "bg-teal-700 text-white hover:bg-teal-800" : "")}
                                        onClick={() => setCurrentPage(p)}
                                    >
                                        {p}
                                    </Button>
                                );
                            })}
                        </div>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="h-8 w-8"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
