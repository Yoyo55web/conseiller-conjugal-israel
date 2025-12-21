"use client";

import { useEffect, useState } from "react";

const WHATSAPP_LINK =
  "https://wa.me/972585360510?text=Bonjour%2C%20je%20souhaite%20prendre%20rendez-vous%20pour%20un%20accompagnement%20conjugal.%20Voici%20ma%20situation%20en%202-3%20phrases%20%3A%20";

function track(eventName: string, params?: Record<string, any>) {
  if (typeof window === "undefined") return;

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: eventName,
    ...params,
  });
}


export default function SiteHeader() {
  const [open, setOpen] = useState(false);

  const close = () => setOpen(false);

  // Bloque le scroll arrière-plan quand le menu mobile est ouvert
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="border-b bg-white/80 backdrop-blur sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <a href="/" className="font-semibold tracking-tight whitespace-nowrap">
          Conseiller Conjugal Israël
        </a>

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
            Qui sommes-nous
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
            onClick={(e) => {
              e.preventDefault();
              track("lead_whatsapp_click", {
                placement: "header_desktop_prendre_rdv",
                page: "global",
              });
              setTimeout(() => {
                window.location.href = WHATSAPP_LINK;
              }, 150);
            }}
          >
            Prendre RDV
          </a>
        </nav>

        {/* NAV mobile */}
        <div className="md:hidden flex items-center gap-2">
          <a
            href={WHATSAPP_LINK}
            className="rounded-md bg-black text-white px-3 py-2 text-sm font-medium whitespace-nowrap"
            onClick={(e) => {
              e.preventDefault();
              track("lead_whatsapp_click", {
                placement: "header_mobile_rdv",
                page: "global",
              });
              setTimeout(() => {
                window.location.href = WHATSAPP_LINK;
              }, 150);
            }}
          >
            RDV
          </a>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
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
          <div className="fixed top-[64px] left-0 right-0 z-50 bg-white border-b">
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
                Qui sommes-nous
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
                onClick={(e) => {
                  e.preventDefault();
                  track("lead_whatsapp_click", {
                    placement: "header_mobile_drawer_whatsapp",
                    page: "global",
                  });
                  close();
                  setTimeout(() => {
                    window.location.href = WHATSAPP_LINK;
                  }, 150);
                }}
                className="mt-2 inline-flex items-center justify-center rounded-md bg-green-600 text-white px-4 py-3 text-sm font-medium"
              >
                Écrire sur WhatsApp
              </a>
            </div>
          </div>
        </>
      )}
    </header>
  );
}
