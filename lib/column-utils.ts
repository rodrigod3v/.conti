export const isDropdownColumn = (key: string): boolean => {
    const lower = key.toLowerCase();
    return (
        lower.includes("status") ||
        lower.includes("situação") ||
        lower.includes("nome") ||
        lower.includes("cliente") ||
        lower.includes("produto") ||
        lower.includes("unidade") ||
        lower.includes("fornecedor") ||
        lower.includes("empresa") ||
        lower.includes("responsável") ||
        lower.includes("usuario") ||
        lower.includes("usuário") ||
        // Adding more common categorical fields
        lower.includes("categoria") ||
        lower.includes("departamento") ||
        lower.includes("setor")
    );
};

export const isDateColumn = (key: string): boolean => {
    const lower = key.toLowerCase();
    return lower.includes("data") || lower === "vencimento" || lower.includes("periodo") || lower.includes("período");
};

export const isCurrencyColumn = (key: string): boolean => {
    const lower = key.toLowerCase();
    return lower.includes("valor") || lower.includes("montante") || lower.includes("liquido") || lower.includes("líquido") || lower.includes("custo") || lower.includes("preço");
};

export const isObservationColumn = (key: string): boolean => {
    const lower = key.toLowerCase();
    return lower.includes("observ") || lower.includes("descri") || lower.includes("texto") || lower.includes("nota") || lower.includes("comentario") || lower.includes("comentário") || lower.includes("inconsist");
};

export const isReadonlyColumn = (key: string): boolean => {
    const lower = key.toLowerCase();
    return lower === "chamado" || lower === "caso" || lower === "id";
};
