import { KpiCards } from "@/components/features/kpi-cards";
import { StatusChart } from "@/components/features/status-chart";
import { ActivityChart } from "@/components/features/activity-chart";

export default function DashboardPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
                <p className="text-lg text-muted-foreground">
                    Visão geral dos indicadores de desempenho e status dos arquivos.
                </p>
            </div>

            <KpiCards />

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <ActivityChart />
                <StatusChart />
            </div>
        </div>
    );
}
