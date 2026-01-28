# Field Configuration System - User Guide

## Overview
The field configuration system allows you to explicitly define how each field in your spreadsheet should be displayed and formatted. Instead of relying on automatic detection, you can now manually configure each field's type and behavior.

## Field Types

- **`currency`**: Monetary fields with automatic formatting (comma as decimal, dot as thousand separator)
- **`dropdown`**: Select fields with predefined options
- **`date`**: Date fields
- **`numeric`**: Numeric fields without currency formatting
- **`textarea`**: Long text fields with multi-line input
- **`text`**: Default text input
- **`readonly`**: Read-only fields that cannot be edited

## How to Configure Fields

### Location
All field configurations are in: **`lib/field-config.ts`**

### Adding a New Field

1. Open `lib/field-config.ts`
2. Add your field to the `fieldConfigurations` object:

```typescript
export const fieldConfigurations: Record<string, FieldConfig> = {
    // ... existing fields ...
    
    // Your new field
    'Your Field Name': { type: 'currency', formatCurrency: true },
};
```

### Examples

#### Currency Field
```typescript
'Montante Bruto': { type: 'currency', formatCurrency: true },
```

#### Dropdown Field
```typescript
'Status': { type: 'dropdown' },
```
*Note: Options are automatically populated from your data*

#### Date Field
```typescript
'Data Vencimento': { type: 'date' },
```

#### Textarea Field
```typescript
'Descrição': { type: 'textarea' },
```

#### Numeric Field (no currency formatting)
```typescript
'Quantidade': { type: 'numeric' },
```

## Currently Configured Fields

### Financial Fields (Currency)
- Montante Bruto
- Valor Líquido
- Valor, Valor Total, Valor Unitário
- Base ISS
- Custo, Preço
- IR

### Dropdown Fields
- Status
- Cliente, Responsável
- Unidade, Forma de Pagamento
- Categoria, Departamento, Setor
- Produto, Fornecedor, Empresa

### Date Fields
- Data, Data Abertura, Data de Abertura
- Vencimento, Data Vencimento
- Período, Periodo

### Textarea Fields
- Descrição, Descricao
- Observação, Observacao
- Nota, Comentário, Comentario
- Inconsistência, Inconsistencia

### Readonly Fields
- ID, Chamado, Caso

## Troubleshooting

### Field Not Formatting
1. Check if the field name matches exactly (case-insensitive matching is supported)
2. Verify the field configuration in `lib/field-config.ts`
3. For currency fields, ensure `formatCurrency: true` is set

### Field Showing as Text Instead of Dropdown
1. Add the field to `fieldConfigurations` with `type: 'dropdown'`
2. Save the file and refresh the page

### Adding a Field with Special Characters
Use the exact field name as it appears in your spreadsheet:
```typescript
'Valor (R$)': { type: 'currency', formatCurrency: true },
```

## Benefits

✅ **Full Control**: Explicitly define how each field behaves  
✅ **Easy Maintenance**: All configurations in one file  
✅ **Predictable**: No surprises from automatic detection  
✅ **Flexible**: Easy to add new fields or change existing ones  
✅ **Type Safe**: TypeScript ensures correct configuration
