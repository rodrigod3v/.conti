"use client";

import { useActionState } from "react";
import { updateProfile } from "@/app/actions/auth";
import { User, Calendar } from "lucide-react";

export default function CompleteProfilePage() {
    const [state, action] = useActionState(updateProfile, null);

    return (
        <div className="flex min-h-screen items-center justify-center bg-background-light p-4 dark:bg-background-dark">
            <div className="w-full max-w-[440px] rounded-xl border border-[#dbdfe6] bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900">
                <div className="flex flex-col items-center pb-8">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 text-3xl font-bold text-action-orange">
                        !
                    </div>
                    <h1 className="text-center text-2xl font-bold text-deep-blue dark:text-white">
                        Complete seu Perfil
                    </h1>
                    <p className="mt-2 text-center text-sm text-slate-500">
                        Precisamos de alguns dados antes de continuar.
                    </p>
                </div>

                <form className="space-y-6" action={action}>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-deep-blue dark:text-slate-200">
                            Nome Completo
                        </label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                name="name"
                                type="text"
                                placeholder="Seu nome"
                                className="w-full rounded-lg border border-[#dbdfe6] pl-10 p-3 outline-none focus:ring-2 focus:ring-action-orange/20"
                                required
                                minLength={2}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-deep-blue dark:text-slate-200">
                            Idade
                        </label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                name="age"
                                type="number"
                                placeholder="Sua idade"
                                className="w-full rounded-lg border border-[#dbdfe6] pl-10 p-3 outline-none focus:ring-2 focus:ring-action-orange/20"
                                required
                                min={18}
                            />
                        </div>
                    </div>

                    {(state as any)?.error && (
                        <div className="text-red-500 text-sm font-medium text-center">
                            {(state as any).error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="w-full rounded-lg bg-action-orange py-3 font-bold text-white shadow-lg hover:bg-[#e67e00] active:scale-[0.95] transition-all"
                    >
                        Salvar e Continuar
                    </button>
                </form>
            </div>
        </div>
    );
}
