export const getStatusColor = (status: string | null | undefined): string => {
    if (!status) return "bg-slate-100 text-slate-700 hover:bg-slate-200 border-transparent";
    
    // Normalize status for comparison
    const s = status.toString().toLowerCase().trim();

    // 1. Success / Green
    if (
        s === "aprovado" || 
        s === "concluído" || 
        s === "concluido" || 
        s === "resolvido" || 
        s === "ok" ||
        (s.includes("pago") && !s.includes("parcial"))
    ) {
        return "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-transparent";
    }

    // 2. Info / Blue (Partial)
    if (s.includes("parcialmente") || s.includes("parcial")) {
        return "bg-blue-100 text-blue-700 hover:bg-blue-200 border-transparent";
    }

    // 3. Warning / Amber (Pending/Waiting)
    if (
        s === "pendente" || 
        s.includes("aguardando") || 
        s.includes("espera") ||
        s === "aberto"
    ) {
        return "bg-amber-100 text-amber-700 hover:bg-amber-200 border-transparent";
    }

    // 4. Error / Red (Critical)
    if (
        s === "erro" || 
        s === "missing" || 
        s === "falha" ||
        s === "alto" || 
        s.includes("atrasado")
    ) {
        return "bg-red-100 text-red-700 hover:bg-red-200 border-transparent";
    }

    // 5. Processing / Indigo (Analysis)
    if (
        s.includes("análise") || 
        s.includes("analise") || 
        s.includes("andamento") ||
        s.includes("processando")
    ) {
        return "bg-indigo-100 text-indigo-700 hover:bg-indigo-200 border-transparent";
    }

    // 6. Neutral / Slate (Cancelled/Default)
    if (s.includes("cancelado") || s.includes("inativo")) {
        return "bg-slate-100 text-slate-700 hover:bg-slate-200 border-transparent";
    }

    // Default Fallback
    return "bg-slate-100 text-slate-700 hover:bg-slate-200 border-transparent";
};
