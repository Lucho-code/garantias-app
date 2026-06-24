"use client";

import { useState, useMemo } from "react";
import { LayoutGrid, List, Search } from "lucide-react";
import WarrantyCard from "@/components/WarrantyCard";
import WarrantyRow from "@/components/WarrantyRow";
import ExportButton from "@/components/ExportButton";
import { Warranty, getWarrantyStatus } from "@/types/warranty";

const CATEGORIES = ["Electrodomésticos", "Electrónica", "Vehículos", "Herramientas", "Muebles", "Informática", "Otros"];
const STATUS_OPTIONS = [
  { value: "active", label: "Vigentes" },
  { value: "expiring", label: "Por vencer" },
  { value: "expired", label: "Críticas" },
];

export default function WarrantiesList({ warranties }: { warranties: Warranty[] }) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const [status, setStatus] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");

  const filtered = useMemo(() => {
    return warranties.filter((w) => {
      const matchQ = !q || [w.name, w.brand, w.model, w.store, w.notes]
        .some((f) => f?.toLowerCase().includes(q.toLowerCase()));
      const matchCat = !cat || w.category === cat;
      const matchStatus = !status || getWarrantyStatus(w.expiry_date) === status;
      return matchQ && matchCat && matchStatus;
    });
  }, [warranties, q, cat, status]);

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por nombre, marca, tienda..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
          />
        </div>

        <div className="flex gap-2">
          <ExportButton warranties={filtered} />

          <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-white dark:bg-gray-800">
            <button
              onClick={() => setView("grid")}
              className={`p-2.5 transition-colors ${view === "grid" ? "bg-indigo-600 text-white" : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setView("list")}
              className={`p-2.5 transition-colors ${view === "list" ? "bg-indigo-600 text-white" : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => { setCat(""); setStatus(""); }}
          className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${!cat && !status ? "bg-indigo-600 text-white border-indigo-600" : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-indigo-400"}`}
        >
          Todas ({warranties.length})
        </button>
        {STATUS_OPTIONS.map((s) => (
          <button
            key={s.value}
            onClick={() => setStatus(status === s.value ? "" : s.value)}
            className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${status === s.value ? "bg-indigo-600 text-white border-indigo-600" : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-indigo-400"}`}
          >
            {s.label}
          </button>
        ))}
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCat(cat === c ? "" : c)}
            className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${cat === c ? "bg-indigo-600 text-white border-indigo-600" : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-indigo-400"}`}
          >
            {c}
          </button>
        ))}
      </div>

      <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">{filtered.length} resultado{filtered.length !== 1 ? "s" : ""}</p>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-3">🔍</div>
          <p className="text-gray-500 dark:text-gray-400">No se encontraron garantías.</p>
          <button onClick={() => { setQ(""); setCat(""); setStatus(""); }} className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline mt-2">
            Limpiar filtros
          </button>
        </div>
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((w) => <WarrantyCard key={w.id} warranty={w} />)}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700/50 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700/50">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Producto</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400 hidden sm:table-cell">Categoría</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400 hidden md:table-cell">Vencimiento</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filtered.map((w) => <WarrantyRow key={w.id} warranty={w} />)}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
