import Link from "next/link";
import { Calendar, Store, Tag, ChevronRight } from "lucide-react";
import { Warranty, getWarrantyStatus, getDaysRemaining } from "@/types/warranty";
import { formatDate, STATUS_LABELS, STATUS_COLORS, STATUS_DOT, CATEGORY_ICONS } from "@/lib/utils";

export default function WarrantyCard({ warranty }: { warranty: Warranty }) {
  const status = getWarrantyStatus(warranty.expiry_date);
  const daysRemaining = getDaysRemaining(warranty.expiry_date);

  return (
    <Link href={`/garantias/${warranty.id}`}>
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-lg hover:-translate-y-0.5 hover:border-indigo-200 transition-all group cursor-pointer">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{CATEGORY_ICONS[warranty.category] ?? "📦"}</span>
            <div>
              <h3 className="font-semibold text-gray-900 group-hover:text-indigo-700 transition-colors">
                {warranty.name}
              </h3>
              {(warranty.brand || warranty.model) && (
                <p className="text-sm text-gray-500">
                  {[warranty.brand, warranty.model].filter(Boolean).join(" · ")}
                </p>
              )}
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-indigo-500 transition-colors mt-0.5 shrink-0" />
        </div>

        <div className="flex flex-wrap gap-2 mb-3">
          <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[status]}`}>
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${STATUS_DOT[status]}`} />
            {STATUS_LABELS[status]}
          </span>
          <span className="inline-flex items-center text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
            <Tag className="w-3 h-3 mr-1" />
            {warranty.category}
          </span>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Calendar className="w-3.5 h-3.5" />
            <span>Vence: <span className="font-medium text-gray-700">{formatDate(warranty.expiry_date)}</span></span>
          </div>
          {warranty.store && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Store className="w-3.5 h-3.5" />
              <span>{warranty.store}</span>
            </div>
          )}
        </div>

        <div className="mt-3 pt-3 border-t border-gray-100">
          {daysRemaining >= 0 ? (
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">
                {status === "expired"
                  ? `🔴 Vence en ${daysRemaining} día${daysRemaining !== 1 ? "s" : ""}`
                  : status === "expiring"
                  ? `⚠️ Vence en ${daysRemaining} día${daysRemaining !== 1 ? "s" : ""}`
                  : `${daysRemaining} días restantes`}
              </span>
              <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    status === "expired" ? "bg-red-400" :
                    status === "expiring" ? "bg-amber-400" : "bg-emerald-400"
                  }`}
                  style={{ width: `${Math.min(100, Math.max(5, (daysRemaining / (warranty.warranty_months * 30)) * 100))}%` }}
                />
              </div>
            </div>
          ) : (
            <p className="text-xs text-red-500">Venció hace {Math.abs(daysRemaining)} día{Math.abs(daysRemaining) !== 1 ? "s" : ""}</p>
          )}
        </div>
      </div>
    </Link>
  );
}
