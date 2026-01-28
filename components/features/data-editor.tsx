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
import { getFieldConfig, shouldFormatCurrency, isDropdownField, isDateField, isTextareaField } from "@/lib/field-config";
import { FieldConfiguration } from "@/components/features/field-configuration";
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
    ArrowDown,
    X,
    PlusCircle,
    ChevronDown,
    ChevronUp,
    ListFilter
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";
import { NewCaseWizard } from "@/components/features/new-case-wizard";
import { useToast } from "@/components/ui/simple-toast";

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
                    className="text-xs text-foreground/80 block max-w-[300px] cursor-pointer hover:bg-blue-50/50 hover:text-blue-700 rounded px-2 py-1 transition-colors border border-transparent hover:border-blue-100 min-h-[32px] flex items-center"
                    title="Clique para editar observação completa"
                >
                    {value ? (
                        <span>
                            {value.length > 30 ? value.substring(0, 30) + "..." : value}
                        </span>
                    ) : (
                        <span className="text-muted-foreground/40 italic text-[10px]">Adicionar...</span>
                    )}
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
    const fieldConfig = getFieldConfig(header);

    // 1. Observation / Description - Popover Textarea
    if (fieldConfig.type === 'textarea') {
        return <ObservationCell value={value} globalIndex={globalIndex} header={header} updateCell={updateCell} />;
    }

    // 2. Dropdown Fields
    if (fieldConfig.type === 'dropdown') {
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
    if (fieldConfig.type === 'date') {
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


    // 4. Money/Currency Input
    // We check strict equality to avoid loose matching issues
    if (fieldConfig.type === 'currency' || (fieldConfig.type === 'numeric' && fieldConfig.formatCurrency)) {
        const formatCurrency = (val: string) => {
            if (!val) return "";
            // Remove non-numeric except comma/dot/minus
            const clean = val.replace(/[^\d,\.-]/g, "");
            if (!clean) return "";

            // Try to parse standard JS float
            // BR format: 1.000,00 -> remove dots, replace comma with dot
            let normalized = clean;
            if (clean.includes(',') && clean.includes('.')) {
                normalized = clean.replace(/\./g, '').replace(',', '.');
            } else if (clean.includes(',')) {
                normalized = clean.replace(',', '.');
            }

            const floatVal = parseFloat(normalized);

            if (isNaN(floatVal)) return val;

            // Format to BRL style
            return floatVal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        };

        const handleCurrencyBlur = (val: string) => {
            const formatted = formatCurrency(val);
            if (formatted !== val) {
                updateCell(globalIndex, header, formatted);
            }
        };

        // If the value stored is raw number (e.g. from JSON), format it for display
        // If it's already formatted string, keep it.
        // We try to format on render if it looks unformatted
        let displayValue = value;
        if (value && !String(value).includes(',') && !isNaN(parseFloat(String(value)))) {
            displayValue = formatCurrency(String(value));
        }

        return (
            <Input
                className="h-8 w-full border-transparent hover:border-border focus:border-primary focus:ring-1 focus:ring-primary/20 bg-transparent px-2 text-xs text-right font-mono min-w-[100px]"
                defaultValue={displayValue} // Use defaultValue to allow editing
                onBlur={(e) => handleCurrencyBlur(e.target.value)}
                key={`${globalIndex}-${header}-${fieldConfig.type}`} // Force re-render on type change
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
    const toast = useToast();

    const [configVersion, setConfigVersion] = useState(0);

    useEffect(() => {
        setIsMounted(true);

        const handleConfigChange = () => {
            setConfigVersion(v => v + 1);
        };

        window.addEventListener('field-config-changed', handleConfigChange);
        return () => window.removeEventListener('field-config-changed', handleConfigChange);
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
        toast.action(
            "Tem certeza que deseja sair?",
            "Sim, Sair Agora",
            () => {
                clearData();
                router.push("/");
            },
            "Os dados não salvos serão perdidos."
        );
    };

    // Local state for UI
    const [searchTerm, setSearchTerm] = useState("");
    const [filterColumn, setFilterColumn] = useState<string>("all");
    const [filterValue, setFilterValue] = useState<string>("all");
    const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null);
    const [visibleCount, setVisibleCount] = useState(10);
    const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());

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

    const paginatedData = filteredData.slice(0, visibleCount);

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            const allIndices = new Set(paginatedData.map((_, idx) => idx));
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
            toast.error("Erro ao salvar", "ID do arquivo não encontrado. Salve novamente ou reabra o arquivo.");
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

            // Success Toast
            toast.success("Alterações salvas!", "Banco de dados atualizado com sucesso.");

            // Offer to download via Toast Action (Non-blocking)
            toast.action(
                "Baixar versão atualizada?",
                "Baixar Agora",
                () => handleExport(),
                "Mantenha seu arquivo local sincronizado."
            );

        } catch (error) {
            console.error("Erro ao salvar:", error);
            toast.error("Erro ao salvar", "Não foi possível persistir as alterações.");
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

                    <FieldConfiguration />

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
                                    const fieldConfig = getFieldConfig(header);
                                    const isNumeric = fieldConfig.type === 'currency';
                                    const isStatus = header.toLowerCase() === "status";

                                    // Custom widths for headers
                                    const isWide = fieldConfig.type === 'dropdown' || fieldConfig.type === 'textarea';
                                    const config = getFieldConfig(header);

                                    return (
                                        <TableHead
                                            key={header}
                                            className={cn(
                                                "min-w-[150px] px-2 py-3 text-xs font-semibold text-gray-700 select-none bg-transparent hover:bg-gray-100/50 transition-colors uppercase tracking-wider border-b-2 border-transparent hover:border-gray-200 cursor-pointer",
                                                config.color ? config.color : "",
                                                config.color ? "border-b-" + config.color.replace("bg-", "").replace("-100", "-300") : ""
                                            )}
                                            onClick={() => handleSort(header)}
                                        >
                                            <div className={cn("flex items-center gap-2", isNumeric && "justify-end", isStatus && "justify-center")}>
                                                {header}
                                                {/* Visual indicator for sort/color could go here */}
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
                                    const globalIndex = index;
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
                                            {headers.map((header, colIndex) => {
                                                const config = getFieldConfig(header);
                                                return (
                                                    <TableCell
                                                        key={`${globalIndex}-${header}`}
                                                        className={cn(
                                                            "py-1 h-9 border-r border-transparent",
                                                            config.color ? config.color.replace("100", "100/30") : ""
                                                        )}
                                                    >
                                                        {renderCell(header, row, index, globalIndex, colIndex)}
                                                    </TableCell>
                                                );
                                            })}
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
                                                                    toast.action(
                                                                        "Excluir item permanentemente?",
                                                                        "Sim, Excluir",
                                                                        () => {
                                                                            deleteRow(globalIndex);
                                                                            toast.success("Item excluído", "Registro removido com sucesso.");
                                                                        },
                                                                        "Esta ação não pode ser desfeita."
                                                                    );
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

                {/* Footer / Load More */}
                <div className="flex items-center justify-between border-t p-2 text-sm text-muted-foreground bg-white z-20 shrink-0 safe-area-bottom">
                    <div>
                        Mostrando <span className="font-medium">{paginatedData.length}</span> de <span className="font-medium">{filteredData.length}</span> resultados
                    </div>
                    <div className="flex items-center gap-2">
                        {visibleCount > 10 && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setVisibleCount(10)}
                                className="h-8 gap-2 text-xs"
                            >
                                <ChevronUp className="h-3.5 w-3.5" />
                                Recolher
                            </Button>
                        )}

                        {visibleCount < filteredData.length && (
                            <Button
                                variant="default"
                                size="sm"
                                onClick={() => setVisibleCount(prev => prev + 10)}
                                className="h-8 gap-2 text-xs bg-indigo-600 hover:bg-indigo-700"
                            >
                                <ChevronDown className="h-3.5 w-3.5" />
                                Ver mais 10
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
