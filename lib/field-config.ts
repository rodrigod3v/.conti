export type FieldType = 'text' | 'dropdown' | 'currency' | 'date' | 'numeric' | 'textarea' | 'readonly';

export interface FieldConfig {
    type: FieldType;
    formatCurrency?: boolean;
    options?: string[]; // For dropdowns (optional - can be auto-populated from data)
    placeholder?: string;
    color?: string; // Hex code or Tailwind class for column coloring
}

// Field configurations - Add or modify fields here
export const fieldConfigurations: Record<string, FieldConfig> = {
    // Financial Fields - Currency formatting
    'Montante Bruto': { type: 'currency', formatCurrency: true },
    'Valor Líquido': { type: 'currency', formatCurrency: true },
    'Valor': { type: 'currency', formatCurrency: true },
    'Valor Total': { type: 'currency', formatCurrency: true },
    'Valor Unitário': { type: 'currency', formatCurrency: true },
    'Base ISS': { type: 'currency', formatCurrency: true },
    'Custo': { type: 'currency', formatCurrency: true },
    'Preço': { type: 'currency', formatCurrency: true },
    'IR': { type: 'currency', formatCurrency: true },
    'PCC': { type: 'text' }, // PCC is a code, not currency
    
    // Numeric Fields
    'Quantidade': { type: 'numeric' },
    'Qtd': { type: 'numeric' },
    'Qtde': { type: 'numeric' },
    
    // Dropdown Fields
    'Status': { type: 'dropdown', options: ['Pendente', 'Aprovado', 'Pago', 'Recusado', 'Em Análise', 'Erro'] },
    'Cliente': { type: 'dropdown' },
    'Responsável': { type: 'dropdown' },
    'Unidade': { type: 'dropdown' },
    'Forma de Pagamento': { type: 'dropdown', options: ['Boleto', 'PIX', 'Cartão de Crédito', 'Transferência'] },
    'Categoria': { type: 'dropdown', options: ['Despesa', 'Receita'] },
    'Departamento': { type: 'dropdown' },
    'Setor': { type: 'dropdown' },
    'Produto': { type: 'dropdown' },
    'Fornecedor': { type: 'dropdown' },
    'Empresa': { type: 'dropdown' },
    
    // Date Fields
    'Data': { type: 'date' },
    'Data Abertura': { type: 'date' },
    'Data de Abertura': { type: 'date' },
    'Vencimento': { type: 'date' },
    'Data Vencimento': { type: 'date' },
    'Período': { type: 'date' },
    'Periodo': { type: 'date' },
    
    // Text Area Fields (Long text)
    'Descrição': { type: 'textarea' },
    'Descricao': { type: 'textarea' },
    'Observação': { type: 'textarea' },
    'Observacao': { type: 'textarea' },
    'Nota': { type: 'textarea' },
    'Comentário': { type: 'textarea' },
    'Comentario': { type: 'textarea' },
    'Inconsistência': { type: 'textarea' },
    'Inconsistencia': { type: 'textarea' },
    
    // Readonly Fields
    'ID': { type: 'readonly' },
    'Chamado': { type: 'readonly' },
    'Caso': { type: 'readonly' },
};

/**
 * Normalize key for consistent matching (remove accents, lowercase, trim)
 */
