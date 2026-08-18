import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page introuvable",
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  return (
    <main className="min-h-[65vh] bg-white px-6 py-24 text-center">
      <p className="text-sm font-semibold text-gray-500">Erreur 404</p>
      <h1 className="mt-3 text-4xl font-bold tracking-tight">Page introuvable</h1>
      <p className="mx-auto mt-4 max-w-xl text-gray-600">
        Cette adresse n’existe pas ou la page a été déplacée.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center justify-center rounded-md bg-gray-900 px-6 py-3 text-sm font-semibold text-white hover:bg-black focus:outline-none focus:ring-2 focus:ring-gray-900/30"
      >
        Retour à l’accueil
      </Link>
    </main>
  );
}
