import { getSession } from "@/app/actions/auth";
import { redirect } from "next/navigation";

export default async function SetupGroupLayout({ children }: { children: React.ReactNode }) {
    const user = await getSession();

    if (!user) {
        redirect("/login");
    }

    // If profile is already complete, user shouldn't be here (ideally), but we let them edit if they want, 
    // OR we redirect to home. For now, just allow access.

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark">
            {children}
        </div>
    );
}
