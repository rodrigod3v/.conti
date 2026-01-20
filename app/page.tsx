"use client";

import { UploadZone } from "@/components/features/upload-zone";
import { QuickNavCards } from "@/components/features/quick-nav-cards";
import { RecentHistory } from "@/components/features/recent-history";
import { Calendar } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { read, utils } from "xlsx";

export default function Home() {
  const today = new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
  const { setFileData } = useAppStore();
  const router = useRouter();

  const handleFileSelect = async (file: File) => {
    try {
      const data = await file.arrayBuffer();
      const workbook = read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = utils.sheet_to_json(worksheet);

      if (jsonData.length > 0) {
        const headers = Object.keys(jsonData[0] as object);

        // Save to Database
        try {
          const response = await fetch('/api/files', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: file.name,
              size: file.size,
              rows: jsonData
            })
          });

          if (!response.ok) throw new Error("Falha ao salvar no banco");

          const savedFile = await response.json();
          // Update store with new file ID (for Data Editor context)
          setFileData(jsonData as any[], headers, file.name); // Using local data for immediate feedback, but could fetch
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

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Meus Casos</h1>
          <p className="text-lg text-muted-foreground">
            Gerencie seus arquivos contábeis e inicie novos processamentos.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full border bg-white px-4 py-2 text-sm font-medium text-muted-foreground shadow-sm dark:bg-card">
          <Calendar className="h-4 w-4" />
          <span>{today}</span>
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
