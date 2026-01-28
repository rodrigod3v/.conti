# Sistema de Controle Contábil (Accounting Control System)

Uma plataforma moderna para gestão, validação e análise de dados contábeis. Projetada para automatizar a importação de planilhas complexas, normalizar inconsistências e fornecer insights visuais imediatos.

## 🚀 Novidades da Versão Atual

### 1. Ingestão Dinâmica & Inteligente
- **Schema Flexível**: O sistema agora se adapta automaticamente às colunas da sua planilha. Não exige mais templates rígidos.
- **Detecção Inteligente**:
  - **Categorias**: Colunas como "Status", "Cliente", "Fornecedor" viram Dropdowns automaticamente.
  - **Datas**: Converte formatações diversas (Excel Serial, Strings) para `dd/mm/yyyy`.
  - **Moedas**: Identifica colunas financeiras ("Valor", "Líquido") e formata como BRL.
- **Normalização**: Remove espaços extras e corrige variações de maiúsculas/minúsculas.

### 2. Editor de Dados (Data Grid)
- **Compacto & Responsivo**: A tabela se ajusta à altura da tela, evitando barra de rolagem na página inteira.
- **Edição Avançada**:
  - **Observações**: Campos de texto longo abrem em painéis confortáveis para leitura e edição.
  - **Dropdowns Dinâmicos**: As opções são geradas baseadas nos valores únicos encontrados na coluna.
- **Links Automáticos**: IDs detectados viram links diretos para a página de detalhes.

### 3. Página de Detalhes do Caso
- **Visual Limpo**: Exibe apenas os campos que possuem valor, removendo nulos ou vazios.
- **Organização**: Cards retráteis para "Financeiro", "Informações Gerais" e "Outros Detalhes".
- **Foco no Conteúdo**: Título simplificado mostrando apenas o ID e Nome relevante do item.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Linguagem**: TypeScript
- **Estilização**: Tailwind CSS v4 & Shadcn/UI
- **Estado**: Zustand (Store Global)
- **Processamento**: SheetJS (Excel Parsing)

## 📂 Estrutura do Projeto

```bash
.
├── app/
│   ├── (auth)/         # Login e Autenticação
│   ├── (setup)/        # Fluxo de Primeiro Acesso (Perfil)
│   ├── (main)/         # Dashboard, Editor, Detalhes
│   └── layout.tsx      # Root Layout
├── components/
│   ├── features/       # DataEditor, Cards, UploadZone
│   └── ui/             # Componentes Shadcn (Button, Card, Input...)
├── lib/
│   ├── column-utils.ts # Lógica centralizada de tipos de coluna
│   └── store.ts        # Gerenciamento de estado (Zustand)
└── public/             # Assets estáticos
```

## 🔧 Como Rodar Localmente

1.  **Instale as dependências**:
    ```bash
    npm install
    ```

2.  **Inicie o servidor**:
    ```bash
    npm run dev
    ```

3.  **Acesse**: `http://localhost:3000`

## 🤝 Desenvolvimento

- **Padronização**: Toda a lógica de detecção de colunas reside em `lib/column-utils.ts`.
- **Layouts**: Utilizamos `h-screen` e `flex` para garantir que a aplicação se comporte como um software desktop.
