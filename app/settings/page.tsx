"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";

export default function SettingsPage() {
    const [responsibles, setResponsibles] = useState(["Carlos Mendes", "Ana Silva", "Roberto Junior"]);
    const [newResponsible, setNewResponsible] = useState("");

    const addResponsible = () => {
        if (newResponsible.trim()) {
            setResponsibles([...responsibles, newResponsible.trim()]);
            setNewResponsible("");
        }
    };

    const removeResponsible = (index: number) => {
        setResponsibles(responsibles.filter((_, i) => i !== index));
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Configurações</h1>
                <p className="text-lg text-muted-foreground">
                    Gerencie responsáveis, status e preferências do sistema.
                </p>
            </div>
            <Separator />

            <div className="grid gap-8 md:grid-cols-2">
                <div className="space-y-6">
                    <div>
                        <h2 className="text-xl font-semibold">Responsáveis</h2>
                        <p className="text-sm text-muted-foreground">
                            Adicione ou remova pessoas responsáveis pelos casos.
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
                        <h2 className="text-xl font-semibold">Status Personalizados</h2>
                        <p className="text-sm text-muted-foreground">
                            Configure as etiquetas de status dos seus processos.
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
