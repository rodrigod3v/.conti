import { getSession } from "@/app/actions/auth";
import { redirect } from "next/navigation";

export default async function AuthGroupLayout({ children }: { children: React.ReactNode }) {
    const user = await getSession();

    if (user) {
        redirect("/");
    }

    return (
        <>
            {children}
        </>
    );
}
