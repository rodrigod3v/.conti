"use client";

import Link from "next/link";
import { Mail, Lock, Eye, EyeOff, LogIn } from "lucide-react";
import { useState, useActionState } from "react";
import { login, register } from "@/app/actions/auth";

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [isRegister, setIsRegister] = useState(false);

    // Server Actions State
    const [loginState, loginAction] = useActionState(login, null);
    const [registerState, registerAction] = useActionState(register, null);

    return (
        <div className="flex min-h-screen flex-col bg-background-light text-deep-blue dark:bg-background-dark dark:text-white">
            <style dangerouslySetInnerHTML={{
                __html: `
            .geometric-bg {
                background-color: var(--color-background-light);
                background-image: radial-gradient(#d1d5db 0.5px, transparent 0.5px);
                background-size: 24px 24px;
            }
            .dark .geometric-bg {
                background-color: var(--color-background-dark);
                background-image: radial-gradient(#1e293b 0.5px, transparent 0.5px);
            }
            .logo-text {
                letter-spacing: -0.05em;
            }
        `}} />
            <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-[#dbdfe6] bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center gap-2">
                    <div className="logo-text flex items-baseline text-2xl font-extrabold">
                        <span className="text-action-orange">.</span>
                        <span className="text-deep-blue dark:text-white">conti</span>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <Link
                        className="text-sm font-medium transition-colors hover:text-action-orange"
                        href="#"
                    >
                        Ajuda
                    </Link>
                    <Link
                        className="text-sm font-medium transition-colors hover:text-action-orange"
                        href="#"
                    >
                        Contato
                    </Link>
                </div>
            </header>
            <main className="geometric-bg flex flex-1 items-center justify-center px-4 py-12">
                <div className="w-full max-w-[440px] overflow-hidden rounded-xl border border-[#dbdfe6] bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex flex-col items-center pb-8 pt-12">
                        <div className="logo-text mb-4 flex items-baseline text-5xl font-extrabold">
                            <span className="text-action-orange">.</span>
                            <span className="text-deep-blue dark:text-white">conti</span>
                        </div>
                        <h1 className="text-center text-2xl font-bold tracking-tight text-deep-blue dark:text-white">
                            Acesse sua conta
                        </h1>
                        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                            Identidade visual para o sistema .conti
                        </p>
                    </div>
                    <form className="space-y-6 px-8 pb-12" action={isRegister ? registerAction : loginAction}>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-bold text-deep-blue dark:text-slate-200">
                                E-mail
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-xl text-slate-400" size={20} />
                                <input
                                    name="email"
                                    className="w-full rounded-lg border border-[#dbdfe6] bg-white py-3.5 pl-10 pr-4 outline-none transition-all focus:border-action-orange focus:ring-2 focus:ring-action-orange/20 dark:border-slate-700 dark:bg-slate-800 placeholder:text-slate-400"
                                    placeholder="nome@empresa.com.br"
                                    type="email"
                                    required
                                />
                            </div>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-bold text-deep-blue dark:text-slate-200">
                                    Senha
                                </label>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-xl text-slate-400" size={20} />
                                <input
                                    name="password"
                                    className="w-full rounded-lg border border-[#dbdfe6] bg-white py-3.5 pl-10 pr-12 outline-none transition-all focus:border-action-orange focus:border-action-orange focus:ring-2 focus:ring-action-orange/20 dark:border-slate-700 dark:bg-slate-800 placeholder:text-slate-400"
                                    placeholder={isRegister ? "Mínimo 6 caracteres" : "Digite sua senha"}
                                    type={showPassword ? "text" : "password"}
                                    required
                                    minLength={isRegister ? 6 : 1}
                                />
                                <button
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-deep-blue dark:hover:text-white"
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        {(loginState as any)?.error && (
                            <div className="rounded-lg bg-red-50 p-3 text-sm font-medium text-red-600 dark:bg-red-900/20">
                                {(loginState as any).error}
                            </div>
                        )}
                        {(registerState as any)?.error && (
                            <div className="rounded-lg bg-red-50 p-3 text-sm font-medium text-red-600 dark:bg-red-900/20">
                                {(registerState as any).error}
                            </div>
                        )}

                        <button
                            className="flex w-full items-center justify-center gap-2 rounded-lg bg-action-orange py-4 font-extrabold text-white shadow-lg shadow-action-orange/20 transition-all hover:bg-[#e67e00] active:scale-[0.98]"
                            type="submit"
                        >
                            <span>{isRegister ? "Criar Conta" : "Entrar"}</span>
                            <LogIn size={20} />
                        </button>
                        <p className="pt-2 text-center text-sm text-slate-600 dark:text-slate-400">
                            {isRegister ? "Já possui conta? " : "Ainda não possui acesso? "}
                            <button
                                type="button"
                                className="font-bold text-action-orange hover:underline"
                                onClick={() => setIsRegister(!isRegister)}
                            >
                                {isRegister ? "Faça login" : "Solicite aqui"}
                            </button>
                        </p>
                    </form>
                </div>
            </main>
            <footer className="border-t border-[#dbdfe6] bg-white px-6 py-6 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex flex-col items-center justify-between gap-4 text-xs font-medium text-slate-500 md:flex-row">
                    <p>© 2024 .conti - Inteligência Contábil. Todos os direitos reservados.</p>
                    <div className="flex gap-6">
                        <Link className="transition-colors hover:text-action-orange" href="#">
                            Termos de Uso
                        </Link>
                        <Link className="transition-colors hover:text-action-orange" href="#">
                            Privacidade
                        </Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
