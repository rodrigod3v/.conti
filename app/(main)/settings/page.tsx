"use client";

import React, { useState } from 'react';
import { DropdownManager } from "@/components/features/settings/dropdown-manager";
import {
    ShieldCheck,
    List,
    Save
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState<'listas' | 'seguranca'>('listas');

    return (
        <div className="flex flex-col min-h-screen bg-[#f8f7f5] text-[#181411]">
            <main className="flex flex-1 justify-center py-8">
                <div className="flex flex-col max-w-[1200px] flex-1 px-10 w-full">

                    <div className="flex flex-wrap justify-between items-end gap-3 mb-8">
                        <div className="flex min-w-72 flex-col gap-2">
                            <h1 className="text-[#181411] text-4xl font-black leading-tight tracking-[-0.033em]">Configurações Centralizadas</h1>
                            <p className="text-[#8a7560] text-base font-normal">Gestão das configurações do sistema.</p>
                        </div>
                        <Button className="flex min-w-[84px] cursor-pointer items-center justify-center rounded-lg h-11 px-6 bg-[#f38a20] text-white text-sm font-bold shadow-lg shadow-[#f38a20]/20 hover:scale-[1.02] active:scale-95 transition-all outline-none border-none">
                            <Save className="mr-2 w-5 h-5" />
                            Salvar Alterações
                        </Button>
                    </div>

                    {/* Tabs */}
                    <div className="mb-8 border-b border-[#e6e0db]">
                        <div className="flex px-2 gap-8 overflow-x-auto no-scrollbar">
                            {[
                                { id: 'listas', label: 'Listas', icon: List },
                                { id: 'seguranca', label: 'Segurança', icon: ShieldCheck },
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={cn(
                                        "flex flex-col items-center justify-center border-b-2 pb-3 pt-2 transition-all min-w-[80px]",
                                        activeTab === tab.id ? "border-[#f38a20] text-[#f38a20]" : "border-transparent text-[#8a7560] hover:text-[#181411]"
                                    )}
                                >
                                    <div className="flex items-center gap-2">
                                        <tab.icon className="w-5 h-5" />
                                        <p className="text-sm font-bold tracking-[0.015em]">{tab.label}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col gap-10">

                        {/* TAB: LISTAS / DROPDOWNS */}
                        {activeTab === 'listas' && (
                            <section className="bg-transparent animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="mb-4">
                                    <h2 className="text-[#181411] text-xl font-bold">Listas Personalizadas</h2>
                                    <p className="text-sm text-[#8a7560]">Gerencie as opções para os menus suspensos da sua planilha.</p>
                                </div>
                                <DropdownManager />
                            </section>
                        )}

                        {/* TAB: SEGURANÇA */}
                        {activeTab === 'seguranca' && (
                            <section className="bg-white rounded-xl border border-[#e6e0db] shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="px-6 py-5 border-b border-[#e6e0db]">
                                    <h2 className="text-[#181411] text-xl font-bold">Segurança e Acesso</h2>
                                    <p className="text-sm text-[#8a7560] mt-1">Gerencie permissões e segurança da conta.</p>
                                </div>
                                <div className="p-10 flex flex-col items-center justify-center text-center">
                                    <div className="h-16 w-16 bg-[#f38a20]/10 rounded-full flex items-center justify-center mb-4">
                                        <ShieldCheck className="w-8 h-8 text-[#f38a20]" />
                                    </div>
                                    <h3 className="text-lg font-bold text-[#181411]">Configurações de Segurança</h3>
                                    <p className="text-[#8a7560] max-w-sm mt-2 mb-6">Em breve você poderá configurar 2FA, logs de auditoria e políticas de senha aqui.</p>
                                    <button className="px-6 py-2.5 bg-[#f38a20] text-white rounded-lg font-bold shadow-lg shadow-[#f38a20]/20 hover:brightness-110 transition-all opacity-50 cursor-not-allowed">
                                        Indisponível no momento
                                    </button>
                                </div>
                            </section>
                        )}

                    </div>
                </div>
            </main>
        </div>
    );
}
