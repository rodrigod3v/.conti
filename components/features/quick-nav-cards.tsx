import { ArrowRight, FileText, Settings, Grid } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const cards = [
    {
        title: "Editor de Dados",
        description: "Edite células de planilhas importadas diretamente na plataforma antes de processar.",
        icon: FileText,
        href: "/editor",
        color: "text-blue-600",
        bg: "bg-blue-50 dark:bg-blue-900/20",
        border: "border-blue-100 dark:border-blue-900",
    },
    {
        title: "Configurações",
        description: "Ajuste suas preferências de auditoria e regras fiscais para os novos casos.",
        icon: Settings,
        href: "/settings",
        color: "text-amber-600",
        bg: "bg-amber-50 dark:bg-amber-900/20",
        border: "border-amber-100 dark:border-amber-900",
    },
    {
        title: "Google Sheets",
        description: "Conecte sua conta Google para sincronização automática de planilhas.",
        icon: Grid,
        href: "/integrations",
        color: "text-emerald-600",
        bg: "bg-emerald-50 dark:bg-emerald-900/20",
        border: "border-emerald-100 dark:border-emerald-900",
    },
];

export function QuickNavCards() {
    return (
        <div className="grid gap-4 md:grid-cols-3">
            {cards.map((card) => (
                <Link
                    key={card.title}
                    href={card.href}
                    className={cn(
                        "group relative flex flex-col justify-between overflow-hidden rounded-2xl border bg-white p-4 transition-all hover:shadow-lg dark:bg-card",
                        card.border
                    )}
                >
                    <div>
                        <div className={cn("mb-3 flex h-10 w-10 items-center justify-center rounded-xl", card.bg, card.color)}>
                            <card.icon className="h-5 w-5" />
                        </div>
                        <h3 className="mb-2 text-lg font-bold text-foreground">{card.title}</h3>
                        <p className="text-sm leading-relaxed text-muted-foreground">{card.description}</p>
                    </div>

                    <div className={cn("mt-6 flex items-center font-medium opacity-80 transition-opacity group-hover:opacity-100", card.color)}>
                        <span className="mr-2 text-sm">Acessar</span>
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                </Link>
            ))}
        </div>
    );
}
