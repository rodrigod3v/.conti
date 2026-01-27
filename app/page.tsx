"use client";

import { UploadZone } from "@/components/features/upload-zone";
import { QuickNavCards } from "@/components/features/quick-nav-cards";
import { RecentHistory } from "@/components/features/recent-history";
import { Calendar, Download } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { read, utils } from "xlsx";
import { Button } from "@/components/ui/button";

export default function Home() {
  const today = new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
  const { setFileData } = useAppStore();
  const router = useRouter();

  const handleFileSelect = async (file: File) => {
    try {
      const buffer = await file.arrayBuffer();
      let jsonData: any[] = [];
      let workbook;

      // Ensure UTF-8 for CSVs
      if (file.name.endsWith(".csv") || file.type === "text/csv") {
        const textDecoder = new TextDecoder("utf-8");
        const text = textDecoder.decode(buffer);
        workbook = read(text, { type: "string" });
      } else {
        workbook = read(buffer);
      }

      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      jsonData = utils.sheet_to_json(worksheet);

      if (jsonData.length > 0) {
        // Transformation Logic
        const transformedData = jsonData.map((row: any, index: number) => {
          const newRow: any = { ...row };

          // 1. Column Mapping and Normalization
          const getVal = (keys: string[]) => {
            for (const k of keys) {
              if (row[k] !== undefined) return row[k];
              const found = Object.keys(row).find(rk => rk.toLowerCase().trim() === k.toLowerCase().trim());
              if (found) return row[found];
            }
            return undefined;
          };

          // Core Mappings
          newRow["Chamado"] = getVal(["observaçao/chamado", "observacao/chamado", "chamado", "caso"]) || row["Chamado"];
          newRow["Observações"] = getVal(["observacoes", "observações", "obs"]) || "";
          newRow["Status"] = getVal(["status do pgto", "status pagamento", "status"]) || row["Status"];
          newRow["Data"] = getVal(["data lançamento", "data lancamento", "data"]) || row["Data"];
          newRow["Valor (R$)"] = getVal(["montante", "valor"]) || row["Valor (R$)"];
          newRow["Responsável"] = getVal(["responsvel", "responsável", "responsavel"]) || row["Responsável"];
          newRow["Inconsistencias"] = getVal(["exeçao", "excecao", "inconsistencias"]) || row["Inconsistencias"];

          // Schema Normalization
          const normalize = (target: string, sources: string[]) => {
            const val = getVal(sources);
            if (val !== undefined) newRow[target] = val;
          };

          normalize("Area Responsavel", ["area responsavel"]);
          normalize("Data do Pgto", ["data do pgto", "data pagamento"]);
          normalize("Empresa", ["empresa"]);
          normalize("Fornecedor", ["fornecedor"]);
          normalize("Nome do Fornecedor", ["nome do fornecedor"]);
          normalize("Referencia", ["referencia"]);
          normalize("Ordem", ["ordem"]);
          normalize("Lancamento", ["lancamento", "lançamento"]);
          normalize("Forma de Pgto", ["forma de pagamento", "forma de pgto"]);
          normalize("Data Lanç Contab", ["data lançamento contabil", "data lancamento contabil", "data lanç contab"]);
          normalize("Data Vencimento", ["data vencimento"]);
          normalize("Valor Liquido", ["valor liquido"]);
          normalize("Texto de Item", ["texto de item"]);
          normalize("№ ID Fiscal", ["numero do id fiscal", "no id fiscal", "№ id fiscal"]);
          normalize("Exercicio", ["exercido", "exercicio"]);
          normalize("Bloq Pgto Item", ["bloqueio pagamento item", "bloq pgto item"]);
          normalize("Tp Lanç Cont", ["tipo lancamento contabil", "tp lanç cont"]);
          normalize("PCC", ["PCC"]);
          normalize("IR", ["IR"]);
          normalize("Base ISS", ["Base ISS"]);

          // Date Formatting Helper
          const formatDate = (key: string) => {
            if (newRow[key]) {
              let rawDate = newRow[key];
              const numericDate = parseFloat(String(rawDate));
              if (!isNaN(numericDate) && numericDate > 20000 && String(rawDate).match(/^\d+(\.\d+)?$/)) {
                const dateObj = new Date((numericDate - 25569) * 86400 * 1000);
                const day = String(dateObj.getUTCDate()).padStart(2, '0');
                const month = String(dateObj.getUTCMonth() + 1).padStart(2, '0');
                const year = dateObj.getUTCFullYear();
                newRow[key] = `${day}/${month}/${year}`;
              }
            }
          };

          // Apply date formatting
          formatDate("Data");
          formatDate("Data do Pgto");
          formatDate("Data Lanç Contab");
          formatDate("Data Vencimento");

          // Clean up old specific maps logic to avoid duplication
          delete newRow["Dia"];
          delete newRow["Quantidade"];
          delete newRow["Responsavel"];
          delete newRow["Caso"]; // Ensure old key is gone if present

          // 2. Status Logic based on 'Inconsistencias'
          if (row["Inconsistencias"] && String(row["Inconsistencias"]).trim() !== "") {
            newRow["Status"] = "Erro";
            // Ensure Inconsistencias is preserved if not already
            newRow["Inconsistencias"] = row["Inconsistencias"];
          }

          // 3. Status Badge Normalization (Optional but good for consistency)
          // If Status is 'Pendente', keep it.

          // 4. Generate Case ID if missing
          if (!newRow["Chamado"]) {
            // Generate a simple ID based on date or generic counter
            // Try to extract year from Data if available
            let year = new Date().getFullYear();
            if (newRow["Data"]) {
              // Try to parse DD/MM/YYYY or YYYY-MM-DD
              // Simple check:
              const parts = String(newRow["Data"]).split(/[-/]/);
              if (parts.length === 3) {
                // Assuming Year is usually last in pt-BR (DD/MM/YYYY) or first in ISO
                if (parts[0].length === 4) year = parseInt(parts[0]);
                else if (parts[2].length === 4) year = parseInt(parts[2]);
              }
            }
            // Format: CS-{Year}-{Index padded}
            // Using global index might be tricky if we don't know the last DB index. 
            // ideally we'd need a sequence from DB. 
            // For now, generating a temporary unique ID for the session/file import.
            // To make it look realistic: CS-2023-{random/index}
            const padIndex = String(index + 1).padStart(3, '0');
            newRow["Chamado"] = `CS-${year}-${padIndex}`;
          }

          return newRow;
        });

        // Forced Header Ordering
        // Chamado first, Observações second, then rest
        const baseHeaders = ["Chamado", "Observações"];
        const otherHeaders = Object.keys(transformedData[0] as object).filter(h => !baseHeaders.includes(h));
        const headers = [...baseHeaders, ...otherHeaders];

        // Save to Database
        try {
          const response = await fetch('/api/files', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: file.name,
              size: file.size,
              rows: transformedData
            })
          });

          if (!response.ok) throw new Error("Falha ao salvar no banco");

          const savedFile = await response.json();
          // Update store with new file ID (for Data Editor context)
          setFileData(transformedData, headers, file.name); // Using local data for immediate feedback, but could fetch
          // Ideally store the savedFile.id in the store too
        } catch (dbError) {
          console.error("Erro de persistência:", dbError);
          alert("Erro ao salvar no banco de dados, mas carregando visualização...");
        }

        router.push("/editor");
      } else {
        alert("O arquivo parece estar vazio.");
      }
    } catch (error) {
      console.error("Erro ao ler arquivo:", error);
      alert("Erro ao processar o arquivo. Verifique se é um Excel válido.");
    }
  };

  const downloadTemplate = () => {
    const headers = [
      "Chamado", "Observações", "Data", "Status do Pgto", "Responsável", "Área Responsável",
      "Data do Pgto", "Exceção", "Empresa", "Fornecedor", "Nome do Fornecedor",
      "Referencia", "Ordem", "Lançamento", "Forma de Pgto", "Data Lanç Contab",
      "Data Vencimento", "Montante", "Valor Liquido", "Texto de Item",
      "№ ID Fiscal", "Exercicio", "Bloq Pgto Item", "Tp Lanç Cont",
      "PCC", "IR", "Base ISS"
    ];

    const csvContent = headers.join(",") + "\n" +
      "CS-2025-001,Exemplo de observação,14/01/2025,Pendente,João Silva,Financeiro,15/01/2025,,,,,,,,0,0,0,,,,,,,\n";

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "modelo_importacao.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Header Section */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Home</h1>
          <p className="text-lg text-muted-foreground">
            Gerencie seus arquivos contábeis e inicie novos processamentos.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={downloadTemplate}
            className="gap-2 border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800"
          >
            <Download className="h-4 w-4" />
            Baixar Modelo CSV
          </Button>
          <div className="flex items-center gap-2 rounded-full border bg-white px-4 py-2 text-sm font-medium text-muted-foreground shadow-sm dark:bg-card">
            <Calendar className="h-4 w-4" />
            <span>{today}</span>
          </div>
        </div>
      </div>

      {/* Upload Section */}
      <section>
        <UploadZone onFileSelect={handleFileSelect} />
      </section>

      {/* Quick Navigation Cards */}
      <section>
        <QuickNavCards />
      </section>

      {/* Recent History */}
      <section>
        <RecentHistory />
      </section>
    </div>
  );
}
