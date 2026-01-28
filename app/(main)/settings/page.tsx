"use client";

import React, { useState, useMemo } from 'react';
import { useAppStore } from "@/lib/store";
import {
    Users,
    Tag,
    ShieldCheck,
    Search,
    Save,
    Plus,
    Edit2,
    Eye,
    MoreHorizontal,
    UserPlus,
    Building2,
    X,
    CreditCard,
    Trash2
} from "lucide-react";
import { cn } from "@/lib/utils";

// --- Components based on HTML ---

export default function SettingsPage() {
    const { fileData, headers } = useAppStore();
    const [activeTab, setActiveTab] = useState<'geral' | 'equipe' | 'status' | 'seguranca'>('equipe');


    // --- Dynamic Data Extraction ---

    // 1. Team / Responsibles
    const responsibles = useMemo(() => {
        const unique = new Set<string>();
        fileData.forEach(row => {
            const val = row["Responsável"] || row["Responsavel"];
            if (val) unique.add(String(val));
        });
        return Array.from(unique).sort();
    }, [fileData]);

    // 2. Statuses
    const statuses = useMemo(() => {
        const unique = new Set<string>();
        fileData.forEach(row => {
            const val = row["Status"];
            if (val) unique.add(String(val));
        });
        return Array.from(unique).sort();
    }, [fileData]);

    // 3. Companies / Suppliers
    const companies = useMemo(() => {
        const unique = new Set<string>();
        fileData.forEach(row => {
            // Try 'Empresa' then 'Fornecedor'
            const val = row["Empresa"] || row["Fornecedor"];
            if (val) unique.add(String(val));
        });
        return Array.from(unique).sort();
    }, [fileData]);


    // Helper for Status Colors (Pseudo-random based on string)
    const getStatusColor = (status: string) => {
        const colors = [
            { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-500', btn: 'hover:bg-blue-100' },
            { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', dot: 'bg-orange-500', btn: 'hover:bg-orange-100' },
            { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', dot: 'bg-green-500', btn: 'hover:bg-green-100' },
            { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', dot: 'bg-purple-500', btn: 'hover:bg-purple-100' },
            { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-500', btn: 'hover:bg-red-100' },
            { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', dot: 'bg-indigo-500', btn: 'hover:bg-indigo-100' },
        ];
        let hash = 0;
        for (let i = 0; i < status.length; i++) {
            hash = status.charCodeAt(i) + ((hash << 5) - hash);
        }
        return colors[Math.abs(hash) % colors.length];
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#f8f7f5] text-[#181411]">


            <main className="flex flex-1 justify-center py-8">
                <div className="flex flex-col max-w-[1200px] flex-1 px-10 w-full">
                    {/* Page Title */}
                    <div className="flex flex-wrap justify-between items-end gap-3 mb-8">
                        <div className="flex min-w-72 flex-col gap-2">
                            <h1 className="text-[#181411] text-4xl font-black leading-tight tracking-[-0.033em]">Configurações Centralizadas</h1>
                            <p className="text-[#8a7560] text-base font-normal">Gestão unificada de equipe, fluxos e empresas registradas.</p>
                        </div>
                        <button className="flex min-w-[84px] cursor-pointer items-center justify-center rounded-lg h-11 px-6 bg-[#f38a20] text-white text-sm font-bold shadow-lg shadow-[#f38a20]/20 hover:scale-[1.02] active:scale-95 transition-all">
                            <Save className="mr-2 w-5 h-5" />
                            Salvar Alterações
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="mb-8 border-b border-[#e6e0db]">
                        <div className="flex px-2 gap-8 overflow-x-auto no-scrollbar">
                            <button
                                onClick={() => setActiveTab('equipe')}
                                className={cn(
                                    "flex flex-col items-center justify-center border-b-2 pb-3 pt-2 transition-all min-w-[80px]",
                                    activeTab === 'equipe' ? "border-[#f38a20] text-[#f38a20]" : "border-transparent text-[#8a7560] hover:text-[#181411]"
                                )}
                            >
                                <div className="flex items-center gap-2">
                                    <Users className="w-5 h-5" />
                                    <p className="text-sm font-bold tracking-[0.015em]">Equipe</p>
                                </div>
                            </button>
                            <button
                                onClick={() => setActiveTab('status')}
                                className={cn(
                                    "flex flex-col items-center justify-center border-b-2 pb-3 pt-2 transition-all min-w-[80px]",
                                    activeTab === 'status' ? "border-[#f38a20] text-[#f38a20]" : "border-transparent text-[#8a7560] hover:text-[#181411]"
                                )}
                            >
                                <div className="flex items-center gap-2">
                                    <Tag className="w-5 h-5" />
                                    <p className="text-sm font-bold tracking-[0.015em]">Status</p>
                                </div>
                            </button>
                            <button
                                onClick={() => setActiveTab('geral')}
                                className={cn(
                                    "flex flex-col items-center justify-center border-b-2 pb-3 pt-2 transition-all min-w-[80px]",
                                    activeTab === 'geral' ? "border-[#f38a20] text-[#f38a20]" : "border-transparent text-[#8a7560] hover:text-[#181411]"
                                )}
                            >
                                <div className="flex items-center gap-2">
                                    <Building2 className="w-5 h-5" />
                                    <p className="text-sm font-bold tracking-[0.015em]">Empresas</p>
                                </div>
                            </button>
                            <button
                                onClick={() => setActiveTab('seguranca')}
                                className={cn(
                                    "flex flex-col items-center justify-center border-b-2 pb-3 pt-2 transition-all min-w-[80px]",
                                    activeTab === 'seguranca' ? "border-[#f38a20] text-[#f38a20]" : "border-transparent text-[#8a7560] hover:text-[#181411]"
                                )}
                            >
                                <div className="flex items-center gap-2">
                                    <ShieldCheck className="w-5 h-5" />
                                    <p className="text-sm font-bold tracking-[0.015em]">Segurança</p>
                                </div>
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col gap-10">
                        {/* TAB: EQUIPE */}
                        {activeTab === 'equipe' && (
                            <section className="bg-white rounded-xl border border-[#e6e0db] shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-6 bg-[#fcfaf9] border-b border-[#e6e0db]">
                                    <div className="relative flex-1 max-w-md">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8a7560]" />
                                        <input
                                            className="w-full pl-10 pr-4 py-2 bg-white border border-[#e6e0db] rounded-lg text-sm focus:ring-[#f38a20] focus:border-[#f38a20] outline-none text-[#181411]"
                                            placeholder="Buscar membros pelo nome ou email..."
                                            type="text"
                                        />
                                    </div>
                                    <button className="flex items-center gap-2 px-6 py-2.5 bg-[#f38a20] text-white rounded-lg text-sm font-bold shadow-lg shadow-[#f38a20]/20 hover:brightness-110 active:scale-95 transition-all">
                                        <UserPlus className="w-5 h-5" />
                                        Convidar Membro
                                    </button>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="bg-[#fcfaf9] border-b border-[#e6e0db]">
                                                <th className="px-6 py-4 text-xs font-bold text-[#003366] uppercase tracking-wider">Membro</th>
                                                <th className="px-6 py-4 text-xs font-bold text-[#003366] uppercase tracking-wider">E-mail</th>
                                                <th className="px-6 py-4 text-xs font-bold text-[#003366] uppercase tracking-wider">Cargo</th>
                                                <th className="px-6 py-4 text-xs font-bold text-[#003366] uppercase tracking-wider">Status</th>
                                                <th className="px-6 py-4 text-xs font-bold text-[#003366] uppercase tracking-wider text-right">Ações</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#e6e0db]">
                                            {responsibles.map((member, idx) => (
                                                <tr key={member} className="hover:bg-[#f8f7f5] transition-colors group">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-10 w-10 rounded-full bg-[#fcfaf9] border border-[#e6e0db] flex items-center justify-center text-[#003366] font-bold">
                                                                {member.charAt(0).toUpperCase()}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-bold text-[#003366]">{member}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <p className="text-sm text-[#8a7560]">{member.toLowerCase().replace(/\s/g, '.')}@conti.com</p>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <select className="text-xs font-semibold bg-[#f5f2f0] border-none rounded-md focus:ring-[#f38a20] py-1 px-2 pr-8 text-[#003366] outline-none cursor-pointer">
                                                            <option>Administrador</option>
                                                            <option>Contador</option>
                                                            <option selected={idx % 2 !== 0}>Visualizador</option>
                                                        </select>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <div className="relative inline-block w-10 h-5">
                                                                <input
                                                                    defaultChecked={true}
                                                                    type="checkbox"
                                                                    className="peer appearance-none w-10 h-5 bg-gray-300 rounded-full checked:bg-[#f38a20] cursor-pointer transition-colors duration-200"
                                                                />
                                                                <span className="absolute left-1 top-1 bg-white w-3 h-3 rounded-full transition-transform duration-200 peer-checked:translate-x-5 pointer-events-none"></span>
                                                            </div>
                                                            <span className="text-xs font-medium text-[#181411]">Ativo</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex justify-end gap-2">
                                                            <button className="p-2 text-[#8a7560] hover:text-[#003366] transition-colors" title="Permissões">
                                                                <ShieldCheck className="w-5 h-5" />
                                                            </button>
                                                            <button className="p-2 text-[#8a7560] hover:text-red-500 transition-colors" title="Excluir">
                                                                <Trash2 className="w-5 h-5" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                            {responsibles.length === 0 && (
                                                <tr>
                                                    <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground text-sm">
                                                        Nenhum membro encontrado.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="px-6 py-4 border-t border-[#e6e0db] flex justify-between items-center bg-[#fcfaf9]">
                                    <p className="text-xs text-[#8a7560]">Exibindo {responsibles.length} de {responsibles.length} membros registrados</p>
                                    <div className="flex gap-2">
                                        <button className="px-3 py-1 text-xs font-bold border border-[#e6e0db] rounded hover:bg-[#f5f2f0] transition-colors disabled:opacity-50" disabled>Anterior</button>
                                        <button className="px-3 py-1 text-xs font-bold border border-[#e6e0db] rounded hover:bg-[#f5f2f0] transition-colors disabled:opacity-50" disabled>Próximo</button>
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* TAB: STATUS */}
                        {activeTab === 'status' && (
                            <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <section>
                                    <h2 className="text-[#181411] text-xl font-bold mb-6">Status do Fluxo de Trabalho</h2>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {statuses.map(status => {
                                            // Simple hash for color cycling
                                            const colors = ['bg-blue-500', 'bg-orange-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 'bg-cyan-400', 'bg-emerald-500', 'bg-red-500'];
                                            let hash = 0;
                                            for (let i = 0; i < status.length; i++) hash = status.charCodeAt(i) + ((hash << 5) - hash);
                                            const colorClass = colors[Math.abs(hash) % colors.length];

                                            return (
                                                <div key={status} className="flex items-center justify-between p-4 bg-white border border-[#e6e0db] rounded-xl shadow-sm group hover:border-[#f38a20]/50 transition-colors">
                                                    <div className="flex items-center gap-3">
                                                        <div className={cn("size-3 rounded-full", colorClass)}></div>
                                                        <span className="font-bold text-[#181411]">{status}</span>
                                                    </div>
                                                    <button className="text-[#8a7560] hover:text-red-500 transition-colors">
                                                        <X className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            );
                                        })}
                                        {statuses.length === 0 && (
                                            <p className="col-span-full text-center text-[#8a7560] italic py-8">
                                                Nenhum status encontrado na planilha.
                                            </p>
                                        )}
                                    </div>
                                </section>

                                <section>
                                    <div className="bg-white rounded-2xl border border-[#e6e0db] shadow-lg p-8 max-w-2xl">
                                        <h2 className="text-[#181411] text-2xl font-bold mb-6">Criar Novo Status</h2>
                                        <div className="flex flex-col gap-8">
                                            <div className="flex flex-col gap-2">
                                                <label className="text-sm font-bold text-[#181411]">Nome do Rótulo</label>
                                                <input
                                                    className="w-full h-12 px-4 rounded-xl border-[#e6e0db] bg-[#fcfaf9] focus:ring-2 focus:ring-[#f38a20] focus:border-[#f38a20] text-base placeholder:text-[#8a7560] outline-none"
                                                    placeholder="Digite o nome do status..."
                                                    type="text"
                                                />
                                            </div>
                                            <div className="flex flex-col gap-4">
                                                <label className="text-sm font-bold text-[#181411]">Selecione uma cor</label>
                                                <div className="flex flex-wrap gap-4">
                                                    <button className="size-10 rounded-full bg-red-500 ring-offset-2 ring-[#f38a20] hover:ring-2 transition-all"></button>
                                                    <button className="size-10 rounded-full bg-blue-500 ring-offset-2 ring-[#f38a20] ring-2 transition-all"></button>
                                                    <button className="size-10 rounded-full bg-green-500 ring-offset-2 ring-[#f38a20] hover:ring-2 transition-all"></button>
                                                    <button className="size-10 rounded-full bg-yellow-400 ring-offset-2 ring-[#f38a20] hover:ring-2 transition-all"></button>
                                                    <button className="size-10 rounded-full bg-purple-600 ring-offset-2 ring-[#f38a20] hover:ring-2 transition-all"></button>
                                                    <button className="size-10 rounded-full bg-pink-500 ring-offset-2 ring-[#f38a20] hover:ring-2 transition-all"></button>
                                                    <button className="size-10 rounded-full bg-cyan-400 ring-offset-2 ring-[#f38a20] hover:ring-2 transition-all"></button>
                                                    <button className="size-10 rounded-full bg-emerald-500 ring-offset-2 ring-[#f38a20] hover:ring-2 transition-all"></button>
                                                </div>
                                            </div>
                                            <button className="w-full h-14 bg-[#f38a20] text-white rounded-xl text-lg font-bold shadow-xl shadow-[#f38a20]/20 hover:bg-[#e07b1a] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                                                <Plus className="w-6 h-6" />
                                                Adicionar Status
                                            </button>
                                        </div>
                                    </div>
                                </section>
                            </div>
                        )}

                        {/* TAB: GERAL / EMPRESAS */}
                        {activeTab === 'geral' && (
                            <section className="bg-white rounded-xl border border-[#e6e0db] shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="flex items-center justify-between px-6 py-5 border-b border-[#e6e0db]">
                                    <h2 className="text-[#181411] text-xl font-bold">Empresas / Fornecedores</h2>
                                    <button className="flex items-center gap-2 px-4 py-2 bg-[#f38a20] text-white rounded-lg text-sm font-bold hover:brightness-110 shadow-lg shadow-[#f38a20]/10 transition-all">
                                        <Building2 className="w-4 h-4" />
                                        Adicionar Empresa
                                    </button>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-[#fcfaf9]">
                                            <tr>
                                                <th className="px-6 py-4 text-xs font-bold text-[#8a7560] uppercase tracking-wider">Empresa / CNPJ</th>
                                                <th className="px-6 py-4 text-xs font-bold text-[#8a7560] uppercase tracking-wider">Status</th>
                                                <th className="px-6 py-4 text-xs font-bold text-[#8a7560] uppercase tracking-wider">Última Atividade</th>
                                                <th className="px-6 py-4 text-xs font-bold text-[#8a7560] uppercase tracking-wider text-right">Ações</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#e6e0db]">
                                            {companies.map((company, idx) => (
                                                <tr key={company} className="hover:bg-[#f8f7f5] transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div>
                                                            <p className="text-sm font-bold text-[#181411]">{company}</p>
                                                            <p className="text-xs text-[#8a7560]">CNPJ não informado</p>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-green-100 text-green-700 border border-green-200">
                                                            Ativo
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <p className="text-xs text-[#181411]">Recente</p>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex justify-end gap-3">
                                                            <button className="p-2 text-[#8a7560] hover:text-[#f38a20] transition-colors">
                                                                <Eye className="w-5 h-5" />
                                                            </button>
                                                            <button className="p-2 text-[#8a7560] hover:text-[#f38a20] transition-colors">
                                                                <Edit2 className="w-5 h-5" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                            {companies.length === 0 && (
                                                <tr>
                                                    <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground text-sm">
                                                        Nenhuma empresa encontrada.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
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
