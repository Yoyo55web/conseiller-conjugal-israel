"use client";

import { useState } from "react";

export default function CopyLink({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div>
      <span className="text-xs font-semibold text-gray-600">{label}</span>
      <div className="mt-1 flex gap-2">
        <input
          aria-label={label}
          readOnly
          value={value}
          className="min-w-0 flex-1 rounded-lg border bg-gray-50 px-3 py-2 text-sm font-normal"
        />
        <button
          type="button"
          onClick={copy}
          className="rounded-lg border bg-white px-3 py-2 text-sm font-medium"
        >
          {copied ? "Copié" : "Copier"}
        </button>
      </div>
    </div>
  );
}
