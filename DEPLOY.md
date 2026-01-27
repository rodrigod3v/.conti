# Deploy Guide: Accounting Control System

Este guia descreve o processo completo para realizar o deploy da aplicação em sua VM de Produção.

## 1. Visão Geral do Ambiente
- **Target VM**: 1 OCPU, 1GB RAM (Oracle Cloud)
- **OS**: Ubuntu 24.04
- **Runtime**: Node.js 20 (PM2)
- **Banco de Dados**: SQLite (Persistente em `~/app_data/production.db`)
- **Key File**: `ssh-key-2026-01-26.key` (Mantenha seguro!)

## 2. Pré-requisitos (Máquina Local)
Certifique-se de ter instalado:
- Node.js & npm
- PowerShell (Windows)
- Cliente OpenSSH
- **Importante**: O comando `tar` deve estar disponível no PowerShell para compactação correta (vem padrão no Windows 10/11 moderno).

## 3. Processo de Deploy (Passo a Passo)

### Passo 1: Compilar e Empacotar
Execute o script de automação na raiz do projeto. Este script irá construir a aplicação, preparar a pasta de deploy, copiar o schema do Prisma e gerar o arquivo `deploy.zip` compatível com Linux.

```powershell
.\scripts\package_deploy.ps1
```
*Saída esperada*: Um arquivo `deploy.zip` na raiz do projeto.

### Passo 2: Enviar para o Servidor
Use o comando SCP para transferir o pacote e o script de finalização.
Substitua `"caminho/para/chave.key"` pelo caminho real da sua chave SSH.

```powershell
# Upload do Pacote
scp -i "ssh-key-2026-01-26.key" deploy.zip ubuntu@144.22.254.132:~/deploy.zip

# Upload do Script de Instalação (caso tenha sido alterado)
scp -i "ssh-key-2026-01-26.key" scripts/finalize_deploy.sh ubuntu@144.22.254.132:~/finalize_deploy.sh
```

### Passo 3: Finalizar Instalação
Conecte-se à VM e execute o script de finalização. Este script cuida de:
- Parar a aplicação antiga.
- Backup do banco de dados existente.
- Extração segura dos arquivos.
- Instalação de dependências e **Geração do Cliente Prisma**.
- Reinício do processo via PM2.

```powershell
ssh -i "ssh-key-2026-01-26.key" ubuntu@144.22.254.132 "bash finalize_deploy.sh"
```

## 4. Gestão de Banco de Dados
O banco de dados é mantido fora da pasta da aplicação para evitar perda de dados durante updates.
- **Localização**: `/home/ubuntu/app_data/production.db`

### Backup Local
Para baixar o banco de produção para sua máquina:
```powershell
scp -i "ssh-key-2026-01-26.key" ubuntu@144.22.254.132:~/app_data/production.db ./backup_production.db
```

## 5. Troubleshooting / Comandos Úteis

Se algo der errado, use estes comandos na VM para investigar:

### Verificar Status
```bash
pm2 status
```

### Ver Logs (Erros)
```bash
pm2 logs next-app --err --lines 50
```

### Forçar Regeneração do Prisma
Se houver erro de "Prisma Client not initialized":
```bash
cd ~/app
npx prisma generate
pm2 restart next-app
```
