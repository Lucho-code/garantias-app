import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import WarrantyCard from "@/components/WarrantyCard";
import { Warranty, getWarrantyStatus } from "@/types/warranty";
import { ShieldCheck, AlertTriangle, XCircle, Plus } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: warranties } = await supabase
    .from("warranties")
    .select("*")
    .order("expiry_date", { ascending: true });

  const all = (warranties ?? []) as Warranty[];
  const active = all.filter((w) => getWarrantyStatus(w.expiry_date) === "active");
  const expiring = all.filter((w) => getWarrantyStatus(w.expiry_date) === "expiring");
  const expired = all.filter((w) => getWarrantyStatus(w.expiry_date) === "expired");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Panel de garantías</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Resumen de todas tus garantías registradas</p>
      </div>

      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700/50 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 shadow-sm relative overflow-hidden transition-colors duration-200">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-emerald-500 rounded-t-xl" />
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-100 dark:bg-emerald-900/40 rounded-xl flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Vigentes</p>
            <p className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-gray-50">{active.length}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700/50 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 shadow-sm relative overflow-hidden transition-colors duration-200">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-amber-500 rounded-t-xl" />
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-100 dark:bg-amber-900/40 rounded-xl flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Por vencer</p>
            <p className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-gray-50">{expiring.length}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700/50 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 shadow-sm relative overflow-hidden transition-colors duration-200">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-red-500 rounded-t-xl" />
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 dark:bg-red-900/40 rounded-xl flex items-center justify-center shrink-0">
            <XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-500 dark:text-red-400" />
          </div>
          <div>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Críticas</p>
            <p className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-gray-50">{expired.length}</p>
          </div>
        </div>
      </div>

      {expiring.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Próximas a vencer
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {expiring.map((w) => <WarrantyCard key={w.id} warranty={w} />)}
          </div>
        </section>
      )}

      {active.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">Garantías vigentes</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {active.slice(0, 6).map((w) => <WarrantyCard key={w.id} warranty={w} />)}
          </div>
          {active.length > 6 && (
            <Link href="/garantias" className="inline-block mt-4 text-sm text-violet-600 dark:text-violet-400 hover:underline">
              Ver todas ({active.length}) →
            </Link>
          )}
        </section>
      )}

      {all.length === 0 && (
        <div className="bg-white dark:bg-gray-900 border border-dashed border-gray-300 dark:border-gray-700 rounded-2xl px-6 py-14 text-center transition-colors duration-200">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-violet-50 dark:bg-violet-900/30 rounded-2xl mb-5">
            <ShieldCheck className="w-8 h-8 text-violet-500 dark:text-violet-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
            Registrá tu primera garantía
          </h3>
          <p className="text-gray-400 dark:text-gray-500 text-sm max-w-xs mx-auto mb-7">
            Guardá la fecha de compra y los meses de garantía. Te avisamos antes de que venza.
          </p>
          <Link
            href="/garantias/nueva"
            className="inline-flex items-center gap-2 bg-gradient-to-br from-violet-500 to-violet-700 hover:opacity-90 text-white font-medium px-6 py-3 rounded-xl transition-all shadow-sm shadow-violet-200 dark:shadow-violet-900/50"
          >
            <Plus className="w-4 h-4" />
            Agregar garantía
          </Link>
        </div>
      )}
    </div>
  );
}
