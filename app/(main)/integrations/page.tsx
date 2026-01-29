"use client";

import React, { useState } from 'react';
import {
    FileSpreadsheet,
    Cloud,
    MessageSquare,
    Building2,
    Check,
    Settings,
    RefreshCw,
    Plus,
    Search,
    ExternalLink,
    HelpCircle,
    BookOpen,
    Key,
    ShieldCheck,
    AlertTriangle,
    X,
    ChevronRight,
    Copy
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/simple-toast";

export default function IntegrationsPage() {
    const toast = useToast();
    const [activeTab, setActiveTab] = useState<'my-apps' | 'marketplace' | 'help'>('my-apps');

    // Google Sheets State
    const [isGoogleConnected, setIsGoogleConnected] = useState(false);
    const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
    const [googleSheetId, setGoogleSheetId] = useState("");
    const [isSyncing, setIsSyncing] = useState(false);

    // Excel State
    const [isExcelEnabled, setIsExcelEnabled] = useState(false);

    const handleConnectGoogle = () => {
        if (!googleSheetId) {
            toast.error(
                "ID Inválido",
                "Por favor, insira o ID da planilha ou o link de compartilhamento."
            );
            return;
        }

        // Simulating API Connection
        setIsSyncing(true);
        setTimeout(() => {
            setIsSyncing(false);
            setIsGoogleConnected(true);
            setIsGoogleModalOpen(false);
            toast.success(
                "Conexão Estabelecida",
                "Sua planilha foi vinculada com sucesso ao sistema."
            );
        }, 1500);
    };

    const handleSyncNow = () => {
        setIsSyncing(true);
        setTimeout(() => {
            setIsSyncing(false);
            toast.success(
                "Sincronização Concluída",
                "Todos os dados foram atualizados com a planilha remota."
            );
        }, 2000);
    };

    const handleDisconnect = () => {
        setIsGoogleConnected(false);
        setGoogleSheetId("");
        toast.item(
            "Desconectado",
            "A integração com Google Sheets foi removida."
        );
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#f8f7f5] text-[#181411]">
            <main className="flex flex-1 justify-center py-8">
                <div className="flex flex-col max-w-[1200px] flex-1 px-10 w-full">

                    {/* Page Title */}
                    <div className="flex flex-wrap justify-between items-end gap-3 mb-8">
                        <div className="flex min-w-72 flex-col gap-2">
                            <h1 className="text-[#181411] text-4xl font-black leading-tight tracking-[-0.033em]">
                                Hub de Integrações
                            </h1>
                            <p className="text-[#8a7560] text-base font-normal">
                                Conecte suas ferramentas favoritas e automatize o fluxo de dados.
                            </p>
                        </div>
                        <Button
                            className="bg-[#f38a20] hover:bg-[#e07b1a] text-white font-bold shadow-lg shadow-[#f38a20]/20 min-w-[160px]"
                            onClick={() => setActiveTab('marketplace')}
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Nova Conexão
                        </Button>
                    </div>

                    {/* Tabs */}
                    <div className="mb-8 border-b border-[#e6e0db]">
                        <div className="flex px-2 gap-8 overflow-x-auto no-scrollbar">
                            <button
                                onClick={() => setActiveTab('my-apps')}
                                className={cn(
                                    "flex flex-col items-center justify-center border-b-2 pb-3 pt-2 transition-all min-w-[100px]",
                                    activeTab === 'my-apps' ? "border-[#f38a20] text-[#f38a20]" : "border-transparent text-[#8a7560] hover:text-[#181411]"
                                )}
                            >
                                <div className="flex items-center gap-2">
                                    <Cloud className="w-5 h-5" />
                                    <p className="text-sm font-bold tracking-[0.015em]">Meus Apps</p>
                                </div>
                            </button>
                            <button
                                onClick={() => setActiveTab('marketplace')}
                                className={cn(
                                    "flex flex-col items-center justify-center border-b-2 pb-3 pt-2 transition-all min-w-[100px]",
                                    activeTab === 'marketplace' ? "border-[#f38a20] text-[#f38a20]" : "border-transparent text-[#8a7560] hover:text-[#181411]"
                                )}
                            >
                                <div className="flex items-center gap-2">
                                    <Building2 className="w-5 h-5" />
                                    <p className="text-sm font-bold tracking-[0.015em]">Marketplace</p>
                                </div>
                            </button>
                            <button
                                onClick={() => setActiveTab('help')}
                                className={cn(
                                    "flex flex-col items-center justify-center border-b-2 pb-3 pt-2 transition-all min-w-[100px]",
                                    activeTab === 'help' ? "border-[#f38a20] text-[#f38a20]" : "border-transparent text-[#8a7560] hover:text-[#181411]"
                                )}
                            >
                                <div className="flex items-center gap-2">
                                    <BookOpen className="w-5 h-5" />
                                    <p className="text-sm font-bold tracking-[0.015em]">Ajuda & Docs</p>
                                </div>
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col gap-10">

                        {/* TAB: MY APPS */}
                        {activeTab === 'my-apps' && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                {/* Google Sheets - Premium Card */}
                                <div className="bg-white rounded-xl border border-[#e6e0db] shadow-sm overflow-hidden relative">
                                    <div className="absolute top-0 right-0 p-4">
                                        <div className="flex items-center gap-2">
                                            {isGoogleConnected ? (
                                                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-bold border border-green-200">
                                                    <span className="relative flex h-2 w-2">
                                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                                    </span>
                                                    Conectado
                                                </span>
                                            ) : (
                                                <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-500 text-xs font-bold border border-gray-200">
                                                    Desconectado
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="p-8 flex flex-col md:flex-row gap-8">
                                        {/* Icon Section */}
                                        <div className="shrink-0">
                                            <div className="w-20 h-20 bg-green-50 rounded-2xl flex items-center justify-center border border-green-100">
                                                <FileSpreadsheet className="w-10 h-10 text-green-600" />
                                            </div>
                                        </div>

                                        {/* Content Section */}
                                        <div className="flex-1 space-y-4">
                                            <div>
                                                <h3 className="text-xl font-bold text-[#181411] flex items-center gap-2">
                                                    Google Sheets Integration
                                                    <span className="px-2 py-0.5 rounded bg-orange-100 text-[#f38a20] text-[10px] font-black uppercase tracking-wider">Premium</span>
                                                </h3>
                                                <p className="text-[#8a7560] mt-1 max-w-2xl">
                                                    Sincronização bidirecional em tempo real. Importe dados de planilhas e mantenha seus relatórios financeiros sempre atualizados automaticamente.
                                                </p>
                                            </div>

                                            {isGoogleConnected ? (
                                                <div className="bg-[#fcfaf9] border border-[#e6e0db] rounded-lg p-4 flex flex-col sm:flex-row gap-6 mt-4">
                                                    <div className="space-y-1">
                                                        <p className="text-xs uppercase font-bold text-[#8a7560]">Planilha Conectada</p>
                                                        <div className="flex items-center gap-2 font-mono text-sm text-[#181411]">
                                                            <span className="truncate max-w-[200px]">{googleSheetId}</span>
                                                            <ExternalLink className="w-3 h-3 text-[#f38a20] cursor-pointer" />
                                                        </div>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-xs uppercase font-bold text-[#8a7560]">Última Sincronização</p>
                                                        <p className="text-sm font-semibold text-[#181411]">Hoje, 14:30</p>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-xs uppercase font-bold text-[#8a7560]">Status do Webhook</p>
                                                        <p className="text-sm font-semibold text-green-600">Ativo</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-4 text-sm text-blue-800 flex gap-3 items-start">
                                                    <AlertTriangle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                                                    <div>
                                                        <p className="font-bold">Configuração Necessária</p>
                                                        <p className="text-blue-700/80">Para ativar a sincronização, você precisa fornecer o ID da sua planilha Google e garantir que a conta de serviço tenha permissão de leitura.</p>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="flex gap-3 pt-2">
                                                {isGoogleConnected ? (
                                                    <>
                                                        <Button
                                                            onClick={handleSyncNow}
                                                            disabled={isSyncing}
                                                            className="bg-[#181411] text-white hover:bg-[#322a24]"
                                                        >
                                                            <RefreshCw className={cn("mr-2 w-4 h-4", isSyncing && "animate-spin")} />
                                                            {isSyncing ? "Sincronizando..." : "Sincronizar Agora"}
                                                        </Button>
                                                        <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={handleDisconnect}>
                                                            Desconectar
                                                        </Button>
                                                    </>
                                                ) : (
                                                    <Dialog open={isGoogleModalOpen} onOpenChange={setIsGoogleModalOpen}>
                                                        <DialogTrigger asChild>
                                                            <Button className="bg-[#f38a20] hover:bg-[#e07b1a] text-white font-bold shadow-md shadow-[#f38a20]/20">
                                                                Conectar Planilha
                                                            </Button>
                                                        </DialogTrigger>
                                                        <DialogContent className="sm:max-w-[500px]">
                                                            <DialogHeader>
                                                                <DialogTitle>Conectar Google Sheets</DialogTitle>
                                                                <DialogDescription>
                                                                    Insira o ID da planilha ou o link de compartilhamento para vincular.
                                                                </DialogDescription>
                                                            </DialogHeader>
                                                            <div className="grid gap-4 py-4">
                                                                <div className="space-y-2">
                                                                    <label className="text-sm font-medium">Link ou ID da Planilha</label>
                                                                    <Input
                                                                        placeholder="ex: 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
                                                                        value={googleSheetId}
                                                                        onChange={(e) => setGoogleSheetId(e.target.value)}
                                                                    />
                                                                    <p className="text-[11px] text-muted-foreground">
                                                                        Certifique-se que o e-mail do sistema (bot@conti-app.iam.gserviceaccount.com) está adicionado como Editor na planilha.
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <DialogFooter>
                                                                <Button variant="outline" onClick={() => setIsGoogleModalOpen(false)}>Cancelar</Button>
                                                                <Button onClick={handleConnectGoogle} className="bg-[#f38a20] text-white hover:bg-[#e07b1a]">
                                                                    {isSyncing ? "Verificando..." : "Salvar e Conectar"}
                                                                </Button>
                                                            </DialogFooter>
                                                        </DialogContent>
                                                    </Dialog>
                                                )}
                                                <Button variant="ghost" className="text-[#8a7560]" onClick={() => setActiveTab('help')}>
                                                    Como funciona?
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Excel Online - Secondary Card */}
                                <div className="bg-white rounded-xl border border-[#e6e0db] shadow-sm p-6 flex items-center justify-between">
                                    <div className="flex items-center gap-6">
                                        <div className="w-14 h-14 bg-green-50 rounded-xl flex items-center justify-center border border-green-100">
                                            <FileSpreadsheet className="w-7 h-7 text-green-700" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-[#181411]">Excel Online (OneDrive)</h3>
                                            <p className="text-[#8a7560] text-sm">Leitura automática de arquivos .xlsx na pasta local do servidor.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-sm font-medium text-[#181411]">{isExcelEnabled ? "Ativado" : "Desativado"}</span>
                                        <Switch
                                            checked={isExcelEnabled}
                                            onCheckedChange={setIsExcelEnabled}
                                            className="data-[state=checked]:bg-[#f38a20]"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TAB: MARKETPLACE */}
                        {activeTab === 'marketplace' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                {/* Slack */}
                                <div className="group bg-white rounded-xl border border-[#e6e0db] p-6 hover:shadow-md hover:border-[#f38a20]/30 transition-all">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="w-12 h-12 bg-[#4A154B]/10 rounded-lg flex items-center justify-center">
                                            <MessageSquare className="w-6 h-6 text-[#4A154B]" />
                                        </div>
                                        <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded">BETA</span>
                                    </div>
                                    <h3 className="text-lg font-bold text-[#181411] mb-2">Slack</h3>
                                    <p className="text-[#8a7560] text-sm mb-6">Receba notificações de alterações de status e novos casos diretamente no canal da equipe.</p>
                                    <Button variant="outline" className="w-full text-[#181411] hover:text-[#f38a20] hover:border-[#f38a20]">Configurar</Button>
                                </div>

                                {/* Dropbox */}
                                <div className="group bg-white rounded-xl border border-[#e6e0db] p-6 hover:shadow-md hover:border-[#f38a20]/30 transition-all">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="w-12 h-12 bg-[#0061FE]/10 rounded-lg flex items-center justify-center">
                                            <Cloud className="w-6 h-6 text-[#0061FE]" />
                                        </div>
                                        <span className="bg-gray-100 text-gray-500 text-[10px] font-bold px-2 py-0.5 rounded">EM BREVE</span>
                                    </div>
                                    <h3 className="text-lg font-bold text-[#181411] mb-2">Dropbox</h3>
                                    <p className="text-[#8a7560] text-sm mb-6">Backup automático de todos os anexos e PDFs gerados pelo sistema.</p>
                                    <Button disabled className="w-full opacity-50 bg-gray-50 text-gray-400 border-none">Indisponível</Button>
                                </div>

                                {/* Custom API */}
                                <div className="group bg-white rounded-xl border border-[#e6e0db] p-6 hover:shadow-md hover:border-[#f38a20]/30 transition-all">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="w-12 h-12 bg-[#f38a20]/10 rounded-lg flex items-center justify-center">
                                            <Key className="w-6 h-6 text-[#f38a20]" />
                                        </div>
                                        <span className="bg-orange-100 text-[#f38a20] text-[10px] font-bold px-2 py-0.5 rounded">DEV</span>
                                    </div>
                                    <h3 className="text-lg font-bold text-[#181411] mb-2">API Personalizada</h3>
                                    <p className="text-[#8a7560] text-sm mb-6">Use nossa API REST para conectar seu ERP legado ou sistemas internos.</p>
                                    <Button variant="outline" className="w-full text-[#181411] hover:text-[#f38a20] hover:border-[#f38a20]">Gerar Chaves</Button>
                                </div>
                            </div>
                        )}

                        {/* TAB: HELP / DOCS */}
                        {activeTab === 'help' && (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                {/* Main Content */}
                                <div className="lg:col-span-2 space-y-6">
                                    <div className="bg-white rounded-xl border border-[#e6e0db] p-8">
                                        <h2 className="text-2xl font-bold text-[#181411] mb-6 flex items-center gap-2">
                                            <BookOpen className="w-6 h-6 text-[#f38a20]" />
                                            Guia de Conexão Google
                                        </h2>

                                        <div className="space-y-6">
                                            <div className="flex gap-4">
                                                <div className="flex-none w-8 h-8 rounded-full bg-[#f38a20] text-white flex items-center justify-center font-bold text-sm">1</div>
                                                <div>
                                                    <h3 className="font-bold text-[#181411] mb-1">Prepare sua Planilha</h3>
                                                    <p className="text-[#8a7560] text-sm leading-relaxed">
                                                        Certifique-se que sua planilha possui um cabeçalho na primeira linha. O sistema usará esses nomes como campos.
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="w-[1px] h-4 bg-[#e6e0db] ml-4"></div>

                                            <div className="flex gap-4">
                                                <div className="flex-none w-8 h-8 rounded-full bg-[#f38a20] text-white flex items-center justify-center font-bold text-sm">2</div>
                                                <div>
                                                    <h3 className="font-bold text-[#181411] mb-1">Compartilhe o Acesso</h3>
                                                    <p className="text-[#8a7560] text-sm leading-relaxed mb-3">
                                                        No Google Sheets, clique em "Compartilhar" e adicione o e-mail de serviço do nosso sistema como <strong>Editor</strong>:
                                                    </p>
                                                    <div className="flex items-center gap-2 bg-[#f8f7f5] border border-[#e6e0db] p-3 rounded-lg max-w-md">
                                                        <code className="text-xs text-[#181411] font-mono flex-1">bot@conti-app.iam.gserviceaccount.com</code>
                                                        <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:text-[#f38a20]" title="Copiar">
                                                            <Copy className="w-3 h-3" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="w-[1px] h-4 bg-[#e6e0db] ml-4"></div>

                                            <div className="flex gap-4">
                                                <div className="flex-none w-8 h-8 rounded-full bg-[#f38a20] text-white flex items-center justify-center font-bold text-sm">3</div>
                                                <div>
                                                    <h3 className="font-bold text-[#181411] mb-1">Conecte no Hub</h3>
                                                    <p className="text-[#8a7560] text-sm leading-relaxed">
                                                        Copie o URL ou ID da sua planilha e cole no modal de conexão na aba "Meus Apps".
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Sidebar Help */}
                                <div className="space-y-6">
                                    <div className="bg-[#181411] text-white rounded-xl p-6 shadow-lg">
                                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                            <HelpCircle className="w-5 h-5 text-[#f38a20]" />
                                            FAQ Rápido
                                        </h3>
                                        <div className="space-y-4">
                                            <details className="group">
                                                <summary className="font-medium text-sm cursor-pointer list-none flex items-center justify-between text-gray-300 hover:text-white transition-colors">
                                                    A sincronização é automática?
                                                    <ChevronRight className="w-4 h-4 transition-transform group-open:rotate-90" />
                                                </summary>
                                                <p className="text-xs text-gray-400 mt-2 leading-relaxed pl-2 border-l border-gray-700">
                                                    Sim, o sistema verifica alterações a cada 30 minutos no plano Enterprise.
                                                </p>
                                            </details>
                                            <div className="h-[1px] bg-gray-800"></div>
                                            <details className="group">
                                                <summary className="font-medium text-sm cursor-pointer list-none flex items-center justify-between text-gray-300 hover:text-white transition-colors">
                                                    Meus dados estão seguros?
                                                    <ChevronRight className="w-4 h-4 transition-transform group-open:rotate-90" />
                                                </summary>
                                                <p className="text-xs text-gray-400 mt-2 leading-relaxed pl-2 border-l border-gray-700">
                                                    Absolutamente. Usamos criptografia AES-256 e OAuth 2.0. Não armazenamos suas senhas do Google.
                                                </p>
                                            </details>
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-xl border border-[#e6e0db] p-6 text-center">
                                        <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <ShieldCheck className="w-6 h-6 text-blue-600" />
                                        </div>
                                        <h3 className="font-bold text-[#181411] mb-2">Precisa de suporte técnico?</h3>
                                        <p className="text-[#8a7560] text-xs mb-4">Nossa equipe de engenharia pode ajudar a configurar integrações complexas.</p>
                                        <Button variant="outline" className="w-full text-blue-600 border-blue-200 hover:bg-blue-50">Abrir Chamado</Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
