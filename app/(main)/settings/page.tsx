"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";


export default function SettingsPage() {
    const [responsibles, setResponsibles] = useState<string[]>([]);
    const [statusList, setStatusList] = useState<string[]>([]);
    const [newResponsible, setNewResponsible] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    const saveSettings = async (newResponsibles: string[], newStatus: string[]) => {
        await fetch('/api/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ responsibles: newResponsibles, status: newStatus })
        });
    };

    const addResponsible = () => {
        if (newResponsible.trim()) {
            const updated = [...responsibles, newResponsible.trim()];
            setResponsibles(updated);
            setNewResponsible("");
            saveSettings(updated, statusList);
        }
    };

    const removeResponsible = (index: number) => {
        const updated = responsibles.filter((_, i) => i !== index);
        setResponsibles(updated);
        saveSettings(updated, statusList);
    };

    if (isLoading) return <div>Carregando configurações...</div>;

    return (
        <div className="space-y-6 p-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Configurações</h1>
                <p className="text-sm text-muted-foreground">
                    Gerencie responsáveis, status e configurações de campos.
                </p>
            </div>
            <Separator />

            {/* Field Configuration Section Removed - Moved to Editor */}


            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-6">
                    <div>
                        <h2 className="text-lg font-semibold">Responsáveis</h2>
                        <p className="text-xs text-muted-foreground">
                            Adicione ou remova pessoas.
                        </p>
                    </div>

                    <div className="flex w-full items-center space-x-2">
                        <Input
                            type="text"
                            placeholder="Nome do responsável"
                            value={newResponsible}
                            onChange={(e) => setNewResponsible(e.target.value)}
                        />
                        <Button onClick={addResponsible}>
                            <Plus className="mr-2 h-4 w-4" /> Adicionar
                        </Button>
                    </div>

                    <div className="rounded-md border">
                        {responsibles.map((resp, index) => (
                            <div key={index} className="flex items-center justify-between p-3 border-b last:border-0 hover:bg-muted/50">
                                <span className="font-medium">{resp}</span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                    onClick={() => removeResponsible(index)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-6">
                    <div>
                        <h2 className="text-lg font-semibold">Status Personalizados</h2>
                        <p className="text-xs text-muted-foreground">
                            Configure as etiquetas de status.
                        </p>
                    </div>
                    {/* Mock for Status Config - keeping it simple for MVP */}
                    <div className="rounded-md border p-6 bg-muted/20">
                        <p className="text-sm text-muted-foreground text-center">
                            Configuração de status avançada disponível no plano Enterprise.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
