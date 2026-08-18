"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const WHATSAPP_LINK =
  "https://wa.me/972585360510?text=Bonjour%2C%20je%20souhaite%20conna%C3%AEtre%20vos%20prochaines%20disponibilit%C3%A9s%20pour%20un%20rendez-vous.";

export default function SiteHeader() {
  const [open, setOpen] = useState(false);

  const close = () => setOpen(false);

  // Bloque le scroll arrière-plan quand le menu mobile est ouvert
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.body.style.overflow = open ? "hidden" : "";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <header className="border-b bg-white/80 backdrop-blur sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-2">
        <Link href="/" className="text-sm sm:text-base font-semibold tracking-tight whitespace-nowrap">
          <span className="sm:hidden">Conseiller conjugal</span>
          <span className="hidden sm:inline">Conseiller conjugal Israël</span>
        </Link>

        {/* NAV desktop */}
        <nav className="hidden md:flex items-center justify-end space-x-4">
          <a
            href="/tarifs"
            className="text-sm text-gray-700 hover:underline whitespace-nowrap"
          >
            Tarifs
          </a>

          <a
            href="/preparation-au-mariage"
            className="text-sm text-gray-700 hover:underline whitespace-nowrap"
          >
            Préparation au mariage
          </a>

          <a
            href="/qui-sommes-nous"
            className="text-sm text-gray-700 hover:underline whitespace-nowrap"
          >
            Qui suis-je
          </a>

          <a
            href="/contact"
            className="text-sm text-gray-700 hover:underline whitespace-nowrap"
          >
            Contact
          </a>

          <a
            href={WHATSAPP_LINK}
            className="rounded-md bg-black text-white px-4 py-2 text-sm font-medium whitespace-nowrap"
          >
            Prendre RDV
          </a>
        </nav>

        {/* NAV mobile */}
        <div className="md:hidden flex items-center gap-2">
          <a
            href={WHATSAPP_LINK}
            className="rounded-md bg-black text-white px-3 py-2 text-sm font-medium whitespace-nowrap"
          >
            RDV
          </a>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={open}
            aria-controls="mobile-navigation"
            className="rounded-md border px-3 py-2 text-sm font-medium bg-white"
          >
            {open ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* MENU MOBILE déroulant */}
      {open && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/30 z-40"
            onClick={close}
            aria-hidden="true"
          />

          {/* Drawer */}
          <nav
            id="mobile-navigation"
            aria-label="Navigation mobile"
            className="fixed top-[64px] left-0 right-0 z-50 bg-white border-b"
          >
            <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col gap-3">
              <a
                href="/tarifs"
                onClick={close}
                className="text-base text-gray-800 hover:underline"
              >
                Tarifs
              </a>

              <a
                href="/preparation-au-mariage"
                onClick={close}
                className="text-base text-gray-800 hover:underline"
              >
                Préparation au mariage
              </a>

              <a
                href="/qui-sommes-nous"
                onClick={close}
                className="text-base text-gray-800 hover:underline"
              >
                Qui suis-je
              </a>

              <a
                href="/contact"
                onClick={close}
                className="text-base text-gray-800 hover:underline"
              >
                Contact
              </a>

              <a
                href={WHATSAPP_LINK}
                onClick={close}
                className="mt-2 inline-flex items-center justify-center rounded-md bg-green-700 text-white px-4 py-3 text-sm font-medium hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-700/30"
              >
                Écrire sur WhatsApp
              </a>
            </div>
          </nav>
        </>
      )}
    </header>
  );
}
