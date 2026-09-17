"use client";

import { useId, useState } from "react";

export default function ConfirmActionButton({
  children,
  confirmation,
  tone = "danger",
}: {
  children: React.ReactNode;
  confirmation: string;
  tone?: "danger" | "warning";
}) {
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const titleId = useId();
  const descriptionId = useId();

  const buttonClassName = tone === "danger"
    ? "rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
    : "rounded-lg border border-amber-200 bg-white px-4 py-2 text-sm font-medium text-amber-800 hover:bg-amber-50";

  return (
    <>
      <button
        type="button"
        onClick={() => setConfirmationOpen(true)}
        className={buttonClassName}
      >
        {children}
      </button>
      {confirmationOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setConfirmationOpen(false);
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") setConfirmationOpen(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={descriptionId}
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
          >
            <h2 id={titleId} className="text-lg font-semibold text-gray-950">
              Confirmation requise
            </h2>
            <p id={descriptionId} className="mt-3 text-sm leading-relaxed text-gray-700">
              {confirmation}
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmationOpen(false)}
                className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                className={tone === "danger"
                  ? "rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800"
                  : "rounded-lg bg-amber-700 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-800"}
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
