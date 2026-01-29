"use client";

import { useState, useMemo, useEffect } from "react";
import {
    Plus,
    Trash2,
    Save,
    List,
    Search,
    ChevronDown,
    ChevronUp,
    Check,
    X,
    Edit2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/simple-toast";
import {
    getFieldConfig,
    updateFieldConfiguration,
    getUserFieldConfigurations,
    getAllFieldsFromData,
    FieldConfig
} from "@/lib/field-config";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export function DropdownManager() {
    const { fileData, headers } = useAppStore();
    const toast = useToast();
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // State
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedField, setSelectedField] = useState<string | null>(null);
    const [isAddFieldOpen, setIsAddFieldOpen] = useState(false);
    const [newFieldName, setNewFieldName] = useState("");

    // Manage Options State
    const [editingOptions, setEditingOptions] = useState<string[]>([]);
    const [newOption, setNewOption] = useState("");

    // 1. Get all available fields (from file + config)
    // "Listas Personalizadas" should reflect the spreadsheet columns
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // 1. Get all available fields (from file + config)
    // "Listas Personalizadas" should reflect the spreadsheet columns
    const availableFields = useMemo(() => {
        if (!isMounted) return [];

        let fields: string[] = [];
        if (headers.length > 0) {
            fields = headers;
        } else {
            // Fallback if no file loaded, show configured fields
            // Ensure this runs only on client side to avoid hydration mismatch
            fields = Object.keys(getUserFieldConfigurations());
        }

        // Filter: Only show fields that are explicitly 'dropdown' OR have no specific type yet.
        // Hides 'currency', 'text', 'date', etc.
        return fields.filter(field => {
            const config = getFieldConfig(field);
            return config.type === 'dropdown' || !config.type;
        }).sort();
    }, [headers, isMounted]);

    // 2. Filter logic (Optional: we can show all, or just those that match search)
    const filteredFields = useMemo(() => {
        return availableFields.filter(f => f.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [availableFields, searchQuery]);

    // Load options when a field is selected
    useEffect(() => {
        if (selectedField) {
            const config = getFieldConfig(selectedField);

            // Get values from File Data
            const fileValues = new Set<string>();
            fileData.forEach(row => {
                const val = row[selectedField];
                if (val !== undefined && val !== null && String(val).trim() !== "") {
                    fileValues.add(String(val).trim());
                }
            });

            // Merge Config Options + File Values
            // Note: We might want configured options to take precedence or just union them
            const merged = new Set([...(config.options || []), ...Array.from(fileValues)]);

            setEditingOptions(Array.from(merged).sort());
        } else {
            setEditingOptions([]);
        }
    }, [selectedField, refreshTrigger, fileData]); // Added fileData dependency

    const handleAddField = () => {
        if (!newFieldName) return;

        // Force it to be a dropdown
        const currentConfig = getFieldConfig(newFieldName);
        updateFieldConfiguration(newFieldName, {
            ...currentConfig,
            type: 'dropdown',
            options: currentConfig.options || []
        });

        toast.success("Campo Adicionado", `Agora você pode gerenciar listas para "${newFieldName}"`);
        setIsAddFieldOpen(false);
        setNewFieldName("");
        setSelectedField(newFieldName);
        setRefreshTrigger(p => p + 1);
    };

    const handleAddOption = () => {
        if (!newOption || !selectedField) return;
        if (editingOptions.includes(newOption)) {
            toast.error("Duplicado", "Esta opção já existe na lista.");
            return;
        }

        const updatedOptions = [...editingOptions, newOption].sort();
        setEditingOptions(updatedOptions);

        // Auto-save logic
        const config = getFieldConfig(selectedField);
        updateFieldConfiguration(selectedField, {
            ...config,
            type: 'dropdown', // Ensure it stays as dropdown
            options: updatedOptions
        });

        setNewOption("");
        toast.success("Opção Adicionada", `"${newOption}" foi salvo.`);
    };

    const handleRemoveOption = (option: string) => {
        if (!selectedField) return;

        // WARN: If the option exists in file data, removing it here won't remove it from the file.
        // It will just remove it from the "Suggested/Configured" list.
        // But since we merge file data on load, it might reappear if we don't handle it.
        // For now, standard behavior: remove from config.

        const updatedOptions = editingOptions.filter(o => o !== option);
        setEditingOptions(updatedOptions);

        // Auto-save
        const config = getFieldConfig(selectedField);
        updateFieldConfiguration(selectedField, { ...config, options: updatedOptions });

        toast.success("Opção Removida", `"${option}" foi removido.`);
    };

    return (
        <div className="flex gap-6 h-[600px] animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* LEFT SIDE: List of Fields */}
            <Card className="w-1/3 flex flex-col overflow-hidden border-[#e6e0db] shadow-sm">
                <CardHeader className="pb-3 border-b border-[#fcfaf9] bg-white">
                    <CardTitle className="text-lg text-[#181411]">Campos Dropdown</CardTitle>
                    <CardDescription>Selecione um campo para editar suas opções.</CardDescription>
                    <div className="relative mt-2">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar campos..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 h-9 text-sm"
                        />
                    </div>
                </CardHeader>
                <div className="flex-1 overflow-y-auto bg-[#fcfaf9] p-2 space-y-1">
                    {filteredFields.map(field => (
                        <button
                            key={field}
                            onClick={() => setSelectedField(field)}
                            className={cn(
                                "w-full flex items-center justify-between px-3 py-2.5 text-sm rounded-lg transition-all text-left",
                                selectedField === field
                                    ? "bg-white shadow-sm ring-1 ring-[#f38a20] text-[#f38a20] font-bold"
                                    : "text-[#5e4b35] hover:bg-white hover:text-[#181411]"
                            )}
                        >
                            <span className="truncate">{field}</span>
                            <List className="w-3 h-3 opacity-50" />
                        </button>
                    ))}

                    {filteredFields.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground text-xs">
                            Nenhum campo encontrado.
                        </div>
                    )}
                </div>
                <div className="p-3 border-t bg-white">
                    <Dialog open={isAddFieldOpen} onOpenChange={setIsAddFieldOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="w-full text-[#f38a20] border-[#f38a20]/30 hover:bg-[#f38a20]/5">
                                <Plus className="w-4 h-4 mr-2" />
                                Adicionar Novo Campo
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Gerenciar Lista para Novo Campo</DialogTitle>
                                <DialogDescription>
                                    Digite o nome exato da coluna da sua planilha (ou um novo campo).
                                </DialogDescription>
                            </DialogHeader>
                            <div className="py-4">
                                <label className="text-sm font-medium mb-1.5 block">Nome do Campo</label>
                                <Input
                                    value={newFieldName}
                                    onChange={e => setNewFieldName(e.target.value)}
                                    placeholder="Ex: Categoria, Departamento..."
                                />
                            </div>
                            <DialogFooter>
                                <Button onClick={handleAddField} className="bg-[#f38a20] text-white">Criar Lista</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </Card>

            {/* RIGHT SIDE: Options Editor */}
            <Card className="flex-1 flex flex-col overflow-hidden border-[#e6e0db] shadow-md bg-white">
                {selectedField ? (
                    <>
                        <CardHeader className="pb-4 border-b">
                            <div className="flex items-center justify-between">
                                <div>
                                    <Badge variant="outline" className="mb-2 bg-[#f38a20]/10 text-[#f38a20] border-[#f38a20]/20">
                                        Editando Lista
                                    </Badge>
                                    <CardTitle className="text-xl font-bold text-[#181411]">{selectedField}</CardTitle>
                                </div>
                                <div className="text-xs text-muted-foreground text-right">
                                    {editingOptions.length} opções cadastradas
                                </div>
                            </div>
                        </CardHeader>

                        <div className="p-4 border-b bg-[#fcfaf9]">
                            <div className="flex gap-2">
                                <Input
                                    value={newOption}
                                    onChange={e => setNewOption(e.target.value)}
                                    placeholder="Digite uma nova opção para a lista..."
                                    className="h-10 text-sm bg-white"
                                    onKeyDown={e => e.key === 'Enter' && handleAddOption()}
                                />
                                <Button onClick={handleAddOption} className="bg-[#f38a20] text-white h-10 px-6 font-bold">
                                    Adicionar
                                </Button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-2">
                            {editingOptions.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-60">
                                    <List className="w-12 h-12 mb-3" />
                                    <p>Esta lista está vazia.</p>
                                    <p className="text-sm">Adicione opções acima.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-2">
                                    {editingOptions.map((option, idx) => (
                                        <div
                                            key={`${option}-${idx}`}
                                            className="group flex items-center justify-between p-3 rounded-lg border border-transparent hover:border-[#e6e0db] hover:bg-[#fcfaf9] transition-all"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xs font-mono">
                                                    {idx + 1}
                                                </div>
                                                <span className="font-medium text-[#181411]">
                                                    {/* Helper to format dates if needed */}
                                                    {(() => {
                                                        const dateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;
                                                        if (dateRegex.test(option)) {
                                                            try {
                                                                const date = new Date(option);
                                                                // Use UTC methods to avoid timezone shifts if the string is UTC-based
                                                                const day = String(date.getUTCDate()).padStart(2, '0');
                                                                const month = String(date.getUTCMonth() + 1).padStart(2, '0');
                                                                const year = date.getUTCFullYear();
                                                                return `${day}/${month}/${year}`;
                                                            } catch (e) {
                                                                return option;
                                                            }
                                                        }
                                                        return option;
                                                    })()}
                                                </span>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleRemoveOption(option)}
                                                className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-500 transition-all h-8 w-8"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground/60 p-10 text-center">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                            <List className="w-10 h-10 text-slate-300" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-700 mb-2">Nenhum Campo Selecionado</h3>
                        <p className="max-w-xs mx-auto">Selecione um campo à esquerda para gerenciar suas opções de dropdown ou adicione um novo.</p>
                    </div>
                )}
            </Card>
        </div>
    );
}
