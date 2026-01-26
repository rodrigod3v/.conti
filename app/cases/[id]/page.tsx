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
    AtSign
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { cn } from "@/lib/utils";

import { useAppStore } from "@/lib/store";
import { useMemo } from "react";

export default function CaseDetailsPage() {
    const params = useParams();
    const caseId = decodeURIComponent(params.id as string);
    const { fileData } = useAppStore();

    const caseData = useMemo(() => {
        const row = fileData.find(r => r["Caso"] === caseId);
        if (!row) return null;

        return {
            id: String(row["Caso"]),
            title: row["Inconsistencias"] ? "Inconsistência Identificada" : "Lançamento Contábil",
            description: row["Inconsistencias"] ? String(row["Inconsistencias"]) : "Nenhuma inconsistência relatada para este lançamento.",
            status: String(row["Status"]),

            // Operational
            client: String(row["Empresa"] || row["Nome do Fornecedor"] || "N/A"),
            responsible: String(row["Responsável"] || row["Area Responsavel"] || "Não atribuído"),
            supplier: String(row["Nome do Fornecedor"] || row["Fornecedor"]),
            fiscalId: String(row["Numero do ID Fiscal"]),

            // Dates
            openedAt: String(row["Data"]),
            paymentDate: String(row["Data do Pagamento"]),
            accountingDate: String(row["Data Lancamento Contabil"]),
            dueDate: String(row["Data Vencimento"]),

            // Financial
            value: row["Valor (R$)"] || row["Montante"],
            netValue: row["Valor Liquido"],
            paymentMethod: String(row["Forma de Pagamento"]),

            // Taxes
            pcc: row["PCC"],
            ir: row["IR"],
            issBase: row["Base ISS"],

            // Meta
            priority: String(row["Status"]).toLowerCase() === "erro" ? "Alta" : "Normal",
            period: row["Exercicio"] ? `Exercício ${row["Exercicio"]}` : "2023",
            lastUpdate: "Importado agora",
        };
    }, [caseId, fileData]);

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
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b pb-8">
                    <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-3">
                            <h1 className="text-3xl font-black tracking-tight text-foreground">
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
                        <p className="text-muted-foreground text-lg">
                            {caseData.description}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" className="gap-2 font-bold">
                            <Edit className="h-4 w-4" />
                            Editar Caso
                        </Button>
                        <Button className="gap-2 font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
                            <CheckCircle className="h-4 w-4" />
                            Finalizar Caso
                        </Button>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8 mt-8">
                    {/* Main Content */}
                    <div className="flex-1 space-y-8">
                        {/* Financeiro */}
                        <Card className="overflow-hidden shadow-sm border-muted/40">
                            <CardHeader className="border-b bg-muted/10 px-6 py-4">
                                <CardTitle className="text-lg font-bold">Detalhes Financeiros</CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
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
                            <CardHeader className="border-b bg-muted/10 px-6 py-4">
                                <CardTitle className="text-lg font-bold">Informações Operacionais</CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <InfoItem label="Empresa/Cliente" value={caseData.client} />
                                    <InfoItem label="Fornecedor" value={caseData.supplier} />
                                    <InfoItem label="ID Fiscal" value={caseData.fiscalId} />

                                    <InfoItem label="Data Lançamento" value={caseData.openedAt} />
                                    <InfoItem label="Data Vencimento" value={caseData.dueDate} />
                                    <InfoItem label="Data Pagamento" value={caseData.paymentMethod} />

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
                                    <InfoItem label="Exercício" value={caseData.period} />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Histórico de Atividades */}
                        <Card className="overflow-hidden shadow-sm border-muted/40">
                            <CardHeader className="border-b bg-muted/10 px-6 py-4">
                                <CardTitle className="text-lg font-bold">Histórico de Atividades</CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-blue-600 before:via-blue-300 before:to-transparent md:before:mx-auto md:before:translate-x-0">
                                    <TimelineItem
                                        icon={<History className="h-4 w-4" />}
                                        title="Status Alterado"
                                        time="Hoje, 14:30"
                                        content={<span>João Silva alterou o status para <span className="font-bold text-amber-600">Em Revisão</span>.</span>}
                                        isActive
                                    />
                                    <TimelineItem
                                        icon={<Paperclip className="h-4 w-4" />}
                                        title="Arquivo Anexado"
                                        time="Ontem, 09:15"
                                        content={<span>Maria Oliveira anexou a <span className="text-primary font-medium">Planilha de impostos</span> consolidada.</span>}
                                        isRight
                                    />
                                    <TimelineItem
                                        icon={<Plus className="h-4 w-4" />}
                                        title="Caso Criado"
                                        time="12/10/2023"
                                        content="O caso foi aberto automaticamente pelo sistema de importação."
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Documentos Relacionados */}
                        <Card className="overflow-hidden shadow-sm border-muted/40">
                            <CardHeader className="border-b bg-muted/10 px-6 py-4 flex flex-row items-center justify-between">
                                <CardTitle className="text-lg font-bold">Documentos Relacionados</CardTitle>
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
                        <Card className="shadow-sm border-muted/40 flex flex-col h-[600px]">
                            <CardHeader className="border-b bg-muted/10 px-6 py-4 flex flex-row items-center justify-between space-y-0">
                                <div className="flex items-center gap-2">
                                    <MessageSquare className="h-5 w-5 text-primary" />
                                    <CardTitle className="text-lg font-bold">Notas e Comentários</CardTitle>
                                </div>
                                <span className="bg-muted px-2 py-0.5 rounded text-xs font-bold text-muted-foreground">3</span>
                            </CardHeader>
                            <CardContent className="flex-1 overflow-y-auto p-5 space-y-6">
                                <Comment
                                    name="Maria Oliveira"
                                    time="10:45"
                                    avatarSeed="Maria"
                                    text="Favor verificar a nota fiscal de serviço na linha 45. Parece haver uma divergência de alíquota."
                                />
                                <Comment
                                    name="João Silva"
                                    time="11:20"
                                    avatarSeed="Joao"
                                    text="Analisado. O fornecedor emitiu com retenção indevida. Já entrei em contato para substituição."
                                    isReply
                                />
                                <Comment
                                    name="Maria Oliveira"
                                    time="12:00"
                                    avatarSeed="Maria"
                                    text="Ótimo! Aguardo a nova nota para fechar a conciliação."
                                />
                            </CardContent>
                            <div className="p-4 border-t bg-muted/30">
                                <div className="relative">
                                    <Textarea
                                        placeholder="Escreva um comentário..."
                                        className="resize-none min-h-[100px] pr-12 text-sm bg-background"
                                    />
                                    <Button size="icon" className="absolute bottom-3 right-3 h-8 w-8 bg-blue-600 hover:bg-blue-700">
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

                        {/* Progress Widget */}
                        <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-6 text-white shadow-lg">
                            <h3 className="font-bold mb-3 flex items-center gap-2">
                                <Info className="h-5 w-5" />
                                Lembrete de Prazo
                            </h3>
                            <p className="text-sm text-blue-100 mb-4 opacity-90">
                                A conciliação deve ser finalizada até o dia 20 para o fechamento mensal.
                            </p>
                            <div className="w-full bg-blue-900/40 rounded-full h-2 mb-2">
                                <div className="bg-white h-2 rounded-full" style={{ width: '65%' }} />
                            </div>
                            <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-blue-100">
                                <span>Progresso</span>
                                <span>65%</span>
                            </div>
                        </div>
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
                "w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-lg border",
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
