import { MainLayout as SidebarLayout } from "@/components/layout/main-layout";
import { getSession } from "@/app/actions/auth";
import { redirect } from "next/navigation";

export default async function MainGroupLayout({ children }: { children: React.ReactNode }) {
    const user = await getSession();

    if (!user) {
        redirect("/login");
    }

    if (!user.name || !user.age) {
        redirect("/complete-profile");
    }

    return (
        <SidebarLayout>
            {children}
        </SidebarLayout>
    );
}
