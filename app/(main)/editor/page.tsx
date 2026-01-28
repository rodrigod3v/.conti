import { DataEditor } from "@/components/features/data-editor";

export default function EditorPage() {
    return (
        <div className="h-full flex flex-col overflow-hidden">
            <div className="flex-1 overflow-hidden p-6">
                <DataEditor />
            </div>
        </div>
    );
}
