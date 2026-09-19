import { notFound } from "next/navigation";
import { stripeConfigured, stripePublishableKey } from "@/lib/stripe";
import PaymentSetupForm from "@/app/preparer-rendez-vous/[token]/paiement/PaymentSetupForm";

export const dynamic = "force-dynamic";

export default function StripePreviewCheckPage() {
  if (process.env.VERCEL_ENV !== "preview" || !stripeConfigured()) notFound();

  return (
    <main className="min-h-screen bg-gray-50 px-5 py-12">
      <div className="mx-auto max-w-3xl">
        <p className="text-sm font-semibold text-green-800">Étape 3 sur 3 · contrôle Preview</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">Formule et moyen de paiement</h1>
        <p className="mt-4 leading-relaxed text-gray-700">
          Choisissez votre formule puis enregistrez votre moyen de paiement sur cette même page.
          <strong> Aucun montant ne sera débité avant la première séance.</strong>
        </p>
        <section className="mt-8 rounded-3xl border bg-white p-6 md:p-8">
          <PaymentSetupForm
            token="AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
            defaultEmail=""
            publishableKey={stripePublishableKey()}
          />
        </section>
      </div>
    </main>
  );
}
