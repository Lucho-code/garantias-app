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
  active: "bg-emerald-100 text-emerald-800",
  expiring: "bg-amber-100 text-amber-800",
  expired: "bg-red-100 text-red-800",
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
