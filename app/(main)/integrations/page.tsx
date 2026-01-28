"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Grid, Cloud, Check } from "lucide-react";
import { useState } from "react";

export default function IntegrationsPage() {
    const [isConnected, setIsConnected] = useState(false);

    return (
        <div className="space-y-4">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Integrações</h1>
                <p className="text-sm text-muted-foreground">
                    Conecte ferramentas externas.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card className="shadow-sm">
                    <CardHeader className="p-4">
                        <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <Grid className="h-5 w-5" />
                        </div>
                        <CardTitle className="text-base">Google Sheets</CardTitle>
                        <CardDescription className="text-xs">Sincronize suas planilhas.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        {isConnected ? (
                            <div className="flex items-center space-x-2 text-primary mb-4 bg-primary/10 p-2 rounded-md">
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

                <Card className="opacity-60 grayscale shadow-sm">
                    <CardHeader className="p-4">
                        <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                            <Cloud className="h-5 w-5" />
                        </div>
                        <CardTitle className="text-base">OneDrive</CardTitle>
                        <CardDescription className="text-xs">Importe do Microsoft OneDrive.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <Button variant="secondary" disabled className="w-full h-8 text-xs">Em Breve</Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
