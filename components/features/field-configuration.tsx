"use client";

import { Button } from "@/components/ui/button";
import {
    Plus,
    Trash2,
    RotateCcw,
    Save,
    Settings2,
    DollarSign,
    Calendar,
    Type,
    Hash,
    List,
    AlignLeft,
    Lock,
    Check,
    Search
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
// Table imports removed as we are using Divs now
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAppStore } from "@/lib/store";
import {
    getAllFieldsFromData,
    getFieldConfig,
    updateFieldConfiguration,
    resetFieldConfiguration,
    resetAllFieldConfigurations,
    FieldType,
    FieldConfig
} from "@/lib/field-config";
import { useToast } from "@/components/ui/simple-toast";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetFooter
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const COLORS = [
    { name: "Default", value: "none", dark: "bg-white" },
    { name: "Red", value: "bg-red-100", dark: "bg-red-500" },
    { name: "Orange", value: "bg-orange-100", dark: "bg-orange-500" },
    { name: "Amber", value: "bg-amber-100", dark: "bg-amber-500" },
    { name: "Yellow", value: "bg-yellow-100", dark: "bg-yellow-500" },
    { name: "Lime", value: "bg-lime-100", dark: "bg-lime-500" },
    { name: "Green", value: "bg-green-100", dark: "bg-green-500" },
    { name: "Emerald", value: "bg-emerald-100", dark: "bg-emerald-500" },
    { name: "Teal", value: "bg-teal-100", dark: "bg-teal-500" },
    { name: "Cyan", value: "bg-cyan-100", dark: "bg-cyan-500" },
    { name: "Sky", value: "bg-sky-100", dark: "bg-sky-500" },
    { name: "Blue", value: "bg-blue-100", dark: "bg-blue-500" },
    { name: "Indigo", value: "bg-indigo-100", dark: "bg-indigo-500" },
    { name: "Violet", value: "bg-violet-100", dark: "bg-violet-500" },
    { name: "Purple", value: "bg-purple-100", dark: "bg-purple-500" },
    { name: "Fuchsia", value: "bg-fuchsia-100", dark: "bg-fuchsia-500" },
    { name: "Pink", value: "bg-pink-100", dark: "bg-pink-500" },
    { name: "Rose", value: "bg-rose-100", dark: "bg-rose-500" },
];

