"use client";

export default function ConfirmActionButton({
  children,
  confirmation,
  tone = "danger",
}: {
  children: React.ReactNode;
  confirmation: string;
  tone?: "danger" | "warning";
}) {
  return (
    <button
      type="submit"
      onClick={(event) => {
        if (!window.confirm(confirmation)) event.preventDefault();
      }}
      className={tone === "danger"
        ? "rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
        : "rounded-lg border border-amber-200 bg-white px-4 py-2 text-sm font-medium text-amber-800 hover:bg-amber-50"}
    >
      {children}
    </button>
  );
}
