import { KpiCards } from "@/components/features/kpi-cards";
import { StatusChart } from "@/components/features/status-chart";
import { ActivityChart } from "@/components/features/activity-chart";
import { CasesTable } from "@/components/features/cases-table";
import { Button } from "@/components/ui/button";
import { Calendar, User, Download } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function DashboardPage() {
    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard Contábil</h1>
                    <p className="text-lg text-muted-foreground">
                        Visão geral de desempenho e pendências da equipe.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <Select defaultValue="month">
                        <SelectTrigger className="w-[140px] bg-white dark:bg-card">
                            <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                            <SelectValue placeholder="Periodo" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="month">Este Mês</SelectItem>
                            <SelectItem value="quarter">Este Trimestre</SelectItem>
                            <SelectItem value="year">Este Ano</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select defaultValue="all">
                        <SelectTrigger className="w-[180px] bg-white dark:bg-card">
                            <User className="mr-2 h-4 w-4 text-muted-foreground" />
                            <SelectValue placeholder="Responsável" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos Responsáveis</SelectItem>
                            <SelectItem value="ana">Ana</SelectItem>
                            <SelectItem value="carlos">Carlos</SelectItem>
                        </SelectContent>
                    </Select>

                    <Button variant="outline" className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 border-emerald-200">
                        <Download className="mr-2 h-4 w-4" />
                        Exportar
                    </Button>
                </div>
            </div>

            <KpiCards />

            <div className="grid gap-4 md:grid-cols-3">
                <ActivityChart />
                <StatusChart />
            </div>

            <CasesTable />
        </div>
    );
}
