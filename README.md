# Sistema de Controle Contábil (Conti)

Uma plataforma moderna e inteligente para gestão, validação e análise de casos contábeis. O **Conti** foi projetado para eliminar o trabalho manual de planilhas, automatizando a ingestão de dados, normalizando inconsistências e oferecendo uma interface focada na resolução de casos.

## 🎯 Propósito do App
Transformar planilhas estáticas e desorganizadas em **Casos Gerenciáveis**. O sistema serve como um "Hub Central" onde analistas podem importar dados brutos, visualizar detalhes ricos, editar informações com segurança e acompanhar o status de cada item até sua resolução.

---

## 🚀 Funcionalidades Principais

### 1. Ingestão Dinâmica & Inteligente
*   **Zero Configuração**: Basta arrastar sua planilha (Excel/CSV). O sistema mapeia automaticamente as colunas.
*   **Detecção de Tipos**:
    *   **Datas**: Reconhece formatos complexos (ex: "Tue Jan 27...") e converte para `DD/MM/AAAA`.
    *   **Financeiro**: Formata colunas de valores como moeda BRL automaticamente.
    *   **Categorias**: Transforma textos repetitivos em Dropdowns para filtragem fácil.

### 2. Modal de Edição Adaptativo (novo)
O coração da manipulação de dados. Ao editar um caso, a interface se molda ao conteúdo:
*   **HUD Inteligente**: O layout se reorganiza automaticamente entre **1, 2 ou 3 colunas** para aproveitar o espaço da tela.
*   **Seções Condicionais**:
    *   *Contexto e Prazos*: Só aparece se houver dados de Cliente, Responsável ou Datas.
    *   *Detalhes do Lançamento*: Oculta-se automaticamente se não houver campos numéricos/extras.
    *   *Ação e Financeiro*: Painel fixo para decisão e status.
*   **Formatação Visual**:
    *   Datas em títulos e listas são renderizadas de forma legível.
    *   Inputs financeiros vêm alinhados e formatados.

### 3. Visualização de Arquivos (Preview)
*   **Excel no Navegador**: Visualize o conteúdo de arquivos anexados sem precisar baixá-los.
*   **Fallback Robusto**: Se o arquivo não puder ser exibido, o download é oferecido automaticamente.

### 4. Página de Detalhes & Timeline
*   **Histórico Completo**: Acompanhe a evolução do caso com comentários e logs de alteração.
*   **Organização Visual**: Badges de status coloridos e agrupamento lógico de informações.

---

## 🛠️ Tech Stack & Infraestrutura

### Stack de Desenvolvimento
*   **Frontend**: [Next.js 15+](https://nextjs.org/) (App Router)
*   **Linguagem**: TypeScript
*   **UI/UX**: Tailwind CSS v4 + Shadcn/UI
*   **Gerenciamento de Estado**: Zustand

### Banco de Dados
*   **ORM**: Prisma
*   **Engine**: SQLite (Configurado para produção em arquivo persistente)
*   **Estrutura**: `prisma/schema.prisma` define os modelos de `File`, `Row` (Dados Dinâmicos em JSON), `Setting` e `User`.

### Versionamento
O projeto utiliza **Git** com a seguinte estratégia de branches:
*   `main`: Versão estável em produção.
*   `feature/*`: Branches para novas funcionalidades (ex: `feature/dashboard`).

---

## ☁️ Deploy & VM Configuration

O projeto está configurado para deploy em máquinas virtuais Linux (ex: Ubuntu na Oracle Cloud/AWS/Azure).

### Arquitetura de Produção
*   **Runtime**: Node.js gerenciado pelo **PM2** (Process Manager).
*   **Automação**: Scripts PowerShell (`scripts/package_deploy.ps1`) empacotam a aplicação automaticamente.
*   **Banco de Dados**: O arquivo `.db` reside fora da pasta da build (`~/app_data/`) para garantir persistência entre deploys.

> 📄 **Guia Completo**: Para instruções passo-a-passo sobre chaves SSH, scripts de upload e comandos do servidor, consulte o arquivo [`DEPLOY.md`](./DEPLOY.md).

---

## 📂 Estrutura do Projeto

```bash
.
├── app/
│   ├── (main)/         # Área logada (Dashboard, Casos)
│   │   ├── cases/[id]/ # Página de Detalhes e Modal de Edição
│   │   └── editor/     # Grid de Dados e Importação
│   └── layout.tsx      # Configurações Globais
├── components/
│   ├── features/       # Componentes de Negócio (EditModal, CaseTimeline...)
│   └── ui/             # Biblioteca de Design (Botões, Inputs...)
├── lib/
│   ├── column-utils.ts # Inteligência de detecção de colunas
│   └── field-config.ts # Configurações de campos dinâmicos
├── prisma/             # Schema do Banco de Dados e Migrations
└── scripts/            # Scripts de automação de build e deploy
```

## 🔧 Como Rodar Localmente

1.  **Instale as dependências**:
    ```bash
    npm install
    ```

2.  **Configure o Banco de Dados**:
    ```bash
    npx prisma generate
    npx prisma push --accept-data-loss
    ```

3.  **Inicie o servidor de desenvolvimento**:
    ```bash
    npm run dev
    ```

4.  **Acesse**: `http://localhost:3000`
