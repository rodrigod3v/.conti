"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Grid, Cloud, Check } from "lucide-react";
import { useState } from "react";

export default function IntegrationsPage() {
    const [isConnected, setIsConnected] = useState(false);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Integrações</h1>
                <p className="text-lg text-muted-foreground">
                    Conecte ferramentas externas para sincronização de dados.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader>
                        <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                            <Grid className="h-6 w-6" />
                        </div>
                        <CardTitle>Google Sheets</CardTitle>
                        <CardDescription>Sincronize suas planilhas automaticamente.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isConnected ? (
                            <div className="flex items-center space-x-2 text-emerald-600 mb-4 bg-emerald-50 p-2 rounded-md">
                                <Check className="h-4 w-4" />
                                <span className="text-sm font-medium">Conectado como carlos@cpa.com.br</span>
                            </div>
                        ) : null}
                        <Button
                            variant={isConnected ? "outline" : "default"}
                            className="w-full"
                            onClick={() => setIsConnected(!isConnected)}
                        >
                            {isConnected ? "Desconectar" : "Conectar Conta Google"}
                        </Button>
                    </CardContent>
                </Card>

                <Card className="opacity-60 grayscale">
                    <CardHeader>
                        <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                            <Cloud className="h-6 w-6" />
                        </div>
                        <CardTitle>OneDrive</CardTitle>
                        <CardDescription>Importe arquivos do Microsoft OneDrive.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button variant="secondary" disabled className="w-full">Em Breve</Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
