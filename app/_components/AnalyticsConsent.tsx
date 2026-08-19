"use client";

import { GoogleAnalytics, sendGAEvent } from "@next/third-parties/google";
import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";

const GA_MEASUREMENT_ID = "G-8VTREB87B6";
const CONSENT_STORAGE_KEY = "cci-analytics-consent-v1";
const CONSENT_CHANGE_EVENT = "cci-analytics-consent-change";

type ConsentValue = "granted" | "denied" | null;
type AnalyticsWindow = Window & {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
};

let inMemoryConsent: ConsentValue = null;

function getConsentSnapshot(): ConsentValue {
  if (typeof window === "undefined") return null;

  try {
    const storedValue = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (storedValue === "granted" || storedValue === "denied") return storedValue;
  } catch {
    return inMemoryConsent;
  }

  return inMemoryConsent;
}

function subscribeToConsent(callback: () => void) {
  window.addEventListener(CONSENT_CHANGE_EVENT, callback);
  return () => window.removeEventListener(CONSENT_CHANGE_EVENT, callback);
}

function persistConsent(value: Exclude<ConsentValue, null>) {
  inMemoryConsent = value;
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, value);
  } catch {
    // Le choix reste valable pour la page en cours si le stockage est indisponible.
  }
  window.dispatchEvent(new Event(CONSENT_CHANGE_EVENT));
}

function updateGoogleConsent(value: Exclude<ConsentValue, null>) {
  const analyticsWindow = window as AnalyticsWindow;
  analyticsWindow.dataLayer = analyticsWindow.dataLayer ?? [];
  analyticsWindow.gtag =
    analyticsWindow.gtag ??
    ((...args: unknown[]) => {
      analyticsWindow.dataLayer?.push(args);
    });

  analyticsWindow.gtag("consent", "default", {
    analytics_storage: "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    wait_for_update: 500,
  });
  analyticsWindow.gtag("consent", "update", {
    analytics_storage: value,
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });
}

function clearAnalyticsCookies() {
  const baseDomain = window.location.hostname.replace(/^www\./, "");
  const analyticsCookieNames = document.cookie
    .split(";")
    .map((cookie) => cookie.trim().split("=")[0])
    .filter((name) => /^(_ga|_gid|_gat)/.test(name));

  for (const name of analyticsCookieNames) {
    document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax`;
    document.cookie = `${name}=; Max-Age=0; Path=/; Domain=.${baseDomain}; SameSite=Lax`;
  }
}

export default function AnalyticsConsent() {
  const pathname = usePathname();
  const previousPathname = useRef(pathname);
  const consent = useSyncExternalStore(
    subscribeToConsent,
    getConsentSnapshot,
    () => null,
  );
  const [isBannerOpen, setIsBannerOpen] = useState(false);

  useEffect(() => {
    if (consent) updateGoogleConsent(consent);
  }, [consent]);

  useEffect(() => {
    if (consent !== "granted") {
      previousPathname.current = pathname;
      return;
    }

    if (previousPathname.current !== pathname) {
      sendGAEvent("event", "page_view", {
        page_path: pathname,
        page_location: window.location.href,
        page_title: document.title,
      });
      previousPathname.current = pathname;
    }
  }, [consent, pathname]);

  useEffect(() => {
    if (consent !== "granted") return;

    const handleTrackedLinkClick = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target : null;
      const link = target?.closest("a");
      const href = link?.getAttribute("href") ?? "";

      if (href.includes("wa.me/")) {
        sendGAEvent("event", "lead_whatsapp_click", {
          channel: "whatsapp",
          page_path: window.location.pathname,
        });
      } else if (href.startsWith("tel:")) {
        sendGAEvent("event", "lead_phone_click", {
          channel: "phone",
          page_path: window.location.pathname,
        });
      } else if (href.startsWith("mailto:")) {
        sendGAEvent("event", "lead_email_click", {
          channel: "email",
          page_path: window.location.pathname,
        });
      }
    };

    document.addEventListener("click", handleTrackedLinkClick);
    return () => document.removeEventListener("click", handleTrackedLinkClick);
  }, [consent]);

  const saveConsent = (value: Exclude<ConsentValue, null>) => {
    updateGoogleConsent(value);
    if (value === "denied") clearAnalyticsCookies();

    persistConsent(value);
    setIsBannerOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsBannerOpen(true)}
        className="text-left hover:underline"
      >
        Gérer mes cookies
      </button>

      {consent === "granted" ? (
        <GoogleAnalytics gaId={GA_MEASUREMENT_ID} />
      ) : null}

      {consent === null || isBannerOpen ? (
        <div className="fixed inset-x-0 bottom-0 z-[100] p-4 sm:p-6">
          <div
            role="dialog"
            aria-label="Préférences de cookies"
            className="mx-auto max-w-4xl rounded-2xl border border-gray-300 bg-white p-5 text-gray-900 shadow-2xl sm:p-6"
          >
            <h2 className="text-lg font-semibold">Mesure d’audience</h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-700">
              Nous utilisons Google Analytics uniquement avec votre accord afin de
              comprendre la fréquentation du site et d’améliorer son contenu. Vous pouvez
              accepter, refuser ou modifier votre choix à tout moment.
            </p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={() => saveConsent("denied")}
                className="inline-flex min-h-11 items-center justify-center rounded-md border border-gray-900 bg-white px-5 py-2.5 text-sm font-semibold text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-900/30"
              >
                Refuser
              </button>
              <button
                type="button"
                onClick={() => saveConsent("granted")}
                className="inline-flex min-h-11 items-center justify-center rounded-md border border-gray-900 bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-black focus:outline-none focus:ring-2 focus:ring-gray-900/30"
              >
                Accepter
              </button>
              <Link
                href="/confidentialite"
                className="inline-flex min-h-11 items-center justify-center px-2 text-sm font-medium underline underline-offset-4"
              >
                En savoir plus
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
