"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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




import { useAppStore } from "@/lib/store";
import { useMemo, useState, useEffect } from "react";

export default function CaseDetailsPage() {
    const params = useParams();
    const caseId = decodeURIComponent(params.id as string);
    const { fileData, updateCell, comments, addComment } = useAppStore();
    const [isEditOpen, setIsEditOpen] = useState(false);

    // Comment State
    const [newComment, setNewComment] = useState("");

    // Edit State - Dynamic form for all fields
    const [editForm, setEditForm] = useState<Record<string, string>>({});
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);


    const caseData = useMemo(() => {
        // Helper to get value case-insensitively
        const getValue = (r: any, ...keys: string[]) => {
            for (const key of keys) {
                // Exact match first
                if (r[key] !== undefined) return r[key];

                // Try case insensitive and trimmed match
                const normalizedSearch = key.trim().toLowerCase();
                const foundKey = Object.keys(r).find(k => k.trim().toLowerCase() === normalizedSearch);

                if (foundKey && r[foundKey] !== undefined) return r[foundKey];
            }
            return null;
        };

        const rowIndex = fileData.findIndex(r => {
            const id = getValue(r, "Caso", "Chamado", "caso", "chamado");
            return String(id) === caseId;
        });

        if (rowIndex === -1) return null;
        const row = fileData[rowIndex];

        const status = String(getValue(row, "Status", "status") || "Pendente");
        const descriptionField = ["Inconsistencias", "inconsistencias", "Descrição", "descricao", "Observações", "observacoes"].find(k => row[k] !== undefined) || "Inconsistencias";

        // Dynamic Fields (Leftover)
        const knownKeys = [
            "Caso", "Chamado", "caso", "chamado",
            "Inconsistencias", "inconsistencias", "Descrição", "descricao", "Observações", "observacoes",
            "Status", "status",
            "Empresa", "empresa", "Cliente", "cliente", "Nome do Fornecedor", "Fornecedor",
            "Responsável", "responsavel", "Usuario", "usuario", "Area Responsavel",
            "Exercicio", "exercicio", "Periodo", "periodo",
            "Data", "data", "Data Abertura",
            "Data Vencimento", "vencimento",
            "Valor (R$)", "Valor", "montante",
            "Valor Liquido", "valor liquido",
            "Forma de Pagamento", "forma pagamento", "Forma Pagto", "Metodo Pagamento", "FORMA DE PGTO",
            "PCC", "pcc", "PCC", "pcc",
            "IR", "ir", "IRRF", "Imposto de Renda",
            "Base ISS", "base iss"
        ];

        const otherFields: { label: string, value: string }[] = [];
        Object.keys(row).forEach(key => {
            const normalizedKey = key.trim().toLowerCase();
            if (!knownKeys.some(k => k.trim().toLowerCase() === normalizedKey)) {
                const val = row[key];
                if (val !== undefined && val !== null && String(val).trim() !== "") {
                    otherFields.push({ label: key, value: String(val) });
                }
            }
        });

        return {
            rowIndex,
            id: String(getValue(row, "Caso", "Chamado", "caso", "chamado") || caseId),
            title: getValue(row, "Inconsistencias", "inconsistencias", "Descrição", "descricao")
                ? "Inconsistência Identificada"
                : "Lançamento Contábil",
            description: String(getValue(row, descriptionField) || "Nenhuma inconsistência relatada para este lançamento."),
            descriptionField,
            status: status,

            // General Info
            client: String(getValue(row, "Empresa", "empresa", "Cliente", "cliente") || getValue(row, "Nome do Fornecedor", "Fornecedor") || "N/A"),
            responsible: String(getValue(row, "Responsável", "responsavel", "Usuario", "usuario", "Area Responsavel") || "Não atribuído"),
            priority: status.toLowerCase() === "erro" || status.toLowerCase() === "alto" ? "Alta" : "Normal",
            period: getValue(row, "Exercicio", "exercicio", "Periodo", "periodo") ? `Exercício ${getValue(row, "Exercicio", "exercicio")}` : "2023",
            lastUpdate: "Há 2 horas", // Mock

            // Dates
            openedAt: String(getValue(row, "Data", "data", "Data Abertura") || "-"),
            dueDate: String(getValue(row, "Data Vencimento", "vencimento") || "-"),

            // Financial
            value: getValue(row, "Valor (R$)", "Valor", "montante"),
            netValue: getValue(row, "Valor Liquido", "valor liquido"),
            paymentMethod: String(getValue(row, "Forma de Pagamento", "forma pagamento", "Forma Pagto", "Metodo Pagamento") || "-"),
            pcc: getValue(row, "PCC", "pcc"),
            ir: getValue(row, "IR", "ir", "IRRF", "Imposto de Renda"),
            issBase: getValue(row, "Base ISS", "base iss"),

            otherFields,
            // DEBUG: Return raw row keys for finding the correct column names
            debugKeys: Object.keys(row).sort()
        };
    }, [caseId, fileData]);

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
                formData[key] = String(row[key] || "");
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
                    <span className="text-foreground font-medium">Caso #{caseData.id}</span>
                </div>

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
                    <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                            <h1 className="text-2xl font-black tracking-tight text-foreground">
                                Caso #{caseData.id}: {caseData.title}
                            </h1>
                            <Badge className={cn(
                                "px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider border-none",
                                caseData.status.toLowerCase() === "pendente" && "bg-amber-100 text-amber-700",
                                caseData.status.toLowerCase() === "erro" && "bg-red-100 text-red-700",
                                caseData.status.toLowerCase() === "aprovado" && "bg-emerald-100 text-emerald-700",
                                caseData.status.toLowerCase() === "resolvido" && "bg-emerald-100 text-emerald-700",
                                (caseData.status.toLowerCase().includes("análise") || caseData.status.toLowerCase().includes("analise")) && "bg-blue-100 text-blue-700",
                                caseData.status.toLowerCase() === "cancelado" && "bg-gray-100 text-gray-700"
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
                                        <div className="h-8 w-8 rounded-lg bg-orange-100 flex items-center justify-center">
                                            <Edit className="h-4 w-4 text-orange-600" />
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
                                                <Briefcase className="h-4 w-4 text-blue-600" />
                                                <h3 className="font-bold text-sm text-gray-900">Contexto e Prazos</h3>
                                            </div>

                                            {/* Client */}
                                            <div className="space-y-2">
                                                <Label className="text-xs font-semibold text-gray-600 uppercase">Cliente / Empresa</Label>
                                                <Input
                                                    value={editForm["Empresa"] || editForm["Cliente"] || ""}
                                                    onChange={(e) => {
                                                        const key = Object.keys(editForm).find(k => k.toLowerCase().includes("empresa") || k.toLowerCase().includes("cliente"));
                                                        if (key) setEditForm({ ...editForm, [key]: e.target.value });
                                                    }}
                                                    className="border-gray-300"
                                                />
                                            </div>

                                            {/* Responsible */}
                                            <div className="space-y-2">
                                                <Label className="text-xs font-semibold text-gray-600 uppercase">Responsável</Label>
                                                <Select
                                                    value={editForm["Responsável"] || editForm["Usuario"] || ""}
                                                    onValueChange={(val) => {
                                                        const key = Object.keys(editForm).find(k => k.toLowerCase().includes("respons") || k.toLowerCase().includes("usuario"));
                                                        if (key) setEditForm({ ...editForm, [key]: val });
                                                    }}
                                                >
                                                    <SelectTrigger className="border-gray-300">
                                                        <SelectValue placeholder="Selecione o responsável" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {(uniqueOptions["Responsável"] || uniqueOptions["Usuario"] || []).map((opt) => (
                                                            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <Separator />

                                            {/* Dates (Moved from old Col 2) */}
                                            <div className="grid grid-cols-1 gap-4">
                                                <div className="space-y-2">
                                                    <Label className="text-xs font-semibold text-gray-600 uppercase">Data Abertura</Label>
                                                    <Input
                                                        value={editForm["Data"] || editForm["Data Abertura"] || ""}
                                                        onChange={(e) => {
                                                            const key = Object.keys(editForm).find(k => k.toLowerCase() === "data" || k.toLowerCase() === "data abertura");
                                                            if (key) setEditForm({ ...editForm, [key]: e.target.value });
                                                        }}
                                                        className="border-gray-300"
                                                        placeholder="DD/MM/AAAA"
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label className="text-xs font-semibold text-gray-600 uppercase">Vencimento</Label>
                                                    <Input
                                                        value={editForm["Data Vencimento"] || editForm["vencimento"] || ""}
                                                        onChange={(e) => {
                                                            const key = Object.keys(editForm).find(k => k.toLowerCase().includes("vencimento"));
                                                            if (key) setEditForm({ ...editForm, [key]: e.target.value });
                                                        }}
                                                        className="border-gray-300"
                                                        placeholder="DD/MM/AAAA"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Column 2: Detalhes do Lançamento (What) */}
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2 border-b pb-2 mb-4">
                                                <AlignLeft className="h-4 w-4 text-orange-600" />
                                                <h3 className="font-bold text-sm text-gray-900">Detalhes do Lançamento</h3>
                                            </div>

                                            {/* Dynamic Fields */}
                                            <div className="pt-2">
                                                <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2">
                                                    Outros Campos
                                                </Label>

                                                <div className="grid grid-cols-1 gap-4 pr-2 max-h-[300px] overflow-y-auto">
                                                    {Object.keys(editForm)
                                                        .filter(key => {
                                                            const lower = key.toLowerCase();
                                                            return !lower.includes("inconsist") && !lower.includes("descri") &&
                                                                !lower.includes("empresa") && !lower.includes("cliente") &&
                                                                !lower.includes("valor") && !lower.includes("vencimento") &&
                                                                !lower.includes("respons") && !lower.includes("usuario") &&
                                                                !lower.includes("status") && !lower.includes("observ") &&
                                                                !lower.includes("notas") && !lower.includes("data");
                                                        })
                                                        .sort()
                                                        .map((key) => {
                                                            const options = uniqueOptions[key] || [];
                                                            const useDropdown = options.length > 1 && options.length < 20;
                                                            const currentValue = editForm[key] || "";

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
                                                                    ) : (
                                                                        <Input
                                                                            value={currentValue}
                                                                            onChange={(e) => setEditForm({ ...editForm, [key]: e.target.value })}
                                                                            className="border-gray-300"
                                                                        />
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                    {/* Empty state if no extra fields */}
                                                    {Object.keys(editForm).filter(key => {
                                                        const lower = key.toLowerCase();
                                                        return !lower.includes("inconsist") && !lower.includes("descri") &&
                                                            !lower.includes("empresa") && !lower.includes("cliente") &&
                                                            !lower.includes("valor") && !lower.includes("vencimento") &&
                                                            !lower.includes("respons") && !lower.includes("usuario") &&
                                                            !lower.includes("status") && !lower.includes("observ") &&
                                                            !lower.includes("notas") && !lower.includes("data");
                                                    }).length === 0 && (
                                                            <div className="text-sm text-gray-500 italic py-4">Nenhum campo adicional disponível.</div>
                                                        )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Column 3: Ação e Financeiro (Impact & Resolution) */}
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2 border-b pb-2 mb-4">
                                                <Wallet className="h-4 w-4 text-emerald-600" />
                                                <h3 className="font-bold text-sm text-gray-900">Ação e Financeiro</h3>
                                            </div>

                                            {/* Status (Moved to top of Col 3) */}
                                            <div className="space-y-2">
                                                <Label className="text-xs font-semibold text-gray-600 uppercase">Status</Label>
                                                <Select
                                                    value={editForm["Status"] || editForm["status"] || ""}
                                                    onValueChange={(val) => {
                                                        const key = Object.keys(editForm).find(k => k.toLowerCase() === "status");
                                                        if (key) setEditForm({ ...editForm, [key]: val });
                                                    }}
                                                >
                                                    <SelectTrigger className="border-gray-300 bg-gray-50/50">
                                                        <SelectValue placeholder="Selecione o status" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {(uniqueOptions["Status"] || uniqueOptions["status"] || ["Pendente", "Em Andamento", "Concluído"]).map((opt) => (
                                                            <SelectItem key={opt} value={opt}>
                                                                <span className={cn(
                                                                    "font-medium",
                                                                    opt.toLowerCase() === "pendente" && "text-amber-600",
                                                                    opt.toLowerCase() === "erro" && "text-red-600",
                                                                    (opt.toLowerCase() === "concluído" || opt.toLowerCase() === "resolvido" || opt.toLowerCase() === "ok") && "text-emerald-600"
                                                                )}>
                                                                    {opt}
                                                                </span>
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            {/* Financial Values */}
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label className="text-xs font-semibold text-gray-600 uppercase">Valor (R$)</Label>
                                                    <Input
                                                        value={editForm["Valor (R$)"] || editForm["Valor"] || ""}
                                                        onChange={(e) => {
                                                            const key = Object.keys(editForm).find(k => k.toLowerCase().includes("valor") && !k.toLowerCase().includes("liquido"));
                                                            if (key) setEditForm({ ...editForm, [key]: e.target.value });
                                                        }}
                                                        onBlur={(e) => {
                                                            const key = Object.keys(editForm).find(k => k.toLowerCase().includes("valor") && !k.toLowerCase().includes("liquido"));
                                                            if (key) handleCurrencyBlur(key, e.target.value);
                                                        }}
                                                        className="border-gray-300 font-mono"
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label className="text-xs font-semibold text-gray-600 uppercase">Valor Líquido</Label>
                                                    <Input
                                                        value={editForm["Valor Liquido"] || editForm["valor liquido"] || ""}
                                                        onChange={(e) => {
                                                            const key = Object.keys(editForm).find(k => k.toLowerCase().includes("liquido"));
                                                            if (key) setEditForm({ ...editForm, [key]: e.target.value });
                                                        }}
                                                        onBlur={(e) => {
                                                            const key = Object.keys(editForm).find(k => k.toLowerCase().includes("liquido"));
                                                            if (key) handleCurrencyBlur(key, e.target.value);
                                                        }}
                                                        className="border-gray-300 font-mono"
                                                    />
                                                </div>
                                            </div>

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
                                        className="bg-orange-600 hover:bg-orange-700 text-white flex-1 sm:flex-none shadow-sm"
                                    >
                                        <Save className="h-4 w-4 mr-2" />
                                        Salvar Alterações
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>

                        <Button className="gap-2 font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
                            <CheckCircle className="h-4 w-4" />
                            Finalizar Caso
                        </Button>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-6 mt-6">
                    {/* Main Content */}
                    <div className="flex-1 space-y-8">
                        {/* Financeiro */}
                        <Card className="overflow-hidden shadow-sm border-muted/40">
                            <CardHeader className="border-b bg-muted/10 px-4 py-3">
                                <CardTitle className="text-base font-bold">Detalhes Financeiros</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                    <InfoItem label="Montante Bruto" value={String(caseData.value)} />
                                    <InfoItem label="Valor Líquido" value={String(caseData.netValue || "-")} />
                                    <InfoItem label="Forma de Pagamento" value={caseData.paymentMethod} />

                                    <Separator className="sm:col-span-3 my-2" />

                                    <InfoItem label="PCC" value={String(caseData.pcc || "-")} />
                                    <InfoItem label="IR" value={String(caseData.ir || "-")} />
                                    <InfoItem label="Base ISS" value={String(caseData.issBase || "-")} />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Informações Gerais */}
                        <Card className="overflow-hidden shadow-sm border-muted/40">
                            <CardHeader className="border-b bg-muted/10 px-4 py-3">
                                <CardTitle className="text-base font-bold">Informações Gerais</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <InfoItem label="Cliente" value={caseData.client} />
                                    <InfoItem label="Data" value={caseData.openedAt} />

                                    <InfoItem
                                        label="Prioridade"
                                        customValue={
                                            <div className="flex items-center gap-2">
                                                <span className={cn(
                                                    "h-2 w-2 rounded-full",
                                                    caseData.priority === "Alta" ? "bg-red-500" : "bg-green-500"
                                                )} />
                                                <span className={cn(
                                                    "font-bold",
                                                    caseData.priority === "Alta" ? "text-red-500" : "text-green-500"
                                                )}>{caseData.priority}</span>
                                            </div>
                                        }
                                    />

                                    <InfoItem label="Responsável" value={caseData.responsible} />
                                    <InfoItem label="Período Fiscal" value={caseData.period} />
                                    <InfoItem label="Última Atualização" value={caseData.lastUpdate} />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Detalhes Financeiros (Collapsed/Smaller if needed but keeping structure) */}
                        <Card className="overflow-hidden shadow-sm border-muted/40">
                            <CardHeader className="border-b bg-muted/10 px-4 py-3">
                                <CardTitle className="text-base font-bold">Detalhes Financeiros</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                    <InfoItem label="Montante Bruto" value={String(caseData.value || "-")} />
                                    <InfoItem label="Valor Líquido" value={String(caseData.netValue || "-")} />
                                    <InfoItem label="Forma de Pagamento" value={caseData.paymentMethod} />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Other Dynamic Fields */}
                        {caseData.otherFields && caseData.otherFields.length > 0 && (
                            <Card className="overflow-hidden shadow-sm border-muted/40">
                                <CardHeader className="border-b bg-muted/10 px-4 py-3">
                                    <CardTitle className="text-base font-bold">Outros Detalhes</CardTitle>
                                </CardHeader>
                                <CardContent className="p-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {caseData.otherFields.map((field, idx) => (
                                            <InfoItem key={idx} label={field.label} value={field.value} />
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
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
                                        className="absolute bottom-3 right-3 h-8 w-8 bg-blue-600 hover:bg-blue-700"
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
                "flex items-center justify-center w-10 h-10 rounded-full border border-background shadow shrink-0 z-10 md:absolute md:left-1/2 md:-translate-x-1/2",
                isActive ? "bg-blue-600 text-white" : "bg-blue-100 text-blue-600 dark:bg-blue-900/40"
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
