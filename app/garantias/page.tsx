import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import WarrantyCard from "@/components/WarrantyCard";
import Navbar from "@/components/Navbar";
import { Warranty } from "@/types/warranty";
import { Plus, Search } from "lucide-react";

export default async function GarantiasPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; cat?: string; status?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { q, cat, status } = await searchParams;

  let query = supabase.from("warranties").select("*").order("expiry_date", { ascending: true });
  if (cat) query = query.eq("category", cat);

  const { data } = await query;
  const all = (data ?? []) as Warranty[];

  const filtered = all.filter((w) => {
    const matchQ = !q || [w.name, w.brand, w.model, w.store].some((f) =>
      f?.toLowerCase().includes(q.toLowerCase())
    );
    const matchStatus = !status || (() => {
      const today = new Date();
      const expiry = new Date(w.expiry_date);
      const days = Math.ceil((expiry.getTime() - today.getTime()) / 86400000);
      if (status === "active") return days > 30;
      if (status === "expiring") return days >= 0 && days <= 30;
      if (status === "expired") return days < 0;
      return true;
    })();
    return matchQ && matchStatus;
  });

  const CATEGORIES = ["Electrodomésticos", "Electrónica", "Vehículos", "Herramientas", "Muebles", "Informática", "Otros"];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar email={user.email!} />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mis garantías</h1>
            <p className="text-gray-500 mt-1">{filtered.length} resultado{filtered.length !== 1 ? "s" : ""}</p>
          </div>
          <Link
            href="/garantias/nueva"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2.5 rounded-lg text-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nueva
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <form className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                name="q"
                defaultValue={q}
                placeholder="Buscar por nombre, marca o tienda..."
                className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              />
            </div>
          </form>

          <div className="flex gap-2 flex-wrap">
            {["active", "expiring", "expired"].map((s) => (
              <Link
                key={s}
                href={`/garantias?${new URLSearchParams({ ...(q ? { q } : {}), ...(cat ? { cat } : {}), ...(status !== s ? { status: s } : {}) }).toString()}`}
                className={`px-3 py-2 text-xs font-medium rounded-lg border transition-colors ${
                  status === s
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "bg-white text-gray-600 border-gray-300 hover:border-indigo-400"
                }`}
              >
                {{ active: "Vigentes", expiring: "Por vencer", expired: "Vencidas" }[s]}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex gap-2 flex-wrap mb-6">
          <Link
            href="/garantias"
            className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${!cat ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-gray-600 border-gray-200 hover:border-indigo-400"}`}
          >
            Todas
          </Link>
          {CATEGORIES.map((c) => (
            <Link
              key={c}
              href={`/garantias?${new URLSearchParams({ ...(q ? { q } : {}), ...(status ? { status } : {}), ...(cat !== c ? { cat: c } : {}) }).toString()}`}
              className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${cat === c ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-gray-600 border-gray-200 hover:border-indigo-400"}`}
            >
              {c}
            </Link>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">🔍</div>
            <p className="text-gray-500">No se encontraron garantías con ese filtro.</p>
            <Link href="/garantias" className="text-sm text-indigo-600 hover:underline mt-2 inline-block">
              Limpiar filtros
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((w) => <WarrantyCard key={w.id} warranty={w} />)}
          </div>
        )}
      </main>
    </div>
  );
}
