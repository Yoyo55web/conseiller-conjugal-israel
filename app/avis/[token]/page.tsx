import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { findDossierByFeedbackToken } from "@/lib/db";
import FeedbackForm from "./FeedbackForm";

export const metadata: Metadata = {
  title: "Votre retour sur l’accompagnement",
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

export default async function FeedbackPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const dossier = await findDossierByFeedbackToken(token).catch(() => null);
  if (!dossier) notFound();
  return (
    <main className="min-h-[75vh] bg-gray-50 px-5 py-12">
      <div className="mx-auto max-w-2xl">
        <p className="text-sm font-semibold text-green-800">Retour confidentiel</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Votre expérience compte</h1>
        <p className="mt-4 leading-relaxed text-gray-700">Ce questionnaire volontaire prend environ deux minutes. Votre réponse nous aide à améliorer l’accompagnement et reste privée, sauf autorisation explicite de votre part.</p>
        <div className="mt-8"><FeedbackForm token={token} /></div>
      </div>
    </main>
  );
}
