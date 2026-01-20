# Documentação Técnica e de Implementação - Sistema de Controle Contábil

> Este documento serve como referência técnica detalhada sobre o funcionamento, arquitetura e decisões de projeto do Sistema de Controle Contábil.

## 1. Visão Geral da Arquitetura

O sistema é uma aplicação web **Full-Stack** moderna, construída sobre o framework **Next.js 14**, seguindo uma arquitetura monólito modular. Ele elimina a necessidade de infraestrutura complexa ao utilizar **SQLite** para persistência de dados local, sendo ideal para implantações simples e rápidas.

### Diagrama de Fluxo de Dados (Simplificado)

1.  **Usuário** faz upload de Excel/CSV no Frontend.
2.  **Next.js (API Route)** recebe o arquivo.
3.  **Prisma ORM** grava metadados no SQLite.
4.  **Prisma ORM** grava cada linha da planilha como um registro relacional.
5.  **Frontend** consulta a API para exibir e editar dados na tabela.

---

## 2. Stack Tecnológica

Escolhemos ferramentas focadas em produtividade, segurança de tipo e qualidade visual.

### Frontend
-   **Framework**: [Next.js 14 (App Router)](https://nextjs.org/)
    -   *Por que?* Oferece SSR (Server Side Rendering) para performance inicial e API Routes integradas para o backend.
-   **Linguagem**: [TypeScript](https://www.typescriptlang.org/)
    -   *Por que?* Garante integridade dos dados e previne erros comuns de runtime.
-   **Estilização**: [Tailwind CSS](https://tailwindcss.com/) + [Shadcn/UI](https://ui.shadcn.com/)
    -   *Por que?* Shadcn oferece componentes acessíveis e visualmente refinados ("Premium Look") que copiam código para o projeto, permitindo customização total.
-   **Ícones e Fontes**: Lucide React e Fonte "Outfit" (Google Fonts).

### Backend & Persistência
-   **API**: [Next.js API Routes](https://nextjs.org/docs/app/api-reference/file-conventions/route)
    -   Rotas `app/api/...` funcionam como endpoints REST.
-   **ORM**: [Prisma](https://www.prisma.io/)
    -   *Por que?* Abstrai o banco de dados SQL, oferecendo uma API type-safe em TypeScript para interagir com os dados. Facilita migrações futuras para PostgreSQL ou MySQL se necessário.
-   **Banco de Dados**: [SQLite](https://sqlite.org/)
    -   *Por que?* "Zero-config". O banco é um arquivo local (`dev.db`). Perfeito para rodar localmente sem precisar instalar servidores de banco de dados pesados (como Docker/Postgres).

---

## 3. O Que Implementamos (Detalhado)

### A. Persistência de Dados (Novo Backend)
Implementamos um backend real para que os dados não sejam perdidos ao recarregar a página.

**Schema do Banco de Dados (`prisma/schema.prisma`):**
1.  **Model `File`**: Armazena metadados do upload (Nome, Tamanho, Data de Criação).
2.  **Model `Row`**: Armazena as linhas de cada planilha.
    -   *Decisão Chave*: O campo `data` é armazenado como uma String JSON. Isso permite flexibilidade total – o sistema aceita planilhas com *qualquer* número e nome de colunas sem quebrar o banco.
3.  **Model `Setting`**: Tabela simples para armazenar configurações globais (Lista de Responsáveis, Status Customizados).

**API Endpoints (`app/api/`):**
-   `POST /api/files`: Recebe o upload e salva metadados.
-   `GET /api/rows?fileId=...`: Busca as linhas de um arquivo específico.
-   `POST /api/rows`: Salva edições em lote feitas na tabela.
-   `GET/POST /api/settings`: Lê e atualiza configurações de sistema.

### B. Interface do Usuário (Frontend)

**1. Home (`/`) - Upload Inteligente**
-   Componente `UploadZone` aceita arrastar e soltar.
-   Valida extensões (`.xlsx`, `.csv`).
-   Envia para à API para persistência imediata.

**2. Editor de Dados (`/editor`)**
-   Tabela interativa construída com componentes Shadcn.
-   **Edição em Célula**: Cada célula é um `Input` editável.
-   **Estado Local**: Usa `useState` (e Zustand anteriormente) para performance rápida durante a digitação.
-   **Botão Salvar**: Ao clicar, envia o estado atual inteiro para o backend (`/api/rows`), garantindo que o que você vê é o que está salvo.

**3. Configurações (`/settings`)**
-   Gerenciamento de **Responsáveis**.
-   Conecta diretamente com o banco SQLite. Ao adicionar um nome, ele é salvo permanentemente.

---

## 4. Estrutura de Pastas Explicada

-   `app/`: O coração do Next.js.
    -   `api/`: O Backend. Cada pasta aqui é uma rota URL.
    -   `(páginas)`: `dashboard/`, `editor/`, etc. são as páginas visuais.
-   `components/`: Blocos de construção.
    -   `ui/`: Botões, Inputs, Cards (Genéricos).
    -   `features/`: Componentes de negócio (Gráficos, Tabela de Dados).
-   `lib/`: Utilitários.
    -   `prisma.ts`: Conector único do banco de dados (Singleton pattern) para evitar múltiplas conexões.
    -   `utils.ts`: Auxiliares de classe CSS.
-   `prisma/`:
    -   `schema.prisma`: A "planta baixa" do seu banco de dados.

## 5. Próximos Passos Recomendados

Para levar este projeto para produção em um servidor real (AWS/Vercel):
1.  Mudar o provider do Prisma de `sqlite` para `postgresql`.
2.  Configurar autenticação (NextAuth.js) para proteger as rotas.
3.  Implementar validação de dados mais rígida no upload (Zod).
