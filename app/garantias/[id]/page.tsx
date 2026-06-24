import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { Warranty, getWarrantyStatus, getDaysRemaining } from "@/types/warranty";
import { formatDate, formatCurrency, STATUS_LABELS, STATUS_COLORS, CATEGORY_ICONS } from "@/lib/utils";
import {
  ChevronLeft, Pencil, Calendar, Store, Tag, DollarSign,
  FileText, StickyNote, ShieldCheck
} from "lucide-react";

export default async function WarrantyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data } = await supabase.from("warranties").select("*").eq("id", id).eq("user_id", user.id).single();
  if (!data) notFound();

  const warranty = data as Warranty;
  const status = getWarrantyStatus(warranty.expiry_date);
  const daysRemaining = getDaysRemaining(warranty.expiry_date);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar email={user.email!} />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <Link href="/garantias" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
            <ChevronLeft className="w-4 h-4" />
            Volver
          </Link>
          <Link
            href={`/garantias/${id}/editar`}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-2 rounded-lg transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
            Editar
          </Link>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-4">
          <div className="flex items-start gap-4 mb-5">
            <span className="text-4xl">{CATEGORY_ICONS[warranty.category] ?? "📦"}</span>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-gray-900 leading-tight">{warranty.name}</h1>
              {(warranty.brand || warranty.model) && (
                <p className="text-gray-500 mt-0.5">
                  {[warranty.brand, warranty.model].filter(Boolean).join(" · ")}
                </p>
              )}
              <div className="flex gap-2 mt-3">
                <span className={`inline-flex items-center text-sm font-medium px-3 py-1 rounded-full ${STATUS_COLORS[status]}`}>
                  {STATUS_LABELS[status]}
                </span>
              </div>
            </div>
          </div>

          <div className={`rounded-xl p-4 mb-5 ${
            status === "active" ? "bg-emerald-50 border border-emerald-200" :
            status === "expiring" ? "bg-amber-50 border border-amber-200" :
            "bg-red-50 border border-red-200"
          }`}>
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className={`w-5 h-5 ${
                status === "active" ? "text-emerald-600" :
                status === "expiring" ? "text-amber-600" : "text-red-500"
              }`} />
              <span className={`font-semibold ${
                status === "active" ? "text-emerald-800" :
                status === "expiring" ? "text-amber-800" : "text-red-700"
              }`}>
                {status === "expired"
                  ? `Venció hace ${Math.abs(daysRemaining)} días`
                  : status === "expiring"
                  ? `⚠️ Vence en ${daysRemaining} día${daysRemaining !== 1 ? "s" : ""}`
                  : `${daysRemaining} días de garantía restantes`}
              </span>
            </div>
            <p className={`text-sm ${
              status === "active" ? "text-emerald-700" :
              status === "expiring" ? "text-amber-700" : "text-red-600"
            }`}>
              Garantía de {warranty.warranty_months} meses
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Detail icon={<Calendar className="w-4 h-4" />} label="Fecha de compra" value={formatDate(warranty.purchase_date)} />
            <Detail icon={<Calendar className="w-4 h-4" />} label="Vence el" value={formatDate(warranty.expiry_date)} />
            <Detail icon={<Tag className="w-4 h-4" />} label="Categoría" value={warranty.category} />
            {warranty.store && <Detail icon={<Store className="w-4 h-4" />} label="Tienda" value={warranty.store} />}
            {warranty.price && <Detail icon={<DollarSign className="w-4 h-4" />} label="Precio" value={formatCurrency(warranty.price)} />}
          </div>
        </div>

        {warranty.notes && (
          <div className="bg-white border border-gray-200 rounded-xl p-6 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <StickyNote className="w-4 h-4 text-gray-400" />
              <h2 className="font-semibold text-gray-700">Notas</h2>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">{warranty.notes}</p>
          </div>
        )}

        {warranty.receipt_url && (
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4 text-gray-400" />
              <h2 className="font-semibold text-gray-700">Comprobante</h2>
            </div>
            <a
              href={warranty.receipt_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:underline"
            >
              <FileText className="w-4 h-4" />
              Ver comprobante →
            </a>
          </div>
        )}
      </main>
    </div>
  );
}

function Detail({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="text-gray-400 mt-0.5">{icon}</div>
      <div>
        <p className="text-xs text-gray-400 uppercase tracking-wide">{label}</p>
        <p className="text-sm font-medium text-gray-800 mt-0.5">{value}</p>
      </div>
    </div>
  );
}
