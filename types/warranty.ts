export type Category =
  | "Electrodomésticos"
  | "Electrónica"
  | "Vehículos"
  | "Herramientas"
  | "Muebles"
  | "Informática"
  | "Otros";

export const CATEGORIES: Category[] = [
  "Electrodomésticos",
  "Electrónica",
  "Vehículos",
  "Herramientas",
  "Muebles",
  "Informática",
  "Otros",
];

export interface Warranty {
  id: string;
  user_id: string;
  name: string;
  brand: string | null;
  model: string | null;
  category: Category;
  store: string | null;
  price: number | null;
  purchase_date: string;
  warranty_months: number;
  expiry_date: string;
  notes: string | null;
  receipt_url: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export type WarrantyInsert = Omit<Warranty, "id" | "user_id" | "created_at" | "updated_at">;
export type WarrantyUpdate = Partial<WarrantyInsert>;

export type WarrantyStatus = "active" | "expiring" | "expired";

export function getWarrantyStatus(expiry_date: string): WarrantyStatus {
  const today = new Date();
  const expiry = new Date(expiry_date);
  const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return "expired";
  if (diffDays <= 30) return "expiring";
  return "active";
}

export function getDaysRemaining(expiry_date: string): number {
  const today = new Date();
  const expiry = new Date(expiry_date);
  return Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}
