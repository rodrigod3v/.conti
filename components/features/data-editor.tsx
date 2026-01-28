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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { isDropdownColumn, isDateColumn, isCurrencyColumn, isObservationColumn } from "@/lib/column-utils";
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
    ArrowDown,
    X,
    PlusCircle
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";
import { NewCaseWizard } from "@/components/features/new-case-wizard";

// --- Helper Components ---

const StatusBadge = ({ status }: { status: string }) => {
    // Normalizing status for comparison
    const s = status?.toString().toLowerCase().trim() || "";

    if (s.includes("pago") && !s.includes("parcial")) {
        return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-none">{status}</Badge>;
    }
    if (s.includes("parcialmente") || s.includes("parcial")) {
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-none">{status}</Badge>;
    }
    if (s.includes("cancelado")) {
        return <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-200 border-none">{status}</Badge>;
    }
    if (s === "pendente" || s.includes("aguardando")) {
        return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-none">{status}</Badge>;
    }
    if (s === "aprovado" || s === "concluído" || s === "concluido" || s === "resolvido" || s === "ok") {
        return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-none">{status}</Badge>;
    }
    if (s === "erro" || s === "missing") {
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-200 border-none">{status}</Badge>;
    }
    if (s.includes("análise") || s.includes("analise") || s.includes("andamento")) {
        return <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 border-none">{status}</Badge>;
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

    // Sync local state if prop value changes (e.g. from external update)
    useEffect(() => {
        setCurrentVal(String(value || ""));
    }, [value]);

    const handleSaveObs = () => {
        updateCell(globalIndex, header, currentVal);
        setIsOpen(false);
    };

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <div
                    className="text-xs text-foreground/80 block max-w-[200px] truncate cursor-pointer hover:bg-blue-50/50 hover:text-blue-700 rounded px-2 py-1 transition-colors border border-transparent hover:border-blue-100 min-h-[32px] flex items-center"
                    title="Clique para editar observação completa"
                >
                    {value ? value : <span className="text-muted-foreground/40 italic text-[10px]">Adicionar...</span>}
                </div>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-4 shadow-xl" align="start" side="bottom">
                <div className="space-y-3">
                    <div className="flex items-center justify-between border-b pb-2">
                        <h4 className="font-semibold leading-none text-sm text-foreground">Editar {header}</h4>
                        <span className="text-[10px] text-muted-foreground font-mono bg-muted px-1.5 py-0.5 rounded">
                            {currentVal.length} caracteres
                        </span>
                    </div>

                    <Textarea
                        value={currentVal}
                        onChange={(e) => setCurrentVal(e.target.value)}
                        className="min-h-[150px] resize-y text-xs leading-relaxed font-normal"
                        placeholder={`Digite ${header.toLowerCase()}...`}
                        autoFocus
                    />

                    <div className="flex justify-end gap-2 pt-2">
                        <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setIsOpen(false)}>Cancelar</Button>
                        <Button size="sm" className="h-7 text-xs bg-primary hover:bg-primary/90 text-primary-foreground" onClick={handleSaveObs}>Salvar</Button>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
};

// --- Editable Cell Logic ---
const EditableCell = ({
    row,
    rowIndex,
    header,
    globalIndex,
    updateCell,
    allUniqueValues
}: {
    row: any,
    rowIndex: number,
    header: string,
    globalIndex: number,
    updateCell: (index: number, key: string, value: any) => void,
    allUniqueValues: Record<string, string[]>
}) => {
    const value = row[header] || "";
    const headerLower = header.toLowerCase();

    // 1. Observation / Description - Popover Textarea
    if (isObservationColumn(header)) {
        return <ObservationCell value={value} globalIndex={globalIndex} header={header} updateCell={updateCell} />;
    }

    // 2. Dropdown Fields (Status, Nome, Cliente, Produto, Unidade)
    if (isDropdownColumn(header)) {
        const options = allUniqueValues[header] || [];
        return (
            <Select value={value} onValueChange={(val) => updateCell(globalIndex, header, val)}>
                <SelectTrigger className="h-8 w-full border-transparent hover:border-border focus:ring-1 focus:ring-primary/20 bg-transparent px-2 text-xs truncate text-left">
                    <SelectValue placeholder={value} />
                </SelectTrigger>
                <SelectContent>
                    {options.map((opt) => (
                        <SelectItem key={opt} value={opt} className="text-xs">{opt}</SelectItem>
                    ))}
                    {!options.includes(value) && value && <SelectItem value={value} className="text-xs">{value}</SelectItem>}
                </SelectContent>
            </Select>
        );
    }

    // 3. Date Input
    if (isDateColumn(header)) {
        let displayValue = value;
        const num = parseFloat(String(value));
        if (!isNaN(num) && num > 20000 && String(value).trim().match(/^\d+(\.\d+)?$/)) {
            try {
                const date = new Date((num - 25569) * 86400 * 1000 + 43200000);
                displayValue = format(date, "dd/MM/yyyy");
            } catch (e) { }
        }
        return (
            <div className="relative group min-w-[120px]">
                <Input
                    className="h-8 w-full border-transparent hover:border-border focus:border-primary focus:ring-1 focus:ring-primary/20 bg-transparent px-2 text-xs"
                    value={displayValue}
                    onChange={(e) => updateCell(globalIndex, header, e.target.value)}
                />
            </div>
        );
    }

    // 4. Money/Numeric Input
    if (isCurrencyColumn(header)) {
        return (
            <Input
                className="h-8 w-full border-transparent hover:border-border focus:border-primary focus:ring-1 focus:ring-primary/20 bg-transparent px-2 text-xs text-right font-mono min-w-[100px]"
                value={value}
                onChange={(e) => updateCell(globalIndex, header, e.target.value)}
            />
        );
    }

    // 5. Default Text Input
    return (
        <Input
            className="h-8 w-full border-transparent hover:border-border focus:border-primary focus:ring-1 focus:ring-primary/20 bg-transparent px-2 text-xs min-w-[150px]"
            value={value}
            onChange={(e) => updateCell(globalIndex, header, e.target.value)}
        />
    );
};

