import type { Metadata } from "next";
import "./globals.css";
import SiteHeader from "./_components/SiteHeader";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.conseiller-conjugal-israel.com"),
  title: {
    default: "Conseiller conjugal en Israël – Netanya & visio",
    template: "%s | Conseiller conjugal Israël",
  },
  description:
    "Accompagnement conjugal professionnel : communication, conflits, confiance et préparation au mariage. Visio / présentiel. Public francophone en Israël.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="bg-white text-black">
        <a
          href="#main-content"
          className="sr-only fixed left-4 top-4 z-[100] rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow focus:not-sr-only"
        >
          Aller au contenu principal
        </a>
        <SiteHeader />
        <div id="main-content" tabIndex={-1}>
          {children}
        </div>
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
                Qui suis-je
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
