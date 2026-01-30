"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Loader2 } from "lucide-react";
import { useFileHandler } from "@/hooks/use-file-handler";
import { cn } from "@/lib/utils";

interface ImportButtonProps {
    className?: string;
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
}

export function ImportButton({ className, variant = "outline" }: ImportButtonProps) {
    const { handleFileSelect, isLoading } = useFileHandler();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const onButtonClick = () => {
        fileInputRef.current?.click();
    };

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFileSelect(file);
        }
        // Reset input so same file can be selected again if needed
        e.target.value = "";
    };

    return (
        <>
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".xlsx, .xls, .csv"
                onChange={onFileChange}
            />
            <Button
                variant={variant}
                size="sm"
                className={cn("gap-2", className)}
                onClick={onButtonClick}
                disabled={isLoading}
            >
                {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <Upload className="h-4 w-4" />
                )}
                <span className="hidden sm:inline">Importar Planilha</span>
            </Button>
        </>
    );
}
