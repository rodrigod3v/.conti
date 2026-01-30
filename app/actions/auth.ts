"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

const LoginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1)
});

const RegisterSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6)
});

const ProfileSchema = z.object({
    name: z.string().min(2),
    age: z.coerce.number().min(18)
});

export async function login(prevState: any, formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const validated = LoginSchema.safeParse({ email, password });

    if (!validated.success) {
        return { error: "Formato de e-mail ou senha inválidos." };
    }

    try {
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user || user.password !== password) {
            return { error: "Credenciais inválidas." };
        }

        // Set session cookie
        const cookieStore = await cookies();
        cookieStore.set("session_user", user.id, {
            httpOnly: true,
            secure: false, // process.env.NODE_ENV === "production", <--- Fixed for HTTP VM
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: "/",
        });

        // Redirect based on profile completion
        if (!user.name || !user.age) {
            return redirect("/complete-profile");
        }

    } catch (e) {
        if ((e as Error).message.includes("NEXT_REDIRECT")) throw e;
        console.error("Login Check Error:", e); // Log real error
        return { error: "Erro ao realizar login." };
    }

    redirect("/");
}

export async function register(prevState: any, formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const validated = RegisterSchema.safeParse({ email, password });

    if (!validated.success) {
        return { error: "E-mail inválido ou senha muito curta (mín 6 chars)." };
    }

    try {
        const existing = await prisma.user.findUnique({
            where: { email }
        });

        if (existing) {
            return { error: "Usuário já existe." };
        }

        const user = await prisma.user.create({
            data: {
                email,
                password, // NOTE: Storing plain text as requested for "simple system". NOT recommended for production.
            }
        });

        const cookieStore = await cookies();
        cookieStore.set("session_user", user.id, {
            httpOnly: true,
            secure: false, // process.env.NODE_ENV === "production", <--- Fixed for HTTP VM
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: "/",
        });

    } catch (e) {
        if ((e as Error).message.includes("NEXT_REDIRECT")) throw e;
        console.error("Register Check Error:", e); // Log real error
        return { error: "Erro ao registrar usuário." };
    }

    redirect("/complete-profile");
}

export async function logout() {
    const cookieStore = await cookies();
    cookieStore.delete("session_user");
    redirect("/login");
}

export async function updateProfile(prevState: any, formData: FormData) {
    const name = formData.get("name") as string;
    const age = formData.get("age") as string;

    const validated = ProfileSchema.safeParse({ name, age });

    if (!validated.success) {
        return { error: "Nome muito curto ou idade inválida (min 18)." };
    }

    const cookieStore = await cookies();
    const userId = cookieStore.get("session_user")?.value;

    if (!userId) {
        redirect("/login");
    }

    try {
        await prisma.user.update({
            where: { id: userId },
            data: {
                name: validated.data.name,
                age: validated.data.age
            }
        });
    } catch (e) {
        return { error: "Erro ao atualizar perfil." };
    }

    redirect("/");
}

export async function getSession() {
    const cookieStore = await cookies();
    const userId = cookieStore.get("session_user")?.value;

    if (!userId) return null;

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, email: true, name: true, age: true }
        });
        return user;
    } catch {
        return null;
    }
}
