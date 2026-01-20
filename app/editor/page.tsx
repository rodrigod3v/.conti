import { DataEditor } from "@/components/features/data-editor";

export default function EditorPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Editor de Dados</h1>
                <p className="text-lg text-muted-foreground">
                    Visualize e edite os dados importados antes do processamento final.
                </p>
            </div>

            <DataEditor />
        </div>
    );
}
