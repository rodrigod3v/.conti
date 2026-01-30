import { DataRow } from "@/lib/store";
import { format, parse, isValid } from "date-fns";
import { ptBR } from "date-fns/locale";

// --- Smart Detection ---

export const detectCurrencyColumn = (rows: DataRow[], headers: string[]): string | null => {
    // 1. Check headers for keywords
    const keywords = ["valor", "preço", "custo", "montante", "receita", "total", "price", "amount", "cost"];
    const foundHeader = headers.find(h => keywords.some(k => h.toLowerCase().includes(k)));
    if (foundHeader) return foundHeader;

    // 2. Heuristic check on data (look for currency symbols or numbers consistently)
    // Checking first 10 rows
    for (const h of headers) {
        const hasCurrency = rows.slice(0, 10).some(row => {
            const val = String(row[h]);
            return val.includes("R$") || val.includes("$") || val.includes("€");
        });
        if (hasCurrency) return h;
    }

    return null;
};

export const detectTeamColumn = (rows: DataRow[], headers: string[]): string | null => {
    const keywords = ["responsável", "responsavel", "owner", "atribuído", "atribuido", "usuário", "usuario", "user", "colaborador"];
    const foundHeader = headers.find(h => keywords.some(k => h.toLowerCase().includes(k)));
    if (foundHeader) return foundHeader;
    
    // Heuristic: Check for values that look like names? (Maybe too risky for now, stick to explicit headers)
    return null;
};

export const detectCategoryColumn = (rows: DataRow[], headers: string[]): string | null => {
    const keywords = ["categoria", "category", "tipo", "type", "assunto", "subject", "produto", "product", "serviço", "service"];
    const foundHeader = headers.find(h => keywords.some(k => h.toLowerCase().includes(k)));
    if (foundHeader) return foundHeader;
    return null;
};

export const detectDateColumn = (rows: DataRow[], headers: string[]): string | null => {
    const keywords = ["data", "date", "dia", "criado", "created", "emissão"];
    const foundHeader = headers.find(h => keywords.some(k => h.toLowerCase().includes(k)));
    if (foundHeader) return foundHeader;
    
    // Heuristic check not implemented for now to avoid false positives, relying on explicit naming is safer for MVPs
    return null;
};

export const detectStatusColumn = (rows: DataRow[], headers: string[]): string | null => {
    const keywords = ["status", "estado", "situação", "situacao", "etapa", "phase", "step", "stage"];
    const foundHeader = headers.find(h => keywords.some(k => h.toLowerCase().includes(k)));
    if (foundHeader) return foundHeader;
    return null;
};

// --- Parsers ---

export const parseCurrency = (value: string | number | null): number => {
    if (!value) return 0;
    if (typeof value === "number") return value;
    
    // Remove "R$", dots (thousands), replace comma with dot
    const clean = value.replace(/[^\d,\-]/g, "").replace(/\./g, "").replace(",", ".");
    const num = parseFloat(clean);
    return isNaN(num) ? 0 : num;
};

// --- Aggregators ---

export const calculateFinancials = (rows: DataRow[], colName: string) => {
    let total = 0;
    const values: number[] = [];

    rows.forEach(r => {
        const val = parseCurrency(r[colName]);
        total += val;
        values.push(val);
    });

    const avg = values.length ? total / values.length : 0;
    const max = Math.max(...values, 0);

    return { total, avg, max };
};
