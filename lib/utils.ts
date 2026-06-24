import { format, parseISO, addMonths } from "date-fns";
import { es } from "date-fns/locale";
import { WarrantyStatus } from "@/types/warranty";

export function formatDate(dateStr: string): string {
  return format(parseISO(dateStr), "d 'de' MMMM, yyyy", { locale: es });
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function calcExpiryDate(purchaseDate: string, months: number): string {
  return format(addMonths(parseISO(purchaseDate), months), "yyyy-MM-dd");
}

export const STATUS_LABELS: Record<WarrantyStatus, string> = {
  active: "Vigente",
  expiring: "Por vencer",
  expired: "Crítica",
};

export const STATUS_COLORS: Record<WarrantyStatus, string> = {
  active: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  expiring: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  expired: "bg-red-50 text-red-700 ring-1 ring-red-200",
};

export const STATUS_DOT: Record<WarrantyStatus, string> = {
  active: "bg-emerald-500",
  expiring: "bg-amber-500",
  expired: "bg-red-500",
};

export const CATEGORY_ICONS: Record<string, string> = {
  "Electrodomésticos": "🏠",
  "Electrónica": "📱",
  "Vehículos": "🚗",
  "Herramientas": "🔧",
  "Muebles": "🪑",
  "Informática": "💻",
  "Otros": "📦",
};
