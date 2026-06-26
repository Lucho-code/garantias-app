import Link from "next/link";
import { Warranty, getWarrantyStatus } from "@/types/warranty";
import { formatDate, STATUS_LABELS, STATUS_COLORS, CATEGORY_ICONS } from "@/lib/utils";

export default function WarrantyRow({ warranty }: { warranty: Warranty }) {
  const status = getWarrantyStatus(warranty.expiry_date);

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-4 py-3">
        <Link href={`/garantias/${warranty.id}`} className="flex items-center gap-2.5 group">
          <span className="text-lg">{CATEGORY_ICONS[warranty.category] ?? "📦"}</span>
          <div>
            <p className="font-medium text-gray-800 group-hover:text-violet-700 transition-colors">{warranty.name}</p>
            {warranty.brand && <p className="text-xs text-gray-400">{warranty.brand}</p>}
          </div>
        </Link>
      </td>
      <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">{warranty.category}</td>
      <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{formatDate(warranty.expiry_date)}</td>
      <td className="px-4 py-3">
        <span className={`inline-flex text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[status]}`}>
          {STATUS_LABELS[status]}
        </span>
      </td>
    </tr>
  );
}
