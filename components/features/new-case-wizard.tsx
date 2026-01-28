"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ArrowRight, Check, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { isDropdownColumn, isDateColumn, isCurrencyColumn } from "@/lib/column-utils";
import { useMemo } from "react";

import { useToast } from "@/components/ui/simple-toast";

interface NewCaseWizardProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function NewCaseWizard({ open, onOpenChange }: NewCaseWizardProps) {
    const { headers, addRow, fileData } = useAppStore();

    // Filter out internal columns like "Chamado" if they are auto-generated, 
    // but the user might want to edit them. 
    // Usually "Chamado" is auto-generated in the persistence layer or page logic, 
    // but if we are adding a row manually, we might need to generate it or ask.
    // For now, let's skip "Chamado" if it looks like an ID, or just show all headers.
    // The prompt says "herd todos os campos", so we use all headers.

    // We can filter out empty headers if any.
    // We can filter out empty headers if any.
    // Also filtering "Chamado" as requested by user.
    const fieldList = headers.filter(h => h && h.trim() !== "" && h !== "Chamado");

    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState<Record<string, string>>({});
    const toast = useToast();

    const totalSteps = fieldList.length;
    const currentField = fieldList[currentStep];

    const handleNext = () => {
        if (currentStep < totalSteps - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            handleSubmit();
            setFormData({});
            setCurrentStep(0);
            onOpenChange(false);
            toast.success("Novo item adicionado!", "O registro foi criado com sucesso e salvo na memória.");
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const handleChange = (value: string) => {
        setFormData(prev => ({
            ...prev,
            [currentField]: value
        }));
    };

    const handleSubmit = () => {
        // Construct the new row
        const newRow: any = { ...formData };

        // Auto-generate Chamado ID if not present
        if (!newRow["Chamado"]) {
            const year = new Date().getFullYear();
            // Simple ID generation based on count
            // We use fileData length + 1 + random element to ensure uniqueness temporarily
            const count = fileData.length + 1;
            const padIndex = String(count).padStart(3, '0');
            newRow["Chamado"] = `CS-${year}-${padIndex}`;
        }

        addRow(newRow);

        // Reset and close
        setFormData({});
        setCurrentStep(0);
        onOpenChange(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleNext();
        }
    };

    // Compute unique options for the current field if it's a dropdown candidate
    const uniqueOptions = useMemo(() => {
        if (!currentField || !isDropdownColumn(currentField)) return [];
        const values = new Set<string>();
        fileData.forEach(row => {
            const val = row[currentField];
            if (val !== undefined && val !== null && String(val).trim() !== "") {
                values.add(String(val));
            }
        });
        return Array.from(values).sort();
    }, [currentField, fileData]);

    if (totalSteps === 0) return null;

    const renderInput = () => {
        // 1. Dropdown
        if (uniqueOptions.length > 0) {
            return (
                <Select
                    value={formData[currentField] || ""}
                    onValueChange={(val) => handleChange(val)}
                >
                    <SelectTrigger className="h-12 text-lg">
                        <SelectValue placeholder={`Selecione ${currentField}...`} />
                    </SelectTrigger>
                    <SelectContent>
                        {uniqueOptions.map(opt => (
                            <SelectItem key={opt} value={opt} className="text-base">{opt}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            );
        }

        // 2. Date
        if (isDateColumn(currentField)) {
            return (
                <Input
                    id="current-input"
                    value={formData[currentField] || ""}
                    onChange={(e) => handleChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="DD/MM/AAAA"
                    className="h-12 text-lg"
                    autoFocus
                />
            );
        }

        // 3. Currency/Numeric
        if (isCurrencyColumn(currentField)) {
            // Maybe simple text is best to allow R$ formatting flexibility, but we can hint
            return (
                <Input
                    id="current-input"
                    value={formData[currentField] || ""}
                    onChange={(e) => handleChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="0,00"
                    className="h-12 text-lg font-mono"
                    autoFocus
                />
            );
        }

        // Default Text
        return (
            <Input
                id="current-input"
                value={formData[currentField] || ""}
                onChange={(e) => handleChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Digite ${currentField}...`}
                className="h-12 text-lg"
                autoFocus
            />
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Novo Caso</DialogTitle>
                    <DialogDescription>
                        Preencha as informações do novo item. Passo {currentStep + 1} de {totalSteps}.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-6 space-y-4">
                    <div className="flex flex-col gap-2">
                        <div className="flex flex-col gap-1">
                            <Label htmlFor="current-input" className="text-lg font-semibold text-foreground">
                                {currentField}
                            </Label>
                            {/* Example Value Pattern */}
                            {fileData.length > 0 && (
                                <p className="text-xs text-muted-foreground animate-in fade-in slide-in-from-top-1">
                                    Exemplo padrão: <span className="font-mono bg-secondary px-1 py-0.5 rounded text-foreground">{
                                        // Find the last non-empty value for this field
                                        [...fileData].reverse().find(row => row[currentField] && String(row[currentField]).trim() !== "")?.[currentField] || "N/A"
                                    }</span>
                                </p>
                            )}
                        </div>

                        {renderInput()}

                    </div>

                    {/* Progress Bar */}
                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary transition-all duration-300 ease-out"
                            style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
                        />
                    </div>
                </div>

                <DialogFooter className="flex sm:justify-between gap-2">
                    <Button
                        variant="ghost"
                        onClick={handleBack}
                        disabled={currentStep === 0}
                        className="gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Voltar
                    </Button>
                    <Button onClick={handleNext} className="gap-2">
                        {currentStep === totalSteps - 1 ? (
                            <>Confirmar <Check className="h-4 w-4" /></>
                        ) : (
                            <>Próximo <ArrowRight className="h-4 w-4" /></>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
