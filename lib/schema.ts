export interface FinancialRecord {
    // Core System Fields (Mapped)
    Caso: string;            // From: observaçao/chamado
    Status: string;          // From: status do pgto
    Data: string;            // From: data lançamento
    "Valor (R$)": string;    // From: montante
    Responsável: string;     // From: responsvel
    Inconsistencias: string; // From: exeçao

    // Additional Schema Fields
    "Area Responsavel"?: string;
    "Data do Pagamento"?: string;
    "Empresa"?: string;
    "Fornecedor"?: string;
    "Nome do Fornecedor"?: string;
    "Referencia"?: string;
    "Ordem"?: string;
    "Lancamento"?: string;
    "Forma de Pagamento"?: string;
    "Data Lancamento Contabil"?: string;
    "Data Vencimento"?: string;
    "Valor Liquido"?: string;
    "Texto de Item"?: string;
    "Numero do ID Fiscal"?: string;
    "Exercicio"?: string; // 'exercido' in prompt, assuming 'exercicio'
    "Bloqueio Pagamento Item"?: string;
    "Tipo Lancamento Contabil"?: string;
    "PCC"?: string;
    "IR"?: string;
    "Base ISS"?: string;
    
    // Index signature to allow other fields
    [key: string]: any;
}
