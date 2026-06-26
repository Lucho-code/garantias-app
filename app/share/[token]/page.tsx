import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Warranty, getWarrantyStatus, getDaysRemaining } from "@/types/warranty";
import { formatDate, formatCurrency, STATUS_LABELS, STATUS_COLORS, CATEGORY_ICONS } from "@/lib/utils";
import { ShieldCheck, Calendar, Store, Tag, DollarSign, FileText, StickyNote } from "lucide-react";

export default async function SharePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const supabase = await createClient();

  const { data } = await supabase
    .from("warranties")
    .select("*")
    .eq("share_token", token)
    .single();

  if (!data) notFound();

  const warranty = data as Warranty & { share_token: string };
  const status = getWarrantyStatus(warranty.expiry_date);
  const daysRemaining = getDaysRemaining(warranty.expiry_date);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-violet-100 flex items-start justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200 text-sm text-gray-500">
            <ShieldCheck className="w-4 h-4 text-violet-500" />
            Compartido desde <span className="font-semibold text-gray-700">GarantíasApp</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-4">
          <div className="flex items-start gap-4 mb-5">
            <span className="text-4xl">{CATEGORY_ICONS[warranty.category] ?? "📦"}</span>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{warranty.name}</h1>
              {(warranty.brand || warranty.model) && (
                <p className="text-gray-500 mt-0.5">{[warranty.brand, warranty.model].filter(Boolean).join(" · ")}</p>
              )}
              <span className={`inline-flex text-sm font-medium px-3 py-1 rounded-full mt-2 ${STATUS_COLORS[status]}`}>
                {STATUS_LABELS[status]}
              </span>
            </div>
          </div>

          <div className={`rounded-xl p-4 mb-5 ${
            status === "active" ? "bg-emerald-50 border border-emerald-200" :
            status === "expiring" ? "bg-amber-50 border border-amber-200" :
            "bg-red-50 border border-red-200"
          }`}>
            <p className={`font-semibold text-sm ${
              status === "active" ? "text-emerald-800" :
              status === "expiring" ? "text-amber-800" : "text-red-700"
            }`}>
              {status === "expired"
                ? `Venció hace ${Math.abs(daysRemaining)} días`
                : status === "expiring"
                ? `⚠️ Vence en ${daysRemaining} días`
                : `${daysRemaining} días de garantía restantes`}
            </p>
            <p className={`text-xs mt-0.5 ${status === "active" ? "text-emerald-700" : status === "expiring" ? "text-amber-700" : "text-red-600"}`}>
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
          <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <StickyNote className="w-4 h-4 text-gray-400" />
              <p className="font-semibold text-sm text-gray-700">Notas</p>
            </div>
            <p className="text-sm text-gray-600 whitespace-pre-wrap">{warranty.notes}</p>
          </div>
        )}

        {warranty.receipt_url && (
          <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-4">
            <a href={warranty.receipt_url} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-violet-600 hover:underline">
              <FileText className="w-4 h-4" />Ver comprobante →
            </a>
          </div>
        )}

        <p className="text-center text-xs text-gray-400 mt-6">
          Administrá tus garantías en <span className="font-medium">GarantíasApp</span>
        </p>
      </div>
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
