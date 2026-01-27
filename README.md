# Sistema de Controle Contábil (Accounting Control System)

Uma plataforma moderna e robusta para gestão, validação e análise de dados contábeis. Projetada para automatizar a importação de planilhas complexas, normalizar inconsistências e fornecer insights visuais imediatos para equipes financeiras.

## 🚀 Visão Geral

O **Sistema de Controle Contábil** resolve o desafio de consolidar dados de diversas fontes (Excel, CSV) em um formato padronizado. Ele atua como uma camada de inteligência entre os dados brutos e o operador, oferecendo:

1.  **Ingestão Inteligente**: Algoritmos de normalização que mapeiam automaticamente colunas variadas (ex: "Data", "Dt. Lançamento", "Data Venc.") para um schema unificado.
2.  **Gestão de Inconsistências**: Identificação automática de erros ou pendências nos registros importados.
3.  **Visualização Avançada**: Dashboard com KPIs, gráficos de status e painéis de casos urgentes.
4.  **Edição em Massa**: Uma interface de "Data Grid" poderosa para correção rápida de registros diretamente no navegador.

## 🛠️ Tech Stack

O projeto utiliza as tecnologias mais recentes do ecossistema React/Next.js para garantir performance, tipagem estática e facilidade de manutenção.

-   **Framework**: [Next.js 16](https://nextjs.org/) (App Router & Turbopack)
-   **Linguagem**: [TypeScript](https://www.typescriptlang.org/)
-   **Estilização**: [Tailwind CSS v4](https://tailwindcss.com/) & [Shadcn/UI](https://ui.shadcn.com/)
-   **Banco de Dados**: [SQLite](https://www.sqlite.org/) (Portátil e eficiente para o escopo)
-   **ORM**: [Prisma](https://www.prisma.io/) (Tipagem segura de banco de dados)
-   **Processamento de Arquivos**: [SheetJS (xlsx)](https://docs.sheetjs.com/) para parsing de planilhas.
-   **Gerenciamento de Estado**: [Zustand](https://github.com/pmndrs/zustand)
-   **Visualização de Dados**: [Recharts](https://recharts.org/)

## ⚡ Funcionalidades Principais

### 1. Upload e Normalização
-   Importação "Drag & Drop" de arquivos `.xlsx` e `.csv`.
-   Algorítimo fuzzy para detecção de colunas (Ex: reconhece "Vlr Liq" e "Valor Liquido" como a mesma entidade).
-   Conversão automática de datas do formato Serial Excel para JS Date.
-   Inserção em **Lote (Batch)** para alta performance com arquivos grandes (5000+ linhas).

### 2. Dashboard Analítico
-   Cards de KPI: Total de Casos, Inconsistências, Valor Total.
-   Gráficos interativos de Status dos Chamados.
-   Histórico recente de arquivos importados.

### 3. Editor de Dados (Data Grid)
-   Visualização tabular de alta densidade.
-   Edição inline de células.
-   Filtros e ordenação.

## 📂 Estrutura do Projeto

```bash
.
├── app/
│   ├── api/            # Rotas de API (Next.js server-less functions)
│   ├── (dashboard)/    # Layouts autenticados/protegidos
│   ├── editor/         # Interface de edição de dados
│   └── page.tsx        # Home / Landing de Upload
├── components/
│   ├── features/       # Componentes de negócio (UploadZone, QuickNav, Charts)
│   └── ui/             # Componentes de design system (Botões, Modais - Shadcn)
├── lib/
│   ├── prisma.ts       # Cliente do banco de dados (Singleton)
│   ├── store.ts        # Gerenciamento de estado global (Zustand)
│   └── utils.ts        # Funções auxiliares
├── prisma/
│   ├── schema.prisma   # Definição do banco de dados
│   └── dev.db          # Arquivo do banco de dados (SQLite)
└── scripts/            # Scripts de automação de deploy
```

## 🔧 Como Rodar Localmente

### Pré-requisitos
-   Node.js 20+
-   npm ou yarn

### Instalação

1.  Clone o repositório e instale as dependências:
    ```bash
    npm install
    ```

2.  Configure o banco de dados:
    ```bash
    # Gera o cliente Prisma e cria o arquivo do banco dev.db
    npx prisma migrate dev --name init
    # OU apenas sincronize sem criar migrações
    npx prisma db push
    ```

3.  Inicie o servidor de desenvolvimento:
    ```bash
    npm run dev
    ```

4.  Acesse `http://localhost:3000`

## 🚢 Deploy e Produção

O projeto conta com scripts automatizados para empacotamento e deploy em ambientes Linux (Ubuntu/VMs).

Consulte o arquivo [DEPLOY.md](./DEPLOY.md) para o guia completo passo-a-passo.

Resumo dos comandos de deploy:
```powershell
# 1. Build e Empacotamento (PowerShell)
.\scripts\package_deploy.ps1

# 2. Envio e Execução (Exemplo)
scp deploy.zip usuario@ip:~/
ssh usuario@ip "bash finalize_deploy.sh"
```

## 🤝 Contribuição

1.  Siga o padrão de commits.
2.  Mantenha o schema do Prisma atualizado.
3.  Utilize componentes do diretório `components/ui` para manter a consistência visual.
