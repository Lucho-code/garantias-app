"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, X } from "lucide-react";

type ToastType = "success" | "error";

interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

let listeners: Array<(t: Omit<ToastItem, "id">) => void> = [];

export function toast(message: string, type: ToastType = "success") {
  listeners.forEach((fn) => fn({ message, type }));
}

export function Toaster() {
  const [items, setItems] = useState<ToastItem[]>([]);

  useEffect(() => {
    const listener = (t: Omit<ToastItem, "id">) => {
      const id = Date.now();
      setItems((prev) => [...prev, { ...t, id }]);
      setTimeout(() => setItems((prev) => prev.filter((i) => i.id !== id)), 3500);
    };
    listeners.push(listener);
    return () => { listeners = listeners.filter((fn) => fn !== listener); };
  }, []);

  if (items.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {items.map((item) => (
        <div
          key={item.id}
          className={`toast-enter pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border min-w-64 max-w-sm ${
            item.type === "success"
              ? "bg-white dark:bg-gray-900 border-emerald-200 dark:border-emerald-800/60"
              : "bg-white dark:bg-gray-900 border-red-200 dark:border-red-800/60"
          }`}
        >
          {item.type === "success"
            ? <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
            : <XCircle className="w-5 h-5 text-red-500 shrink-0" />
          }
          <span className="text-sm font-medium text-gray-800 dark:text-gray-100 flex-1">
            {item.message}
          </span>
          <button
            onClick={() => setItems((prev) => prev.filter((i) => i.id !== item.id))}
            className="p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
