"use client";

import { useState, useRef } from "react";
import { Upload, FileSpreadsheet, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface UploadZoneProps {
    onFileSelect: (file: File) => void;
}

export function UploadZone({ onFileSelect }: UploadZoneProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleFile = (selectedFile: File) => {
        const validTypes = [
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
            "text/csv", // .csv
            "application/vnd.ms-excel" // .xls
        ];

        if (validTypes.includes(selectedFile.type) || selectedFile.name.endsWith('.csv') || selectedFile.name.endsWith('.xlsx')) {
            setFile(selectedFile);
            onFileSelect(selectedFile);
        } else {
            alert("Por favor, envie um arquivo .xlsx ou .csv válido.");
        }
    };

    const clearFile = () => {
        setFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <div
            className={cn(
                "relative flex flex-col items-center justify-center rounded-3xl border-dashed border-2 bg-white p-6 transition-all duration-300 dark:bg-card border-border",
                isDragging && "border-accent-foreground bg-accent"
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleChange}
                accept=".csv, .xlsx"
                className="hidden"
            />

            {!file ? (
                <>
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-sm">
                        <Upload className="h-6 w-6" />
                    </div>
                    <h3 className="mb-2 text-lg font-bold text-foreground">Upload de Arquivos</h3>
                    <p className="mb-4 max-w-md text-center text-sm text-muted-foreground">
                        Arraste e solte seus arquivos <span className="font-semibold text-accent-foreground">XLSX</span> ou{" "}
                        <span className="font-semibold text-accent-foreground">CSV</span> aqui para iniciar a análise automática.
                        <br />
                        <span className="text-xs opacity-70">(Máximo 200MB por arquivo)</span>
                    </p>
                    <Button
                        size="lg"
                        onClick={() => fileInputRef.current?.click()}
                        className="h-12 rounded-xl bg-primary px-8 text-base font-semibold text-primary-foreground shadow-lg hover:bg-primary/90"
                    >
                        <FileSpreadsheet className="mr-2 h-5 w-5" />
                        Selecionar do computador
                    </Button>
                </>
            ) : (
                <div className="flex w-full max-w-md flex-col items-center gap-4 rounded-xl border bg-card p-6 shadow-lg animate-in zoom-in-95">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                        <FileSpreadsheet className="h-8 w-8" />
                    </div>
                    <div className="text-center">
                        <p className="font-medium text-foreground">{file.name}</p>
                        <p className="text-sm text-muted-foreground">{(file.size / 1024).toFixed(2)} KB</p>
                    </div>
                    <div className="flex gap-2 w-full">
                        <Button variant="outline" className="flex-1" onClick={clearFile}>
                            Cancelar
                        </Button>
                        <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                            Processar
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
