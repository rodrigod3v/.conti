"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileSpreadsheet, Cloud, MessageSquare, Building2, Check, Settings, RefreshCw } from "lucide-react";
import { useState } from "react";
import { Switch } from "@/components/ui/switch";

export default function IntegrationsPage() {
    const [isGoogleConnected, setIsGoogleConnected] = useState(true);
    const [isExcelEnabled, setIsExcelEnabled] = useState(false);

    return (
        <div className="space-y-8">
            {/* Page Heading */}
            <div className="flex flex-wrap justify-between items-center gap-4">
                <div className="flex min-w-72 flex-col gap-1">
                    <h1 className="text-3xl font-black tracking-tight">Hub de Integrações</h1>
                    <p className="text-base text-muted-foreground">
                        Conecte e automatize o fluxo de dados entre o sistema e suas ferramentas externas.
                    </p>
                </div>
                <Button className="bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-600/20 hover:scale-105 transition-transform">
                    Explorar Marketplace
                </Button>
            </div>

            {/* Active Integration Section */}
            <div>
                <div className="flex items-center gap-2 mb-4">
                    <Check className="h-5 w-5 text-orange-600" />
                    <h2 className="text-xl font-bold">Sua Integração Ativa</h2>
                </div>

                {/* Premium Google Workspace Card */}
                <Card className="border-l-4 border-l-orange-600 shadow-lg">
                    <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row items-stretch justify-between gap-6">
                            <div className="flex-[2_2_0px] flex flex-col justify-between gap-6">
                                {/* Header */}
                                <div className="flex flex-col gap-3">
                                    <div className="flex items-center gap-2">
                                        <span className="bg-orange-100 text-orange-600 text-[10px] font-bold tracking-widest px-2 py-0.5 rounded uppercase">
                                            Premium
                                        </span>
                                        {isGoogleConnected && (
                                            <span className="flex items-center gap-1 text-green-600 text-xs font-semibold">
                                                <span className="size-2 bg-green-500 rounded-full animate-pulse"></span>
                                                Conectado
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="size-14 rounded-lg bg-emerald-50 flex items-center justify-center shadow-sm">
                                            <FileSpreadsheet className="h-8 w-8 text-emerald-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-bold">Google Workspace</h3>
                                            <p className="text-sm text-muted-foreground">
                                                Sincronização bidirecional de agendas e documentos fiscais.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Stats */}
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 border-t border-b py-4">
                                    <div>
                                        <p className="text-xs uppercase font-bold tracking-tight text-muted-foreground">Frequência</p>
                                        <p className="text-sm font-semibold">Automática</p>
                                    </div>
                                    <div>
                                        <p className="text-xs uppercase font-bold tracking-tight text-muted-foreground">Última Sinc.</p>
                                        <p className="text-sm font-semibold">Hoje, 10:30</p>
                                    </div>
                                    <div className="hidden md:block">
                                        <p className="text-xs uppercase font-bold tracking-tight text-muted-foreground">Uso de Dados</p>
                                        <p className="text-sm font-semibold">1.2 GB / mês</p>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3">
                                    <Button className="bg-orange-600 hover:bg-orange-700 text-white shadow-md shadow-orange-600/20">
                                        <RefreshCw className="h-4 w-4 mr-2" />
                                        Sincronizar Agora
                                    </Button>
                                    <Button variant="outline">
                                        <Settings className="h-4 w-4 mr-2" />
                                        Gerenciar
                                    </Button>
                                </div>
                            </div>

                            {/* Preview Image */}
                            <div className="hidden lg:block w-full max-w-[340px] bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-xl flex items-center justify-center">
                                <FileSpreadsheet className="h-24 w-24 text-emerald-600 opacity-30" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Marketplace Section */}
            <div>
                <div className="flex items-center gap-2 mb-6">
                    <Building2 className="h-5 w-5 text-muted-foreground" />
                    <h2 className="text-xl font-bold">Disponíveis e Em Breve</h2>
                </div>

                {/* Grid Layout */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Excel Online Card */}
                    <Card className="hover:shadow-md transition-shadow group">
                        <CardContent className="p-5 flex flex-col gap-4">
                            <div className="flex justify-between items-start">
                                <div className="size-12 rounded-lg bg-green-50 flex items-center justify-center text-green-600">
                                    <FileSpreadsheet className="h-7 w-7" />
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <span className="bg-orange-100 text-orange-600 text-[10px] font-bold px-2 py-0.5 rounded">GRÁTIS</span>
                                    <Switch
                                        checked={isExcelEnabled}
                                        onCheckedChange={setIsExcelEnabled}
                                    />
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold">Excel Online</h3>
                                <p className="text-sm text-muted-foreground leading-snug mt-1">
                                    Exporte seus relatórios financeiros automaticamente para planilhas dinâmicas.
                                </p>
                            </div>
                            <Button
                                variant="secondary"
                                className="mt-auto w-full group-hover:bg-orange-600 group-hover:text-white transition-colors"
                            >
                                Configurar
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Dropbox Card */}
                    <Card className="hover:shadow-md transition-shadow group">
                        <CardContent className="p-5 flex flex-col gap-4">
                            <div className="flex justify-between items-start">
                                <div className="size-12 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                                    <Cloud className="h-7 w-7" />
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <span className="bg-muted text-muted-foreground text-[10px] font-bold px-2 py-0.5 rounded">EM BREVE</span>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold">Dropbox Cloud</h3>
                                <p className="text-sm text-muted-foreground leading-snug mt-1">
                                    Backup automático e organização de documentos fiscais digitalizados.
                                </p>
                            </div>
                            <Button
                                variant="secondary"
                                className="mt-auto w-full opacity-50 cursor-not-allowed"
                                disabled
                            >
                                Me avise quando chegar
                            </Button>
                        </CardContent>
                    </Card>

                    {/* ERP Contábil Card */}
                    <Card className="hover:shadow-md transition-shadow group">
                        <CardContent className="p-5 flex flex-col gap-4">
                            <div className="flex justify-between items-start">
                                <div className="size-12 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600">
                                    <Building2 className="h-7 w-7" />
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <span className="bg-muted text-muted-foreground text-[10px] font-bold px-2 py-0.5 rounded">EM BREVE</span>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold">ERP Contábil</h3>
                                <p className="text-sm text-muted-foreground leading-snug mt-1">
                                    Conecte sua contabilidade externa diretamente aos fluxos do sistema.
                                </p>
                            </div>
                            <Button
                                variant="secondary"
                                className="mt-auto w-full opacity-50 cursor-not-allowed"
                                disabled
                            >
                                Me avise quando chegar
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Slack Card */}
                    <Card className="hover:shadow-md transition-shadow group">
                        <CardContent className="p-5 flex flex-col gap-4">
                            <div className="flex justify-between items-start">
                                <div className="size-12 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
                                    <MessageSquare className="h-7 w-7" />
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <span className="bg-orange-100 text-orange-600 text-[10px] font-bold px-2 py-0.5 rounded">NOVO</span>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold">Slack</h3>
                                <p className="text-sm text-muted-foreground leading-snug mt-1">
                                    Receba alertas críticos de fluxo de caixa e aprovações no seu canal.
                                </p>
                            </div>
                            <Button
                                variant="secondary"
                                className="mt-auto w-full group-hover:bg-orange-600 group-hover:text-white transition-colors"
                            >
                                Configurar
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
