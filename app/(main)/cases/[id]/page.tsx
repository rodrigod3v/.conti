"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight, ChevronUp } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
    ChevronLeft,
    Edit,
    CheckCircle,
    History,
    Paperclip,
    Plus,
    MessageSquare,
    Send,
    MoreVertical,
    FileSpreadsheet,
    FileText,
    Download,
    Eye,
    Info,
    Smile,
    AtSign,
    Save,
    Calendar as CalendarIcon,
    Wallet,
    Briefcase,
    FileText as FileTextIcon,
    AlignLeft,

} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getFieldConfig, shouldFormatCurrency, isDropdownField, isDateField, isTextareaField } from "@/lib/field-config";




import { useToast } from "@/components/ui/simple-toast";
import { useAppStore } from "@/lib/store";
import { useMemo, useState, useEffect } from "react";

export default function CaseDetailsPage() {
    const params = useParams();
    const caseId = decodeURIComponent(params.id as string);
    const { fileData, headers, updateCell, comments, addComment } = useAppStore();
    const [isEditOpen, setIsEditOpen] = useState(false);
    const toast = useToast();
    // ...

    // Comment State
    const [newComment, setNewComment] = useState("");

    // Edit State - Dynamic form for all fields
    const [editForm, setEditForm] = useState<Record<string, string>>({});
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);


    const caseData = useMemo(() => {
        // Helper to find the actual column name from candidates
        const findKey = (r: any, ...candidates: string[]): string | null => {
            for (const candidate of candidates) {
                // Exact match first
                if (r[candidate] !== undefined) return candidate;

                // Case-insensitive match
                const normalized = candidate.trim().toLowerCase();
                const found = Object.keys(r).find(k => k.trim().toLowerCase() === normalized);
                if (found) return found;
            }
            return null;
        };

        // Helper to get value using findKey
        const getValue = (r: any, ...keys: string[]) => {
            const key = findKey(r, ...keys);
            return key ? r[key] : null;
        };

        const rowIndex = fileData.findIndex(r => {
            // Priority 1: Check known ID columns
            const id = getValue(r, "Caso", "Chamado", "caso", "chamado");
            if (id && String(id) === caseId) return true;

            // Priority 2: Check the FIRST column (often the ID in spreadsheets)
            if (headers.length > 0) {
                const firstColValue = r[headers[0]];
                if (firstColValue && String(firstColValue) === caseId) return true;
            }

            return false;
        });

        if (rowIndex === -1) return null;
        const row = fileData[rowIndex];

        // Track source keys for all standard fields
        const clientKey = findKey(row, "Empresa", "empresa", "Cliente", "cliente", "Nome do Fornecedor", "Fornecedor");
        const responsibleKey = findKey(row, "Responsável", "responsavel", "Usuario", "usuario", "Area Responsavel");
        const openedAtKey = findKey(row, "Data", "data", "Data Abertura");
        const dueDateKey = findKey(row, "Data Vencimento", "vencimento");
        const statusKey = findKey(row, "Status", "status");

        // Expanded value field matchers - includes "Valor Total", "Total", "Valor Bruto"
        const valueKey = findKey(row,
            "Valor (R$)", "Valor", "valor", "montante", "Montante",
            "Valor Total", "valor total", "Total", "total", "Valor Bruto", "valor bruto"
        );
        const netValueKey = findKey(row, "Valor Liquido", "valor liquido", "Valor Líquido");
        const paymentMethodKey = findKey(row,
            "Forma de Pagamento", "forma pagamento", "Forma Pagto", "Metodo Pagamento", "FORMA DE PGTO"
        );

        // Other financial keys
        const pccKey = findKey(row, "PCC", "pcc");
        const irKey = findKey(row, "IR", "ir", "IRRF", "Imposto de Renda");
        const issBaseKey = findKey(row, "Base ISS", "base iss");

        // Period/Exercise
        const periodKey = findKey(row, "Exercicio", "exercicio", "Periodo", "periodo");

        // Description field
        const descriptionField = findKey(row, "Inconsistencias", "inconsistencias", "Descrição", "descricao", "Observações", "observacoes") || "Inconsistencias";

        // Build tracked keys set for "Outros Campos" exclusion
        const trackedKeys = [
            clientKey, responsibleKey, openedAtKey, dueDateKey, statusKey,
            valueKey, netValueKey, paymentMethodKey, pccKey, irKey, issBaseKey,
            periodKey, descriptionField
        ].filter(Boolean); // Remove nulls

        // Dynamic Fields (Outros Campos) - use strict key-based exclusions
        const otherFields: { label: string, value: string }[] = [];
        Object.keys(row).forEach(key => {
            // Exclude tracked keys
            if (trackedKeys.includes(key)) return;

            // Exclude ID fields
            const lower = key.toLowerCase();
            if (lower === "id" || lower === "chamado" || lower === "caso") return;
            if (lower.includes(" id ") || lower.startsWith("id ") || lower.endsWith(" id")) return;

            const val = row[key];
            if (val !== undefined && val !== null && String(val).trim() !== "") {
                let displayVal = String(val);

                // Try to format if it's a date field
                const isDateConfig = isDateField(key);

                // Check if it looks like a date string (heuristic for unconfigured fields)
                // Matches standard date string formats like "Tue Jan 27 2026..." or ISO
                const isDateString = typeof val === 'string' &&
                    (val.includes("GMT") || val.match(/^\d{4}-\d{2}-\d{2}/));

                if (isDateConfig || isDateString) {
                    try {
                        const dateObj = new Date(String(val));
                        if (!isNaN(dateObj.getTime())) {
                            displayVal = format(dateObj, "dd/MM/yyyy", { locale: ptBR });
                        }
                    } catch (e) {
                        // Keep original value if parsing fails
                    }
                } else {
                    // Check for Currency (Configured OR Heuristic)
                    const isCurrencyConfig = shouldFormatCurrency(key);
                    const lowerKey = key.toLowerCase();
                    // Heuristic: contains money keywords AND looks numeric
                    // We allow comma as decimal separator or dot
                    const isCurrencyHeuristic = (lowerKey.includes("valor") || lowerKey.includes("preco") || lowerKey.includes("custo") || lowerKey.includes("montante")) &&
                        !lowerKey.includes("id") &&
                        /^-?\d+(?:[.,]\d+)?$/.test(String(val).trim());

                    if (isCurrencyConfig || isCurrencyHeuristic) {
                        try {
                            // Normalize to float for formatting
                            const clean = String(val).replace(/[^\d,\.-]/g, "");
                            let floatVal = parseFloat(clean);
                            // If it had a comma and no dot, assume comma is decimal (BR standard)
                            if (clean.includes(',') && !clean.includes('.')) {
                                floatVal = parseFloat(clean.replace(',', '.'));
                            }
                            // If it has dot but no comma, standard float

                            if (!isNaN(floatVal)) {
                                displayVal = floatVal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                            }
                        } catch (e) {
                            // Keep original
                        }
                    }
                }

                otherFields.push({ label: key, value: displayVal });
            }
        });

        const status = statusKey ? String(row[statusKey] || "Pendente") : "Pendente";

        return {
            rowIndex,
            id: String(getValue(row, "Caso", "Chamado", "caso", "chamado") || caseId),
            title: getValue(row, "Inconsistencias", "inconsistencias", "Descrição", "descricao")
                ? "Inconsistência Identificada"
                : String(getValue(row, "Caso", "Chamado", "caso", "chamado") || caseId),
            description: String(row[descriptionField] || ""),
            descriptionField,
            status: status,

            // Source keys for dynamic form binding
            clientKey,
            responsibleKey,
            openedAtKey,
            dueDateKey,
            statusKey,
            valueKey,
            netValueKey,
            paymentMethodKey,
            pccKey,
            irKey,
            issBaseKey,
            periodKey,

            // Values (using the keys)
            client: clientKey ? String(row[clientKey] || "") : "",
            responsible: responsibleKey ? String(row[responsibleKey] || "") : "",
            priority: status.toLowerCase() === "erro" || status.toLowerCase() === "alto" ? "Alta" : "Normal",
            period: periodKey ? `Exercício ${row[periodKey]}` : "",

            // Dates
            openedAt: openedAtKey ? String(row[openedAtKey] || "") : "",
            dueDate: dueDateKey ? String(row[dueDateKey] || "") : "",

            // Financial
            value: valueKey ? row[valueKey] : null,
            netValue: netValueKey ? row[netValueKey] : null,
            paymentMethod: paymentMethodKey ? String(row[paymentMethodKey] || "") : "",
            pcc: pccKey ? row[pccKey] : null,
            ir: irKey ? row[irKey] : null,
            issBase: issBaseKey ? row[issBaseKey] : null,

            otherFields,
            // DEBUG: Return raw row keys for finding the correct column names
            debugKeys: Object.keys(row).sort()
        };
    }, [caseId, fileData, headers]);

    // Calculate unique values for ALL columns
    const uniqueOptions = useMemo(() => {
        if (!fileData || fileData.length === 0) return {};

        const optionsMap: Record<string, Set<string>> = {};

        fileData.forEach(row => {
            Object.keys(row).forEach(key => {
                if (!optionsMap[key]) {
                    optionsMap[key] = new Set<string>();
                }
                const val = row[key];
                if (val !== undefined && val !== null && String(val).trim() !== "") {
                    optionsMap[key].add(String(val));
                }
            });
        });

        // Convert to arrays and sort
        const result: Record<string, string[]> = {};
        Object.keys(optionsMap).forEach(key => {
            result[key] = Array.from(optionsMap[key]).sort();
        });

        return result;
    }, [fileData]);

    // Initialize edit form when caseData loads - populate with entire row
    useEffect(() => {
        if (caseData && fileData[caseData.rowIndex]) {
            const row = fileData[caseData.rowIndex];
            const formData: Record<string, string> = {};
            Object.keys(row).forEach(key => {
                let value = String(row[key] || "");
                // Auto-format currency fields on load using field configuration
                if (shouldFormatCurrency(key) && value) {
                    value = formatCurrency(value);
                }
                formData[key] = value;
            });
            setEditForm(formData);
        }
    }, [caseData, fileData]);

    const handleSaveEdit = () => {
        if (!caseData) return;

        // Update all fields in the store
        Object.keys(editForm).forEach(key => {
            updateCell(caseData.rowIndex, key, editForm[key]);
        });

        setIsEditOpen(false);
        toast.success("Alterações salvas!", "O caso foi atualizado com sucesso.");
    };

    const formatCurrency = (value: string) => {
        if (!value) return "";
        // Remove non-numeric except comma/dot
        const clean = value.replace(/[^\d,\.]/g, "");
        if (!clean) return "";

        // Try to parse standard JS float
        const dotValue = clean.replace(",", ".");
        const floatVal = parseFloat(dotValue);

        if (isNaN(floatVal)) return value;

        // Format to BRL style
        return floatVal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const handleCurrencyBlur = (key: string, value: string) => {
        const formatted = formatCurrency(value);
        setEditForm(prev => ({ ...prev, [key]: formatted }));
    };

    const handlePostComment = () => {
        if (!newComment.trim()) return;

        // Add comment to store (currentUser hardcoded as "Eu (Admin)" for now)
        addComment(caseId, newComment, "Eu (Admin)");
        setNewComment("");
        toast.success("Comentário enviado", "Sua nota foi adicionada ao histórico.");
    };

    // Get comments for this case
    const caseComments = comments[caseId] || [];

    if (!caseData) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
                <h1 className="text-2xl font-bold text-muted-foreground">Caso não encontrado</h1>
                <Button asChild variant="outline">
                    <Link href="/editor">Voltar para a Lista</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Breadcrumbs */}
            <div className="container mx-auto px-4 py-4 md:px-8">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
                    <Link href="/editor" className="hover:text-primary transition-colors">Casos</Link>
                    <span>/</span>
                    <span className="text-foreground font-medium">{caseData.id}</span>
                </div>

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
                    <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                            <h1 className="text-2xl font-black tracking-tight text-foreground">
                                {caseData.title}
                            </h1>
                            <Badge className={cn(
                                "px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider border-none",
                                caseData.status.toLowerCase().includes("pendente") && "bg-amber-100 text-amber-700",
                                caseData.status.toLowerCase().includes("erro") && "bg-red-100 text-red-700",
                                (caseData.status.toLowerCase().includes("aprovado") || caseData.status.toLowerCase().includes("resolvido") || caseData.status.toLowerCase().includes("pago") && !caseData.status.toLowerCase().includes("parcial")) && "bg-emerald-100 text-emerald-700",
                                caseData.status.toLowerCase().includes("parcialmente") && "bg-blue-100 text-blue-700",
                                (caseData.status.toLowerCase().includes("análise") || caseData.status.toLowerCase().includes("analise")) && "bg-indigo-100 text-indigo-700",
                                caseData.status.toLowerCase().includes("cancelado") && "bg-slate-100 text-slate-700"
                            )}>
                                {caseData.status}
                            </Badge>
                        </div>
                        <p className="text-muted-foreground text-sm">
                            {caseData.description}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" className="gap-2 font-bold">
                                    <Edit className="h-4 w-4" />
                                    Editar Caso
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="w-full max-w-[95vw] lg:max-w-7xl max-h-[90vh] overflow-hidden p-0 flex flex-col">
                                <DialogHeader className="px-6 py-5 border-b flex flex-row items-center justify-between shrink-0">
                                    <div className="flex items-center gap-2">
                                        <div className="h-8 w-8 rounded-lg bg-accent flex items-center justify-center">
                                            <Edit className="h-4 w-4 text-accent-foreground" />
                                        </div>
                                        <div>
                                            <DialogTitle className="text-lg font-bold">Editar Caso #{caseData.id}</DialogTitle>
                                            <DialogDescription className="text-xs text-muted-foreground">
                                                Atualize as informações do caso abaixo.
                                            </DialogDescription>
                                        </div>
                                    </div>
                                </DialogHeader>
                                <div className="flex-1 overflow-y-auto px-6 py-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {/* Column 1: Contexto e Prazos (Who & When) */}
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2 border-b pb-2 mb-4">
                                                <Briefcase className="h-4 w-4 text-accent-foreground" />
                                                <h3 className="font-bold text-sm text-foreground">Contexto e Prazos</h3>
                                            </div>

                                            {/* Client - Only if clientKey exists */}
                                            {caseData.clientKey && (
                                                <div className="space-y-2">
                                                    <Label className="text-xs font-semibold text-gray-600 uppercase">
                                                        {caseData.clientKey}
                                                    </Label>
                                                    <Input
                                                        value={editForm[caseData.clientKey] || ""}
                                                        onChange={(e) => setEditForm({ ...editForm, [caseData.clientKey!]: e.target.value })}
                                                        className="border-gray-300"
                                                    />
                                                </div>
                                            )}

                                            {/* Responsible - Only if responsibleKey exists */}
                                            {caseData.responsibleKey && (
                                                <div className="space-y-2">
                                                    <Label className="text-xs font-semibold text-gray-600 uppercase">Responsável</Label>
                                                    <Select
                                                        value={editForm[caseData.responsibleKey] || ""}
                                                        onValueChange={(val) => setEditForm({ ...editForm, [caseData.responsibleKey!]: val })}
                                                    >
                                                        <SelectTrigger className="border-gray-300">
                                                            <SelectValue placeholder="Selecione o responsável" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {(uniqueOptions[caseData.responsibleKey] || []).map((opt) => (
                                                                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            )}

                                            {(caseData.openedAtKey || caseData.dueDateKey) && <Separator />}

                                            {/* Dates (Moved from old Col 2) */}
                                            <div className="grid grid-cols-1 gap-4">
                                                {/* Data Abertura - Only if openedAtKey exists */}
                                                {caseData.openedAtKey && (
                                                    <div className="space-y-2">
                                                        <Label className="text-xs font-semibold text-gray-600 uppercase">Data Abertura</Label>
                                                        <Input
                                                            value={editForm[caseData.openedAtKey] || ""}
                                                            onChange={(e) => setEditForm({ ...editForm, [caseData.openedAtKey!]: e.target.value })}
                                                            className="border-gray-300"
                                                            placeholder="DD/MM/AAAA"
                                                        />
                                                    </div>
                                                )}

                                                {/* Vencimento - Only if dueDateKey exists */}
                                                {caseData.dueDateKey && (
                                                    <div className="space-y-2">
                                                        <Label className="text-xs font-semibold text-gray-600 uppercase">Vencimento</Label>
                                                        <Input
                                                            value={editForm[caseData.dueDateKey] || ""}
                                                            onChange={(e) => setEditForm({ ...editForm, [caseData.dueDateKey!]: e.target.value })}
                                                            className="border-gray-300"
                                                            placeholder="DD/MM/AAAA"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Column 2: Detalhes do Lançamento (What) */}
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2 border-b pb-2 mb-4">
                                                <AlignLeft className="h-4 w-4 text-accent-foreground" />
                                                <h3 className="font-bold text-sm text-foreground">Detalhes do Lançamento</h3>
                                            </div>

                                            {/* Dynamic Fields */}
                                            <div className="pt-2">
                                                <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2">
                                                    Outros Campos
                                                </Label>

                                                <div className="grid grid-cols-1 gap-4 pr-2 max-h-[300px] overflow-y-auto">
                                                    {Object.keys(editForm)
                                                        .filter(key => {
                                                            // Build list of tracked keys to exclude
                                                            const trackedKeys = [
                                                                caseData.clientKey,
                                                                caseData.responsibleKey,
                                                                caseData.openedAtKey,
                                                                caseData.dueDateKey,
                                                                caseData.statusKey,
                                                                caseData.valueKey,
                                                                caseData.netValueKey,
                                                                caseData.paymentMethodKey,
                                                                caseData.pccKey,
                                                                caseData.irKey,
                                                                caseData.issBaseKey,
                                                                caseData.periodKey,
                                                                caseData.descriptionField,
                                                            ].filter(Boolean); // Remove nulls

                                                            // Exclude tracked keys
                                                            if (trackedKeys.includes(key)) return false;

                                                            // Exclude ID fields
                                                            const lower = key.toLowerCase();
                                                            if (lower === "id" || lower === "chamado" || lower === "caso") return false;
                                                            if (lower.includes(" id ") || lower.startsWith("id ") || lower.endsWith(" id")) return false;

                                                            // Exclude observation/notes fields (shown in Quick Notes)
                                                            if (lower.includes("observ") || lower.includes("nota")) return false;

                                                            return true;
                                                        })
                                                        .sort()
                                                        .map((key) => {
                                                            const options = uniqueOptions[key] || [];
                                                            const fieldConfig = getFieldConfig(key);
                                                            const currentValue = editForm[key] || "";

                                                            // Determine if this should be a dropdown based on field configuration
                                                            const useDropdown = fieldConfig.type === 'dropdown' ||
                                                                (fieldConfig.type === 'text' && options.length > 0 && options.length <= 20);

                                                            // Determine if this is a currency field
                                                            const isCurrency = fieldConfig.type === 'currency' && fieldConfig.formatCurrency;

                                                            // Determine if this is a textarea
                                                            const isTextarea = fieldConfig.type === 'textarea';

                                                            return (
                                                                <div key={key} className="space-y-2">
                                                                    <Label className="text-xs font-semibold text-gray-600 uppercase">{key}</Label>
                                                                    {useDropdown ? (
                                                                        <Select
                                                                            value={currentValue}
                                                                            onValueChange={(val) => setEditForm({ ...editForm, [key]: val })}
                                                                        >
                                                                            <SelectTrigger className="border-gray-300">
                                                                                <SelectValue placeholder={`Selecione ${key}`} />
                                                                            </SelectTrigger>
                                                                            <SelectContent>
                                                                                {options.map((opt) => (
                                                                                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                                                                ))}
                                                                            </SelectContent>
                                                                        </Select>
                                                                    ) : isTextarea ? (
                                                                        <Textarea
                                                                            value={currentValue}
                                                                            onChange={(e) => setEditForm({ ...editForm, [key]: e.target.value })}
                                                                            className="border-gray-300 min-h-[80px]"
                                                                        />
                                                                    ) : (
                                                                        <Input
                                                                            value={currentValue}
                                                                            onChange={(e) => setEditForm({ ...editForm, [key]: e.target.value })}
                                                                            onBlur={(e) => {
                                                                                // Apply currency formatting if it's a currency field
                                                                                if (isCurrency) {
                                                                                    handleCurrencyBlur(key, e.target.value);
                                                                                }
                                                                            }}
                                                                            className={cn(
                                                                                "border-gray-300",
                                                                                isCurrency && "font-mono text-right"
                                                                            )}
                                                                        />
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                    {/* Empty state if no extra fields */}
                                                    {Object.keys(editForm).filter(key => {
                                                        const trackedKeys = [
                                                            caseData.clientKey,
                                                            caseData.responsibleKey,
                                                            caseData.openedAtKey,
                                                            caseData.dueDateKey,
                                                            caseData.statusKey,
                                                            caseData.valueKey,
                                                            caseData.netValueKey,
                                                            caseData.paymentMethodKey,
                                                            caseData.pccKey,
                                                            caseData.irKey,
                                                            caseData.issBaseKey,
                                                            caseData.periodKey,
                                                            caseData.descriptionField,
                                                        ].filter(Boolean);

                                                        if (trackedKeys.includes(key)) return false;

                                                        const lower = key.toLowerCase();
                                                        if (lower === "id" || lower === "chamado" || lower === "caso") return false;
                                                        if (lower.includes(" id ") || lower.startsWith("id ") || lower.endsWith(" id")) return false;
                                                        if (lower.includes("observ") || lower.includes("nota")) return false;

                                                        return true;
                                                    }).length === 0 && (
                                                            <div className="text-sm text-gray-500 italic py-4">Nenhum campo adicional disponível.</div>
                                                        )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Column 3: Ação e Financeiro (Impact & Resolution) */}
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2 border-b pb-2 mb-4">
                                                <Wallet className="h-4 w-4 text-accent-foreground" />
                                                <h3 className="font-bold text-sm text-foreground">Ação e Financeiro</h3>
                                            </div>

                                            {/* Status - Only if statusKey exists */}
                                            {caseData.statusKey && (
                                                <div className="space-y-2">
                                                    <Label className="text-xs font-semibold text-gray-600 uppercase">Status</Label>
                                                    <Select
                                                        value={editForm[caseData.statusKey] || ""}
                                                        onValueChange={(val) => setEditForm({ ...editForm, [caseData.statusKey!]: val })}
                                                    >
                                                        <SelectTrigger className="border-gray-300 bg-gray-50/50">
                                                            <SelectValue placeholder="Selecione o status" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {(uniqueOptions[caseData.statusKey] || ["Pendente", "Em Andamento", "Concluído"]).map((opt) => (
                                                                <SelectItem key={opt} value={opt}>
                                                                    <span className={cn(
                                                                        "font-medium",
                                                                        opt.toLowerCase().includes("pendente") && "text-amber-600",
                                                                        opt.toLowerCase().includes("erro") && "text-red-600",
                                                                        (opt.toLowerCase().includes("concluído") || opt.toLowerCase().includes("resolvido") || opt.toLowerCase().includes("ok") || (opt.toLowerCase().includes("pago") && !opt.toLowerCase().includes("parcial"))) && "text-emerald-600",
                                                                        opt.toLowerCase().includes("parcialmente") && "text-blue-600",
                                                                        opt.toLowerCase().includes("cancelado") && "text-slate-600"
                                                                    )}>
                                                                        {opt}
                                                                    </span>
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            )}

                                            {/* Financial Values */}
                                            {(caseData.valueKey || caseData.netValueKey) && (
                                                <div className="grid grid-cols-2 gap-4">
                                                    {/* Valor (R$) - Only if valueKey exists */}
                                                    {caseData.valueKey && (
                                                        <div className="space-y-2">
                                                            <Label className="text-xs font-semibold text-gray-600 uppercase">
                                                                {caseData.valueKey}
                                                            </Label>
                                                            <Input
                                                                value={editForm[caseData.valueKey] || ""}
                                                                onChange={(e) => setEditForm({ ...editForm, [caseData.valueKey!]: e.target.value })}
                                                                onBlur={(e) => handleCurrencyBlur(caseData.valueKey!, e.target.value)}
                                                                className="border-gray-300 font-mono"
                                                            />
                                                        </div>
                                                    )}

                                                    {/* Valor Líquido - Only if netValueKey exists */}
                                                    {caseData.netValueKey && (
                                                        <div className="space-y-2">
                                                            <Label className="text-xs font-semibold text-gray-600 uppercase">Valor Líquido</Label>
                                                            <Input
                                                                value={editForm[caseData.netValueKey] || ""}
                                                                onChange={(e) => setEditForm({ ...editForm, [caseData.netValueKey!]: e.target.value })}
                                                                onBlur={(e) => handleCurrencyBlur(caseData.netValueKey!, e.target.value)}
                                                                className="border-gray-300 font-mono"
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Quick Notes */}
                                            <div className="space-y-2">
                                                <Label className="text-xs font-semibold text-gray-600 uppercase">Notas Rápidas</Label>
                                                <Textarea
                                                    value={editForm["Observações"] || editForm["Notas"] || ""}
                                                    onChange={(e) => {
                                                        const key = Object.keys(editForm).find(k => k.toLowerCase().includes("observ") || k.toLowerCase().includes("notas"));
                                                        if (key) setEditForm({ ...editForm, [key]: e.target.value });
                                                    }}
                                                    placeholder="Adicione uma observação rápida..."
                                                    className="min-h-[120px] border-gray-300 resize-none"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <DialogFooter className="px-6 py-4 border-t bg-gray-50 gap-3 shrink-0">
                                    <Button
                                        variant="outline"
                                        className="flex-1 sm:flex-none border-gray-300"
                                        onClick={() => setIsEditOpen(false)}
                                    >
                                        Cancelar
                                    </Button>
                                    <Button
                                        onClick={handleSaveEdit}
                                        className="bg-primary hover:bg-primary/90 text-primary-foreground flex-1 sm:flex-none shadow-sm"
                                    >
                                        <Save className="h-4 w-4 mr-2" />
                                        Salvar Alterações
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>

                        <Button className="gap-2 font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm">
                            <CheckCircle className="h-4 w-4" />
                            Finalizar Caso
                        </Button>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-6 mt-6">
                    {/* Main Content */}
                    <div className="flex-1 space-y-8">
                        {/* Financeiro - Only render if relevant data exists */}
                        {(caseData.value || caseData.netValue || (caseData.paymentMethod && caseData.paymentMethod !== "-")) && (
                            <CollapsibleCard title="Detalhes Financeiros" defaultOpen>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                    {caseData.value && <InfoItem label="Montante Bruto" value={String(caseData.value)} />}
                                    {caseData.netValue && <InfoItem label="Valor Líquido" value={String(caseData.netValue)} />}
                                    {caseData.paymentMethod && caseData.paymentMethod !== "-" && <InfoItem label="Forma de Pagamento" value={caseData.paymentMethod} />}

                                    {/* Taxes */}
                                    {caseData.pcc && <InfoItem label="PCC" value={String(caseData.pcc)} />}
                                    {caseData.ir && <InfoItem label="IR" value={String(caseData.ir)} />}
                                    {caseData.issBase && <InfoItem label="Base ISS" value={String(caseData.issBase)} />}
                                </div>
                            </CollapsibleCard>
                        )}

                        {/* Informações Gerais - Dynamic Group */}
                        <CollapsibleCard title="Informações Gerais" defaultOpen>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {caseData.client && caseData.client !== "N/A" && <InfoItem label="Cliente" value={caseData.client} />}
                                {caseData.openedAt && caseData.openedAt !== "-" && <InfoItem label="Data" value={caseData.openedAt} />}
                                {caseData.dueDate && caseData.dueDate !== "-" && <InfoItem label="Vencimento" value={caseData.dueDate} />}
                                {caseData.responsible && caseData.responsible !== "Não atribuído" && <InfoItem label="Responsável" value={caseData.responsible} />}
                                {caseData.period && <InfoItem label="Período" value={caseData.period} />}
                            </div>
                        </CollapsibleCard>

                        {/* Outros Detalhes - Totally dynamic */}
                        {caseData.otherFields && caseData.otherFields.length > 0 && (
                            <CollapsibleCard title="Outros Detalhes" defaultOpen>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {caseData.otherFields.map((field, idx) => (
                                        <InfoItem key={idx} label={field.label} value={field.value} />
                                    ))}
                                </div>
                            </CollapsibleCard>
                        )}



                        {/* Documentos Relacionados */}
                        <Card className="overflow-hidden shadow-sm border-muted/40">
                            <CardHeader className="border-b bg-muted/10 px-4 py-3 flex flex-row items-center justify-between">
                                <CardTitle className="text-base font-bold">Documentos Relacionados</CardTitle>
                                <Button variant="ghost" size="sm" className="text-primary font-bold hover:text-primary hover:bg-primary/10 gap-1">
                                    <Plus className="h-4 w-4" />
                                    Adicionar
                                </Button>
                            </CardHeader>
                            <CardContent className="p-2 space-y-1">
                                <DocumentItem
                                    icon={<FileSpreadsheet className="h-5 w-5 text-emerald-600" />}
                                    bgClass="bg-emerald-100 dark:bg-emerald-900/20"
                                    name="Planilha_Consolidada.xlsx"
                                    meta="Excel • 2.4 MB • Por João Silva"
                                />
                                <DocumentItem
                                    icon={<FileText className="h-5 w-5 text-red-600" />}
                                    bgClass="bg-red-100 dark:bg-red-900/20"
                                    name="Relatorio_Final.pdf"
                                    meta="PDF • 1.1 MB • Por Sistema"
                                />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="w-full lg:w-96 space-y-6">
                        {/* Comments */}
                        <Card className="shadow-sm border-muted/40 flex flex-col h-[500px]">
                            <CardHeader className="border-b bg-muted/10 px-4 py-3 flex flex-row items-center justify-between space-y-0">
                                <div className="flex items-center gap-2">
                                    <MessageSquare className="h-4 w-4 text-primary" />
                                    <CardTitle className="text-base font-bold">Notas e Comentários</CardTitle>
                                </div>
                                <span className="bg-muted px-2 py-0.5 rounded text-xs font-bold text-muted-foreground">{caseComments.length}</span>
                            </CardHeader>
                            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                                {caseComments.length === 0 ? (
                                    <div className="text-center text-muted-foreground text-sm py-10 opacity-60">
                                        Nenhum comentário ainda.
                                    </div>
                                ) : (
                                    caseComments.map((comment) => (
                                        <Comment
                                            key={comment.id}
                                            name={comment.user}
                                            time={comment.timestamp}
                                            avatarSeed={comment.avatarSeed}
                                            text={comment.text}
                                            isReply={comment.isReply}
                                        />
                                    ))
                                )}
                            </CardContent>
                            <div className="p-4 border-t bg-muted/30">
                                <div className="relative">
                                    <Textarea
                                        placeholder="Escreva um comentário..."
                                        className="resize-none min-h-[100px] pr-12 text-sm bg-background"
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handlePostComment();
                                            }
                                        }}
                                    />
                                    <Button
                                        size="icon"
                                        className="absolute bottom-3 right-3 h-8 w-8 bg-primary hover:bg-primary/90 text-primary-foreground"
                                        onClick={handlePostComment}
                                        disabled={!newComment.trim()}
                                    >
                                        <Send className="h-4 w-4" />
                                    </Button>
                                </div>
                                <div className="flex gap-2 mt-2 px-1">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                                        <Smile className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                                        <AtSign className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </Card>


                    </div>
                </div>
            </div>
        </div>

    );
}

// Sub-components

function InfoItem({ label, value, customValue }: { label: string, value?: string, customValue?: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-1">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
            {customValue || <span className="text-base font-semibold text-foreground">{value}</span>}
        </div>
    );
}

function TimelineItem({ icon, title, time, content, isActive, isRight }: { icon: React.ReactNode, title: string, time: string, content: React.ReactNode, isActive?: boolean, isRight?: boolean }) {
    return (
        <div className={cn("relative flex items-center justify-between md:justify-normal group", isRight ? "" : "md:flex-row-reverse")}>
            <div className={cn(
                isActive ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary dark:bg-primary/20"
            )}>
                {icon}
            </div>
            <div className={cn(
                "w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-3 rounded-lg border",
                isActive ? "bg-background shadow-sm" : "bg-muted/30 border-transparent"
            )}>
                <div className="flex items-center justify-between space-x-2 mb-1">
                    <div className="font-bold text-foreground">{title}</div>
                    <time className="text-xs font-medium text-muted-foreground">{time}</time>
                </div>
                <div className="text-sm text-muted-foreground">{content}</div>
            </div>
        </div>
    );
}

// Helper component for Collapsible Cards
function CollapsibleCard({ title, defaultOpen = true, children }: { title: string, defaultOpen?: boolean, children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <Card className="overflow-hidden shadow-sm border-muted/40">
            <Collapsible open={isOpen} onOpenChange={setIsOpen}>
                <CollapsibleTrigger asChild>
                    <CardHeader className="border-b bg-muted/10 px-4 py-3 flex flex-row items-center justify-between cursor-pointer hover:bg-muted/20 transition-colors">
                        <CardTitle className="text-base font-bold">{title}</CardTitle>
                        {isOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                    </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <CardContent className="p-4">
                        {children}
                    </CardContent>
                </CollapsibleContent>
            </Collapsible>
        </Card>
    );
}

function DocumentItem({ icon, bgClass, name, meta }: { icon: React.ReactNode, bgClass: string, name: string, meta: string }) {
    return (
        <div className="flex items-center justify-between p-3 hover:bg-muted/50 transition-colors rounded-lg group cursor-pointer">
            <div className="flex items-center gap-4">
                <div className={cn("p-2 rounded-lg", bgClass)}>
                    {icon}
                </div>
                <div>
                    <p className="font-semibold text-sm">{name}</p>
                    <p className="text-xs text-muted-foreground">{meta}</p>
                </div>
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                    <Eye className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                    <Download className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}

function Comment({ name, time, avatarSeed, text, isReply }: { name: string, time: string, avatarSeed: string, text: string, isReply?: boolean }) {
    return (
        <div className="flex gap-3">
            <Avatar className="h-8 w-8 shrink-0">
                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`} />
                <AvatarFallback>{name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-1 max-w-[85%]">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-foreground">{name}</span>
                    <span className="text-[10px] text-muted-foreground">{time}</span>
                </div>
                <div className={cn(
                    "p-3 rounded-2xl text-sm",
                    isReply
                        ? "bg-blue-50 text-blue-900 border border-blue-100 dark:bg-blue-900/20 dark:text-blue-100 dark:border-blue-900/30 rounded-tl-none"
                        : "bg-muted text-foreground rounded-tl-none"
                )}>
                    {text}
                </div>
            </div>
        </div>
    );
}
