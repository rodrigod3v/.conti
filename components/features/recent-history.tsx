import { FileSpreadsheet, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { useToast } from "@/components/ui/simple-toast";

interface FileRecord {
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
    status: string;
    size: number;
}

function formatBytes(bytes: number, decimals = 1) {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

function formatDate(dateString: string) {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    return `${day}/${month}/${year} as ${hours}:${minutes}h`;
}

const statusMap: Record<string, string> = {
    'Processed': 'Processado',
    'Pending': 'Pendente',
    'Error': 'Erro'
};

export function RecentHistory() {
    const [files, setFiles] = useState<FileRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [isExpanded, setIsExpanded] = useState(false); // Added isExpanded state
    const router = useRouter();
    const { setFileData } = useAppStore();
    const toast = useToast();

    useEffect(() => {
        async function fetchFiles() {
            try {
                const response = await fetch('/api/files');
                if (response.ok) {
                    const data = await response.json();
                    setFiles(data);
                }
            } catch (error) {
                console.error("Failed to fetch files", error);
            } finally {
                setLoading(false);
            }
        }
        fetchFiles();
    }, []);

    const handleOpenFile = async (fileId: string) => {
        try {
            const response = await fetch(`/api/files/${fileId}`);
            if (!response.ok) throw new Error("Failed to fetch file details");

            const fileData = await response.json();

            if (fileData.rows && fileData.rows.length > 0) {
                // Parse the JSON string data from each row
                const parsedRows = fileData.rows.map((row: any) => JSON.parse(row.data));
                const headers = Object.keys(parsedRows[0]);

                setFileData(parsedRows, headers, fileData.name, fileData.id);
                toast.success("Arquivo Aberto", `O arquivo "${fileData.name}" foi carregado com sucesso.`);
                router.push("/editor");
            } else {
                toast.error("Arquivo Vazio", "Este arquivo não possui dados para exibir.");
            }

        } catch (error) {
            console.error("Error opening file:", error);
            toast.error("Erro ao abrir", "Não foi possível carregar o arquivo selecionado.");
        }
    };

    if (loading) {
        return (
            <div className="rounded-2xl border bg-white shadow-sm dark:bg-card p-6 flex justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    const displayedFiles = isExpanded ? files : files.slice(0, 3); // Sliced files based on state

    return (
        <div className="rounded-2xl border bg-white shadow-sm dark:bg-card">
            <div className="flex items-center justify-between border-b px-4 py-3">
                <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-foreground">Histórico Recente</h2>
                </div>
                {files.length > 3 && ( // Conditionally render button
                    <Button
                        variant="ghost"
                        className="text-sm text-muted-foreground hover:text-foreground"
                        onClick={() => setIsExpanded(!isExpanded)} // Toggle logic
                    >
                        {isExpanded ? "Ver menos" : "Ver todos"} {/* Button text changes */}
                    </Button>
                )}
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-muted/30 text-xs uppercase text-muted-foreground">
                        <tr>
                            <th className="px-4 py-2 font-medium">Nome do Arquivo</th>
                            <th className="px-4 py-2 font-medium">Data de Envio</th>
                            <th className="px-4 py-2 font-medium">Status</th>
                            <th className="px-4 py-2 font-medium text-right">Ação</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {files.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                                    Nenhum arquivo recente encontrado.
                                </td>
                            </tr>
                        ) : (
                            displayedFiles.map((file) => ( // Used displayedFiles
                                <tr key={file.id} className="group hover:bg-muted/20">
                                    <td className="whitespace-nowrap px-4 py-2">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                                <FileSpreadsheet className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-foreground">{file.name}</p>
                                                <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-2 text-muted-foreground">
                                        {formatDate(file.updatedAt || file.createdAt)} {/* Used updatedAt */}
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-2">
                                        <Badge
                                            variant="outline"
                                            className={`
                                            ${(statusMap[file.status] || file.status) === 'Processado' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : ''}
                                            ${(statusMap[file.status] || file.status) === 'Pendente' ? 'border-amber-200 bg-amber-50 text-amber-700' : ''}
                                            ${(statusMap[file.status] || file.status) === 'Erro' ? 'border-red-200 bg-red-50 text-red-700' : ''}
                                        `}
                                        >
                                            {statusMap[file.status] || file.status}
                                        </Badge>
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-2 text-right">
                                        <Button
                                            variant="ghost"
                                            className="font-medium text-primary hover:bg-primary/10 hover:text-primary"
                                            onClick={() => handleOpenFile(file.id)}
                                        >
                                            Abrir
                                        </Button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
