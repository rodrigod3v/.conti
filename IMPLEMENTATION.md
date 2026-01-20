# Documentação de Implementação - Sistema de Controle Contábil

Este documento detalha as decisões técnicas, a arquitetura e a estrutura do código do Sistema de Controle Contábil.

## 🏗️ Stack Tecnológica

O projeto foi construído utilizando tecnologias modernas visando performance, manutenibilidade e uma interface "premium".

-   **Framework Principal**: [Next.js 14](https://nextjs.org/) (App Router) - Escolhido pela renderização híbrida e facilidade de roteamento.
-   **Linguagem**: [TypeScript](https://www.typescriptlang.org/) - Para tipagem estática e segurança no código.
-   **Estilização**:
    -   [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS para desenvolvimento rápido.
    -   [Shadcn/UI](https://ui.shadcn.com/) - Biblioteca de componentes acessíveis e customizáveis.
    -   Fonte: **Outfit** (Google Fonts) para uma aparência moderna e limpa.
-   **Ícones**: [Lucide React](https://lucide.dev/) - Ícones leves e consistentes.
-   **Gráficos**: [Recharts](https://recharts.org/) - Biblioteca de gráficos composta para React.
-   **Processamento de Dados**: `xlsx` (SheetJS) - Para leitura e parsing de arquivos Excel/CSV no navegador.
-   **Gerenciamento de Estado**: [Zustand](https://github.com/pmndrs/zustand) - Solução leve e simples para gerenciamento de estado global.

## 📂 Estrutura do Projeto

```
accounting-control-system/
├── app/                    # Rotas da aplicação (Next.js App Router)
│   ├── dashboard/          # Página de Dashboard
│   ├── editor/             # Página de Edição de Dados
│   ├── integrations/       # Página de Integrações
│   ├── settings/           # Página de Configurações
│   ├── layout.tsx          # Layout global (inclui Sidebar)
│   └── page.tsx            # Página Inicial (Upload)
├── components/
│   ├── features/           # Componentes específicos de cada funcionalidade
│   │   ├── activity-chart.tsx
│   │   ├── data-editor.tsx
│   │   ├── kpi-cards.tsx
│   │   ├── quick-nav-cards.tsx
│   │   ├── recent-history.tsx
│   │   ├── status-chart.tsx
│   │   └── upload-zone.tsx
│   ├── layout/             # Componentes estruturais
│   │   └── sidebar.tsx
│   └── ui/                 # Componentes genéricos (Botões, Cards, Inputs...)
├── lib/
│   ├── store.ts            # Store global (Zustand) para dados da planilha
│   └── utils.ts            # Funções utilitárias (cn, etc.)
└── public/                 # Arquivos estáticos
```

## 🧩 Funcionalidades Detalhadas

### 1. Upload e Parsing (Home)
-   Utiliza **Drag and Drop** com validação de tipo de arquivo.
-   Ao selecionar um arquivo, a biblioteca `xlsx` lê o buffer do arquivo diretamente no cliente (browser).
-   Os dados são convertidos para JSON e salvos na store global (`useAppStore`).
-   O usuário é redirecionado automaticamente para o Editor.

### 2. Editor de Dados
-   Exibe os dados carregados em uma tabela responsiva.
-   Permite a edição célula a célula.
-   A função `updateCell` na store garante que as alterações sejam refletidas no estado global.
-   Botão de "Salvar" simula uma persistência (pode ser conectado a uma API real futuramente).

### 3. Dashboard
-   **KPI Cards**: Exibem métricas agregadas (Total, Processados, Pendentes).
-   **Gráficos**:
    -   Visualização de Pizza para distribuição de status.
    -   Visualização de Barra para volume semanal.
-   Os componentes de gráfico são responsivos e animados.

### 4. Configurações e Integrações
-   Interfaces preparadas para gerenciamento de responsáveis (lista dinâmica local).
-   Interface de conexão com Google Sheets (mock visual pronto para implementação OAuth).

## 💡 Decisões de Design
-   **Sidebar Fixa**: Facilita a navegação entre os principais módulos.
-   **Zustand**: Escolhido ao invés de Context API ou Redux pela simplicidade e performance, evitando re-renders desnecessários na tabela de dados.
-   **Client-Side Processing**: O processamento de arquivos é feito no cliente para maior rapidez e privacidade inicial, sem necessidade de upload imediato para servidor.

## 🚀 Próximos Passos (Melhorias Sugeridas)
-   Implementar backend real para persistência de dados.
-   Adicionar autenticação de usuários.
-   Integrar API do Google Sheets real para sincronização.
