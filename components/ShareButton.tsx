"use client";

import { useState } from "react";
import { Share2, Copy, Check } from "lucide-react";

export default function ShareButton({ shareToken }: { shareToken: string }) {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  const url = `${typeof window !== "undefined" ? window.location.origin : ""}/share/${shareToken}`;

  async function copy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg transition-colors"
      >
        <Share2 className="w-3.5 h-3.5" />
        Compartir
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-xl z-20 p-4">
            <p className="text-sm font-semibold text-gray-800 mb-1">Link público</p>
            <p className="text-xs text-gray-500 mb-3">
              Cualquier persona con este link puede ver los detalles de esta garantía.
            </p>
            <div className="flex gap-2">
              <input
                readOnly
                value={url}
                className="flex-1 text-xs px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-600 min-w-0"
              />
              <button
                onClick={copy}
                className={`shrink-0 inline-flex items-center gap-1 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                  copied ? "bg-emerald-600 text-white" : "bg-violet-600 hover:bg-violet-700 text-white"
                }`}
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "¡Copiado!" : "Copiar"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