function normalizeKey(key: string): string {
    return key.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

/**
 * Get field configuration for a given field name
 * Priority: User Config (localStorage) > Default Config > Normalized Match > Default to 'text'
 */
export function getFieldConfig(fieldName: string): FieldConfig {
    const normalizedName = normalizeKey(fieldName);

    // 1. Check user configuration in localStorage (highest priority)
    const userConfigs = getUserFieldConfigurations();
    // Check exact match first
    if (userConfigs[fieldName]) {
        return userConfigs[fieldName];
    }
    // Check normalized match in user configs
    const userMatchingKey = Object.keys(userConfigs).find(
        key => normalizeKey(key) === normalizedName
    );
    if (userMatchingKey) {
        return userConfigs[userMatchingKey];
    }
    
    // 2. Check default configuration
    // Check exact match first
    if (fieldConfigurations[fieldName]) {
        return fieldConfigurations[fieldName];
    }
    
    // 3. Check normalized match in default configs
    const defaultMatchingKey = Object.keys(fieldConfigurations).find(
        key => normalizeKey(key) === normalizedName
    );
    if (defaultMatchingKey) {
        return fieldConfigurations[defaultMatchingKey];
    }

    // 4. INTELLIGENT DEFAULTS based on name
    if (normalizedName.includes('obs') || 
        normalizedName.includes('desc') || 
        normalizedName.includes('detalhe') || 
        normalizedName.includes('comentario') ||
        normalizedName.includes('anotacao')) {
        return { type: 'textarea' };
    }

    if (normalizedName.includes('data') || 
        normalizedName.includes('dia') || 
        normalizedName.includes('vencimento') ||
        normalizedName.includes('criacao')) {
        return { type: 'date' };
    }

    if (normalizedName.includes('quantidade') ||
        normalizedName.includes('qtd') ||
        normalizedName.includes('estoque') ||
        normalizedName.includes('numero')) {
        return { type: 'numeric' };
    }

    // Force PCC and certain codes to be TEXT, even if they have "Valor" in the name
    if (normalizedName.includes('pcc') || 
        normalizedName.includes('cpf') || 
        normalizedName.includes('cnpj')) {
        return { type: 'text' };
    }

    if (normalizedName.includes('valor') || 
        normalizedName.includes('preco') || 
        normalizedName.includes('custo') ||
        normalizedName.includes('total') ||
        normalizedName.includes('montante') ||
        normalizedName.includes('receita') ||
        normalizedName.includes('despesa') ||
        // Tax fields heuristic
        normalizedName === 'ir' ||
        normalizedName.includes(' ir ') || 
        normalizedName.endsWith(' ir') ||
        normalizedName.startsWith('ir ') ||
        normalizedName.includes('iss') ||
        normalizedName.includes('imposto') ||
        normalizedName.includes('taxa')) {
        return { type: 'currency', formatCurrency: true };
    }
    
    // 5. Default to text input
    return { type: 'text' };
}

/**
 * Check if a field should be formatted as currency
 */
export function shouldFormatCurrency(fieldName: string): boolean {
    const config = getFieldConfig(fieldName);
    // STRICT RULE: Only currency or numeric types can have currency formatting
    if (config.type !== 'currency' && config.type !== 'numeric') return false;
    return config.formatCurrency === true;
}

/**
 * Check if a field should be a dropdown
 */
export function isDropdownField(fieldName: string): boolean {
    const config = getFieldConfig(fieldName);
    return config.type === 'dropdown';
}

/**
 * Check if a field is a date field
 */
export function isDateField(fieldName: string): boolean {
    const config = getFieldConfig(fieldName);
    return config.type === 'date';
}

/**
 * Check if a field is a textarea
 */
export function isTextareaField(fieldName: string): boolean {
    const config = getFieldConfig(fieldName);
    return config.type === 'textarea';
}

/**
 * Check if a field is readonly
 */
export function isReadonlyField(fieldName: string): boolean {
    const config = getFieldConfig(fieldName);
    return config.type === 'readonly';
}

// ============================================================================
// LocalStorage Management for User Configurations
// ============================================================================

const STORAGE_KEY = 'field-configurations';

/**
 * Get user field configurations from localStorage
 */
export function getUserFieldConfigurations(): Record<string, FieldConfig> {
    if (typeof window === 'undefined') return {};
    
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return {};
        return JSON.parse(stored);
    } catch (error) {
        console.error('Error loading field configurations:', error);
        return {};
    }
}

/**
 * Save user field configurations to localStorage
 */
export function saveUserFieldConfigurations(configs: Record<string, FieldConfig>): void {
    if (typeof window === 'undefined') return;
    
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(configs));
    } catch (error) {
        console.error('Error saving field configurations:', error);
    }
}

/**
 * Update a single field configuration
 */
export function updateFieldConfiguration(fieldName: string, config: FieldConfig): void {
    const userConfigs = getUserFieldConfigurations();
    userConfigs[fieldName] = config;
    saveUserFieldConfigurations(userConfigs);
    
    // Dispatch event to notify components
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('field-config-changed'));
    }
}

/**
 * Reset a field to default configuration
 */
export function resetFieldConfiguration(fieldName: string): void {
    const userConfigs = getUserFieldConfigurations();
    delete userConfigs[fieldName];
    saveUserFieldConfigurations(userConfigs);
    
    // Dispatch event
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('field-config-changed'));
    }
}

/**
 * Reset all fields to default configurations
 */
export function resetAllFieldConfigurations(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEY);
    
    // Dispatch event
    window.dispatchEvent(new CustomEvent('field-config-changed'));
}

/**
 * Get all unique field names from data
 */
export function getAllFieldsFromData(data: any[]): string[] {
    if (!data || data.length === 0) return [];
    
    const fieldsSet = new Set<string>();
    data.forEach(row => {
        Object.keys(row).forEach(key => fieldsSet.add(key));
    });
    
    return Array.from(fieldsSet).sort();
}