export function FieldConfiguration() {
    // Field configuration state
    const { fileData, headers } = useAppStore();
    const [fields, setFields] = useState<string[]>([]);
    const [fieldConfigs, setFieldConfigs] = useState<Record<string, FieldConfig>>({});
    const toast = useToast();
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const filteredFields = useMemo(() => {
        return fields.filter(field =>
            field.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [fields, searchQuery]);

    // Initial load
    const loadConfigs = () => {
        // Use headers from store if available to preserve order, fallback to data keys
        let allFields: string[] = [];

        if (headers && headers.length > 0) {
            allFields = [...headers];
        } else if (fileData && fileData.length > 0) {
            allFields = getAllFieldsFromData(fileData);
        }

        if (allFields.length > 0) {
            setFields(allFields);
            const configs: Record<string, FieldConfig> = {};
            allFields.forEach(field => {
                configs[field] = getFieldConfig(field);
            });
            setFieldConfigs(configs);
        }
    };

    useEffect(() => {
        loadConfigs();
        const handleConfigChange = () => loadConfigs();
        window.addEventListener('field-config-changed', handleConfigChange);
        return () => window.removeEventListener('field-config-changed', handleConfigChange);
    }, [fileData, headers]);

    const handleFieldTypeChange = (field: string, type: FieldType) => {
        setFieldConfigs(prev => ({
            ...prev,
            [field]: { ...prev[field], type, options: prev[field]?.options || [] }
        }));
    };

    const handleFieldColorChange = (field: string, color: string) => {
        setFieldConfigs(prev => ({
            ...prev,
            [field]: { ...prev[field], color }
        }));
    };
    const handleFormatCurrencyChange = (fieldName: string, formatCurrency: boolean) => {
        const newConfig: FieldConfig = {
            ...fieldConfigs[fieldName],
            formatCurrency
        };
        setFieldConfigs(prev => ({ ...prev, [fieldName]: newConfig }));
    };

    const saveFieldConfiguration = (fieldName: string) => {
        updateFieldConfiguration(fieldName, fieldConfigs[fieldName]);
        toast.success("Salvo", `Campo "${fieldName}" atualizado.`);
    };

    const saveAllFieldConfigurations = () => {
        Object.keys(fieldConfigs).forEach(fieldName => {
            updateFieldConfiguration(fieldName, fieldConfigs[fieldName]);
        });
        toast.success("Tudo salvo", "Todas as configurações foram atualizadas.");
        setIsSheetOpen(false);
    };

    const resetField = (fieldName: string) => {
        resetFieldConfiguration(fieldName);
        const defaultConfig = getFieldConfig(fieldName);
        setFieldConfigs(prev => ({ ...prev, [fieldName]: defaultConfig }));
        toast.success("Resetado", `"${fieldName}" restaurado.`);
    };

    const resetAllFields = () => {
        toast.action(
            "Resetar tudo?",
            "Sim, Resetar",
            () => {
                resetAllFieldConfigurations();
                const configs: Record<string, FieldConfig> = {};
                fields.forEach(field => configs[field] = getFieldConfig(field));
                setFieldConfigs(configs);
                toast.success("Pronto", "Configurações restauradas para o padrão.");
            },
            "Irreversível."
        );
    };

    // Helper to get icon for type
    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'currency': return <DollarSign className="w-3.5 h-3.5 text-emerald-600" />;
            case 'numeric': return <Hash className="w-3.5 h-3.5 text-blue-600" />;
            case 'date': return <Calendar className="w-3.5 h-3.5 text-amber-600" />;
            case 'dropdown': return <List className="w-3.5 h-3.5 text-purple-600" />;
            case 'textarea': return <AlignLeft className="w-3.5 h-3.5 text-orange-600" />;
            case 'readonly': return <Lock className="w-3.5 h-3.5 text-gray-500" />;
            default: return <Type className="w-3.5 h-3.5 text-slate-500" />;
        }
    };

    if (fields.length === 0) return null;

    return (
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
                <Button variant="outline" className="h-9 gap-2 bg-gradient-to-r from-indigo-50 to-white border-indigo-100 hover:border-indigo-300 text-indigo-700 shadow-sm transition-all">
                    <Settings2 className="h-4 w-4" />
                    <span className="hidden sm:inline font-medium">Configurar Campos</span>
                </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-[500px] sm:w-[500px] flex flex-col p-0 gap-0 border-l shadow-2xl">
                <SheetHeader className="p-6 border-b bg-muted/50">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <Settings2 className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <SheetTitle>Configuração de Campos</SheetTitle>
                            <SheetDescription>
                                Personalize como seus dados são exibidos
                            </SheetDescription>
                        </div>
                    </div>
                    <div className="mt-4 relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar campos..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 bg-white text-sm"
                        />
                    </div>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto bg-slate-50/50 p-6 space-y-3">
                    {filteredFields.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground text-sm">
                            Nenhum campo encontrado para "{searchQuery}"
                        </div>
                    ) : (
                        filteredFields.map((field) => {
                            const config = fieldConfigs[field] || { type: 'text' };
                            const canHaveCurrencyFormat = config.type === 'currency' || config.type === 'numeric';
                            const isCurrencyFormatted = canHaveCurrencyFormat && (config.formatCurrency === true);
                            const TypeIcon = getTypeIcon(config.type);

                            return (
                                <div
                                    key={field}
                                    className="group bg-white rounded-xl border border-slate-200/60 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-200 p-3"
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2 overflow-hidden">
                                            <div className="font-semibold text-sm text-slate-800 truncate max-w-[180px]" title={field}>{field}</div>
                                            {config.type === 'currency' && (
                                                <Badge variant="secondary" className="text-[10px] h-5 bg-emerald-50 text-emerald-700 border-emerald-100 px-1.5 shrink-0">
                                                    Moeda
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                            <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-primary" onClick={() => saveFieldConfiguration(field)}>
                                                <Save className="w-3.5 h-3.5" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-red-500" onClick={() => resetField(field)}>
                                                <RotateCcw className="w-3.5 h-3.5" />
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-[1fr,140px,auto] gap-3 items-end">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Tipo de Dado</label>
                                            <Select
                                                value={config.type}
                                                onValueChange={(value) => handleFieldTypeChange(field, value as FieldType)}
                                            >
                                                <SelectTrigger className="h-8 text-xs bg-slate-50 border-slate-200 focus:ring-indigo-500/20 w-full">
                                                    <div className="flex items-center gap-2 truncate">
                                                        <SelectValue />
                                                    </div>
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="text"><div className="flex items-center gap-2"><Type className="w-3.5 h-3.5 text-slate-500" /> Texto</div></SelectItem>
                                                    <SelectItem value="currency"><div className="flex items-center gap-2"><DollarSign className="w-3.5 h-3.5 text-emerald-600" /> Moeda</div></SelectItem>
                                                    <SelectItem value="numeric"><div className="flex items-center gap-2"><Hash className="w-3.5 h-3.5 text-blue-600" /> Numérico</div></SelectItem>
                                                    <SelectItem value="date"><div className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5 text-amber-600" /> Data</div></SelectItem>
                                                    <SelectItem value="dropdown"><div className="flex items-center gap-2"><List className="w-3.5 h-3.5 text-purple-600" /> Lista / Dropdown</div></SelectItem>
                                                    <SelectItem value="textarea"><div className="flex items-center gap-2"><AlignLeft className="w-3.5 h-3.5 text-orange-600" /> Texto Longo</div></SelectItem>
                                                    <SelectItem value="readonly"><div className="flex items-center gap-2"><Lock className="w-3.5 h-3.5 text-gray-500" /> Somente Leitura</div></SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Cor</label>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        className={cn("h-8 w-full justify-start text-xs border-slate-200 focus:ring-indigo-500/20 px-2", config.color)}
                                                    >
                                                        <div className="flex items-center gap-2 truncate w-full">
                                                            {config.color && config.color !== "none" ? (
                                                                <div className={cn("w-3 h-3 rounded-full border border-black/10 shrink-0", COLORS.find(c => c.value === config.color)?.dark)} />
                                                            ) : (
                                                                <div className="w-3 h-3 rounded-full border border-slate-300 bg-white shrink-0" />
                                                            )}
                                                            <span className="truncate flex-1 text-left font-normal text-slate-700">
                                                                {COLORS.find(c => c.value === (config.color || "none"))?.name || "Padrão"}
                                                            </span>
                                                        </div>
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-[200px] p-3" align="start">
                                                    <div className="grid grid-cols-4 gap-2">
                                                        {COLORS.map((c) => (
                                                            <button
                                                                key={c.name}
                                                                onClick={() => handleFieldColorChange(field, c.value === "none" ? "" : c.value)}
                                                                className={cn(
                                                                    "w-8 h-8 rounded-full border flex items-center justify-center transition-all hover:scale-110 focus:outline-hidden focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500",
                                                                    (c.value && c.value !== "none") ? c.dark : "bg-white border-slate-200",
                                                                    (config.color === c.value) || (!config.color && c.value === "none") ? "ring-2 ring-offset-1 ring-slate-900 border-transparent shadow-sm" : "border-transparent shadow-sm"
                                                                )}
                                                                title={c.name}
                                                            >
                                                                {((config.color === c.value) || (!config.color && c.value === "none")) && (
                                                                    <Check className={cn("w-3 h-3", c.value === "none" ? "text-slate-400" : "text-white/90")} />
                                                                )}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </PopoverContent>
                                            </Popover>
                                        </div>

                                        <div className={cn(
                                            "flex items-center gap-2 px-3 py-1.5 rounded-md border transition-colors h-8 shrink-0",
                                            canHaveCurrencyFormat ? "bg-emerald-50/50 border-emerald-100" : "bg-slate-100 border-transparent opacity-50 grayscale"
                                        )}>
                                            <Checkbox
                                                id={`curr-${field}`}
                                                checked={isCurrencyFormatted}
                                                onCheckedChange={(checked) => handleFormatCurrencyChange(field, checked === true)}
                                                disabled={!canHaveCurrencyFormat}
                                                className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600 w-4 h-4"
                                            />
                                            <label htmlFor={`curr-${field}`} className={cn(
                                                "text-xs font-medium cursor-pointer select-none",
                                                canHaveCurrencyFormat ? "text-emerald-700" : "text-slate-500"
                                            )}>
                                                Formatar R$
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                <SheetFooter className="p-6 border-t bg-white flex-row gap-2 justify-between items-center sm:justify-between safe-area-bottom">
                    <Button variant="ghost" size="sm" onClick={resetAllFields} className="text-muted-foreground hover:text-destructive text-xs shrink-0">
                        <RotateCcw className="w-3.5 h-3.5 mr-2" />
                        Resetar
                    </Button>
                    <div className="flex gap-2 shrink-0">
                        <Button variant="outline" size="sm" onClick={() => setIsSheetOpen(false)}>
                            Voltar
                        </Button>
                        <Button size="sm" onClick={saveAllFieldConfigurations} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20">
                            <Save className="w-3.5 h-3.5 mr-2" />
                            Salvar
                        </Button>
                    </div>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