export function DataEditor() {
    // ... (DataEditor START) ...
    const { fileData, headers, fileName, updateCell, setFileData, clearData, deleteRow } = useAppStore();
    const [isSaving, setIsSaving] = useState(false);
    const tableContainerRef = useRef<HTMLDivElement>(null);
    const [isMounted, setIsMounted] = useState(false);
    const [isWizardOpen, setIsWizardOpen] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        const container = tableContainerRef.current;
        if (!container) return;

        const handleWheel = (e: WheelEvent) => {
            const scrollTarget = container.querySelector('[data-slot="table-container"]') || container;
            if (e.deltaY !== 0) {
                e.preventDefault();
                scrollTarget.scrollLeft += e.deltaY;
            }
        };
        container.addEventListener('wheel', handleWheel, { passive: false });
        return () => container.removeEventListener('wheel', handleWheel);
    }, []);

    // Redirect to Home if no file data (after hydration)
    const router = useRouter();

    useEffect(() => {
        if (isMounted && (!fileData || fileData.length === 0)) {
            router.push("/");
        }
    }, [fileData, router, isMounted]);

    const handleExit = () => {
        if (confirm("Tem certeza que deseja encerrar a edição? Os dados não salvos serão perdidos da visualização.")) {
            clearData();
            router.push("/");
        }
    };

    // Local state for UI
    const [searchTerm, setSearchTerm] = useState("");
    const [filterColumn, setFilterColumn] = useState<string>("all");
    const [filterValue, setFilterValue] = useState<string>("all");
    const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
    const itemsPerPage = 10;

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

    // Compute unique values for ALL columns to populate Dropdowns
    const allUniqueValues = useMemo(() => {
        const map: Record<string, string[]> = {};
        if (!fileData) return map;
        headers.forEach(h => {
            const values = new Set<string>();
            fileData.forEach(row => {
                const val = row[h];
                if (val !== undefined && val !== null && String(val).trim() !== "") {
                    values.add(String(val));
                }
            });
            map[h] = Array.from(values).sort();
        });
        return map;
    }, [fileData, headers]);

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
            data = data.filter(row => String(row[filterColumn]) === filterValue);
        }
        // Date Filter
        if (dateFilter) {
            const filterDateStr = format(dateFilter, "dd/MM/yyyy");
            data = data.filter(row => String(row["Data"]) === filterDateStr);
        }
        // Sorting
        if (sortConfig) {
            data.sort((a, b) => {
                const aValue = a[sortConfig.key];
                const bValue = b[sortConfig.key];
                if (aValue === bValue) return 0;
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
    const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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
        if (checked) newSelected.add(rowIndex);
        else newSelected.delete(rowIndex);
        setSelectedRows(newSelected);
    };

    const handleSort = (key: string) => {
        setSortConfig(current => {
            if (current?.key === key) {
                return current.direction === "asc" ? { key, direction: "desc" } : null;
            }
            return { key, direction: "asc" };
        });
    };

    const handleSave = async () => {
        const { fileId, fileData: currentFileData } = useAppStore.getState();
        if (!fileId) {
            alert("Erro: ID do arquivo não encontrado. Salve novamente ou reabra o arquivo.");
            return;
        }
        setIsSaving(true);
        try {
            const response = await fetch(`/api/files/${fileId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rows: currentFileData })
            });
            if (!response.ok) throw new Error("Falha ao salvar");

            // Offer to download the updated file immediately
            if (confirm("Alterações salvas na plataforma com sucesso!\n\nDeseja baixar uma cópia atualizada da planilha para o seu computador agora?")) {
                handleExport();
            } else {
                alert("Alterações salvas! Lembre-se de usar o botão 'Exportar' se precisar do arquivo atualizado em seu computador.");
            }
        } catch (error) {
            console.error("Erro ao salvar:", error);
            alert("Erro ao salvar alterações no banco de dados.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleExport = () => {
        if (!fileData || fileData.length === 0) return;
        const worksheet = XLSX.utils.json_to_sheet(fileData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Dados");
        const exportName = fileName ? `${fileName.replace(/\.[^/.]+$/, "")}_editado.xlsx` : "dados_exportados.xlsx";
        XLSX.writeFile(workbook, exportName);
    };



    // Helper to render specialized cells
    const renderCell = (header: string, row: any, rowIndex: number, globalIndex: number, colIndex: number) => {
        const headerLower = header.toLowerCase();

        // 0. First Column is ALWAYS the ID/Link (User Request)
        if (colIndex === 0) {
            // Priority: Chamado key (hidden internal), Case key, then header value
            const linkId = row["Chamado"] || row["Caso"] || row[header];
            const value = row[header];
            return (
                <Link href={`/cases/${linkId}`} className="font-medium text-blue-600 hover:underline hover:text-blue-800 line-clamp-1 block px-2 min-w-[120px]" title={String(value)}>
                    {value || "CS-Link"}
                </Link>
            );
        }

        // Special READ-ONLY Columns (Legacy checks, keeping explicitly for safety)
        if (headerLower === "chamado" || headerLower === "caso") {
            const value = row[header];
            return (
                <Link href={`/cases/${row["Chamado"] || row["Caso"] || value}`} className="font-medium text-blue-600 hover:underline hover:text-blue-800 line-clamp-1 block px-2 min-w-[120px]" title={String(value)}>
                    {value || "CS-Link"}
                </Link>
            );
        }

        // Editable Everything Else
        return <EditableCell row={row} rowIndex={rowIndex} header={header} globalIndex={globalIndex} updateCell={updateCell} allUniqueValues={allUniqueValues} />;
    };


    if (!fileData) return null;

    return (
        <div className="flex flex-col gap-4 max-h-[calc(100vh-6rem)] h-full">
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
                        Gerencie lançamentos contábeis de {fileName ? fileName.replace("lançamentos contábeis de ", "") : format(new Date(), "MMMM/yyyy", { locale: ptBR })}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" className="h-9 gap-2 text-muted-foreground hover:text-red-600 hover:bg-red-50" onClick={handleExit}>
                        <X className="h-4 w-4" />
                        Encerrar Edição
                    </Button>
                    <div className="w-[1px] h-6 bg-border mx-1" />
                    <Button variant="outline" className="h-9 gap-2" onClick={() => setIsWizardOpen(true)}>
                        <PlusCircle className="h-4 w-4" />
                        Novo Item
                    </Button>
                    <Button variant="outline" className="h-9 gap-2" onClick={handleExport}>
                        <Download className="h-4 w-4" />
                        Exportar Sheets
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="h-9 gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
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

            <NewCaseWizard open={isWizardOpen} onOpenChange={setIsWizardOpen} />

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
                                dateFilter && "text-accent-foreground border-accent-foreground/30 bg-accent"
                            )}>
                                <CalendarIcon className="h-4 w-4" />
                                {dateFilter ? format(dateFilter, "dd/MM/yyyy", { locale: ptBR }) : format(new Date(), "dd/MM/yyyy", { locale: ptBR })}
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
                                    const isNumeric = isCurrencyColumn(header);
                                    const isStatus = header.toLowerCase() === "status";

                                    // Custom widths for headers
                                    const isWide = isDropdownColumn(header) || isObservationColumn(header);

                                    return (
                                        <TableHead
                                            key={header}
                                            className={cn(
                                                "h-9 font-semibold text-xs uppercase tracking-wider text-muted-foreground/80 cursor-pointer hover:text-foreground transition-colors select-none bg-transparent",
                                                isNumeric && "text-right pr-6",
                                                isStatus && "text-center",
                                                isWide ? "min-w-[200px]" : "min-w-[120px]"
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
                                            {headers.map((header, colIndex) => (
                                                <TableCell key={`${globalIndex}-${header}`} className="py-1 h-9">
                                                    {renderCell(header, row, index, globalIndex, colIndex)}
                                                </TableCell>
                                            ))}
                                            <TableCell className="text-right pr-4 py-1 h-9">
                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity items-center">
                                                    {String(row["Status"]).toLowerCase() === "aprovado" ? (
                                                        <Check className="h-4 w-4 text-emerald-600" />
                                                    ) : (
                                                        <div className="flex items-center gap-1">
                                                            <Link href={`/cases/${row["Chamado"] || row["chamado"] || row["Caso"] || row["caso"]}`}>
                                                                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-blue-600">
                                                                    <Pencil className="h-3.5 w-3.5" />
                                                                </Button>
                                                            </Link>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-7 w-7 text-muted-foreground hover:text-red-600"
                                                                onClick={() => {
                                                                    if (confirm("Tem certeza que deseja excluir esta linha?")) {
                                                                        deleteRow(globalIndex);
                                                                    }
                                                                }}
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                            </Button>
                                                        </div>
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
                                        className={cn("h-8 w-8 text-xs", p === currentPage ? "bg-primary text-primary-foreground hover:bg-primary/90" : "")}
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
