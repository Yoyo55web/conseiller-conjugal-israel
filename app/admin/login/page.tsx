import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { isAdminAuthenticated, privateFeaturesConfigured } from "@/lib/admin-auth";
import { loginAction } from "../actions";

export const metadata: Metadata = {
  title: "Connexion privée",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ erreur?: string }>;
}) {
  if (!privateFeaturesConfigured()) notFound();
  if (await isAdminAuthenticated()) redirect("/admin");
  const { erreur } = await searchParams;

  return (
    <main className="min-h-[70vh] bg-gray-50 px-6 py-16">
      <div className="mx-auto max-w-md rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold text-green-800">Espace strictement privé</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Accès conseiller</h1>
        <p className="mt-3 text-sm leading-relaxed text-gray-600">
          Cet espace contient les dossiers préparatoires et les retours des couples.
        </p>
        {erreur ? (
          <p role="alert" className="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-800">
            Mot de passe incorrect.
          </p>
        ) : null}
        <form action={loginAction} className="mt-6 space-y-4">
          <label className="block text-sm font-medium" htmlFor="password">
            Mot de passe
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-green-700 focus:outline-none focus:ring-2 focus:ring-green-700/20"
          />
          <button className="w-full rounded-xl bg-gray-950 px-5 py-3 font-semibold text-white hover:bg-gray-800">
            Se connecter
          </button>
        </form>
      </div>
    </main>
  );
}
