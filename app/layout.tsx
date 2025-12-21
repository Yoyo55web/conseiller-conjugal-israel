import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import SiteHeader from "./_components/SiteHeader";

export const metadata: Metadata = {
  title: "Conseiller Conjugal Israël – Accompagnement couples et futurs mariés",
  description:
    "Accompagnement conjugal professionnel : communication, conflits, confiance et préparation au mariage. Visio / présentiel. Public francophone en Israël.",
};

const GA_MEASUREMENT_ID = "G-8VTREB87B6";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="bg-white text-black">
        {/* ✅ Google Analytics GA4 — DOIT être dans body (App Router) */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="beforeInteractive"
        />
        <Script id="ga4-init" strategy="beforeInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            window.gtag = gtag;

            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}', {
              anonymize_ip: true,
              send_page_view: true
            });
          `}
        </Script>

        <SiteHeader />

        {/* CONTENU des pages */}
        {children}

        {/* FOOTER global */}
        <footer className="border-t">
          <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col sm:flex-row justify-between gap-4 text-sm text-gray-500">
            <div>© {new Date().getFullYear()} — Conseiller conjugal Israël</div>

            <div className="flex flex-wrap gap-6">
              <a href="/tarifs" className="hover:underline">
                Tarifs
              </a>
              <a href="/preparation-au-mariage" className="hover:underline">
                Préparation au mariage
              </a>
              <a href="/qui-sommes-nous" className="hover:underline">
                Qui sommes-nous
              </a>
              <a href="/mentions-legales" className="hover:underline">
                Mentions légales
              </a>
              <a href="/confidentialite" className="hover:underline">
                Confidentialité
              </a>
              <a href="/contact" className="hover:underline">
                Contact
              </a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
