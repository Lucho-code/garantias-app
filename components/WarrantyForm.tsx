"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { CATEGORIES, Warranty, WarrantyInsert } from "@/types/warranty";
import { calcExpiryDate } from "@/lib/utils";
import { Save, Trash2 } from "lucide-react";
import FileUpload from "@/components/FileUpload";
import { toast } from "@/components/Toast";
import ProductoCombobox from "@/components/ProductoCombobox";

interface Props {
  initial?: Warranty & { share_token?: string };
  mode: "create" | "edit";
  userId: string;
}

const EMPTY: Omit<WarrantyInsert, "expiry_date"> = {
  name: "",
  brand: "",
  model: "",
  category: "Electrodomésticos",
  store: "",
  price: null,
  purchase_date: new Date().toISOString().split("T")[0],
  warranty_months: 12,
  notes: "",
  receipt_url: "",
  image_url: "",
};

export default function WarrantyForm({ initial, mode, userId }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<Omit<WarrantyInsert, "expiry_date">>(() =>
    initial
      ? {
          name: initial.name,
          brand: initial.brand ?? "",
          model: initial.model ?? "",
          category: initial.category,
          store: initial.store ?? "",
          price: initial.price,
          purchase_date: initial.purchase_date,
          warranty_months: initial.warranty_months,
          notes: initial.notes ?? "",
          receipt_url: initial.receipt_url ?? "",
          image_url: initial.image_url ?? "",
        }
      : EMPTY
  );
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const expiryDate = calcExpiryDate(form.purchase_date, form.warranty_months);

  function set(field: string, value: string | number | null) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const supabase = createClient();
    const payload: WarrantyInsert = {
      ...form,
      brand: form.brand || null,
      model: form.model || null,
      store: form.store || null,
      notes: form.notes || null,
      receipt_url: form.receipt_url || null,
      image_url: form.image_url || null,
      expiry_date: expiryDate,
    };

    if (mode === "create") {
      const { error } = await supabase.from("warranties").insert(payload);
      if (error) { setError(error.message); setLoading(false); return; }
      toast("Garantía guardada");
      router.push("/garantias");
    } else {
      const { error } = await supabase.from("warranties").update({ ...payload, updated_at: new Date().toISOString() }).eq("id", initial!.id);
      if (error) { setError(error.message); setLoading(false); return; }
      toast("Garantía actualizada");
      router.push(`/garantias/${initial!.id}`);
    }
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm("¿Eliminar esta garantía? Esta acción no se puede deshacer.")) return;
    setDeleting(true);
    const supabase = createClient();
    await supabase.from("warranties").delete().eq("id", initial!.id);
    router.push("/garantias");
    router.refresh();
  }

  const inputCls = "w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent";
  const labelCls = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";
  const cardCls  = "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700/50 rounded-xl p-6 space-y-5 transition-colors duration-200";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className={cardCls}>
        <h2 className="font-semibold text-gray-800 dark:text-gray-100">Información del producto</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className={labelCls}>Nombre del producto <span className="text-red-500">*</span></label>
            <ProductoCombobox
              required
              value={form.name}
              onChange={(nombre, categoria) => {
                set("name", nombre);
                if (categoria) set("category", categoria);
              }}
              className={inputCls}
              placeholder='Ej: Heladera, Smart TV, Notebook…'
            />
          </div>
          <div>
            <label className={labelCls}>Marca</label>
            <input value={form.brand ?? ""} onChange={(e) => set("brand", e.target.value)}
              className={inputCls} placeholder="Ej: Samsung, LG, Fiat" />
          </div>
          <div>
            <label className={labelCls}>Modelo</label>
            <input value={form.model ?? ""} onChange={(e) => set("model", e.target.value)}
              className={inputCls} placeholder="Ej: Galaxy S24, 55QN85B" />
          </div>
          <div>
            <label className={labelCls}>Categoría <span className="text-red-500">*</span></label>
            <select required value={form.category} onChange={(e) => set("category", e.target.value)}
              className={inputCls}>
              {CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Tienda / Vendedor</label>
            <input value={form.store ?? ""} onChange={(e) => set("store", e.target.value)}
              className={inputCls} placeholder="Ej: Frávega, Garbarino, MercadoLibre" />
          </div>
          <div>
            <label className={labelCls}>Precio pagado</label>
            <input type="number" min={0} value={form.price ?? ""}
              onChange={(e) => set("price", e.target.value ? parseFloat(e.target.value) : null)}
              className={inputCls} placeholder="Opcional" />
          </div>
        </div>
      </div>

      <div className={cardCls}>
        <h2 className="font-semibold text-gray-800 dark:text-gray-100">Datos de garantía</h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className={labelCls}>Fecha de compra <span className="text-red-500">*</span></label>
            <input type="date" required value={form.purchase_date}
              onChange={(e) => set("purchase_date", e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Duración (meses) <span className="text-red-500">*</span></label>
            <input type="number" required min={1} max={240} value={form.warranty_months}
              onChange={(e) => set("warranty_months", parseInt(e.target.value))} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Vencimiento calculado</label>
            <div className="px-3 py-2.5 bg-violet-50 dark:bg-violet-900/30 border border-violet-200 dark:border-violet-700/50 rounded-lg text-sm font-medium text-violet-700 dark:text-violet-300">
              {expiryDate}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {[6, 12, 24, 36].map((m) => (
            <button key={m} type="button" onClick={() => set("warranty_months", m)}
              className={`py-1.5 text-sm rounded-lg border transition-colors ${
                form.warranty_months === m
                  ? "bg-violet-600 text-white border-violet-600"
                  : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600 hover:border-violet-400"
              }`}>
              {m} meses
            </button>
          ))}
        </div>
      </div>

      <div className={`${cardCls} !space-y-4`}>
        <h2 className="font-semibold text-gray-800 dark:text-gray-100">Archivos</h2>
        <FileUpload userId={userId} warrantyId={initial?.id}
          label="Foto del producto" accept="image/jpeg,image/png,image/webp,image/heic"
          currentUrl={form.image_url} onUpload={(url) => set("image_url", url)} />
        <FileUpload userId={userId} warrantyId={initial?.id}
          label="Comprobante de compra (foto o PDF)" accept="image/jpeg,image/png,image/webp,application/pdf"
          currentUrl={form.receipt_url} onUpload={(url) => set("receipt_url", url)} />
        <div>
          <label className={labelCls}>Notas adicionales</label>
          <textarea rows={3} value={form.notes ?? ""} onChange={(e) => set("notes", e.target.value)}
            className={`${inputCls} resize-none`}
            placeholder="Número de serie, contacto del servicio técnico, etc." />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-400 text-sm px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between">
        {mode === "edit" && (
          <button type="button" onClick={handleDelete} disabled={deleting}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors disabled:opacity-60">
            <Trash2 className="w-4 h-4" />
            {deleting ? "Eliminando..." : "Eliminar"}
          </button>
        )}
        <div className={`flex gap-3 ${mode === "create" ? "ml-auto" : ""}`}>
          <button type="button" onClick={() => router.back()}
            className="px-4 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
            Cancelar
          </button>
          <button type="submit" disabled={loading}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium bg-gradient-to-br from-violet-500 to-violet-700 hover:opacity-90 text-white rounded-lg transition-all shadow-sm shadow-violet-200 dark:shadow-violet-900/50 disabled:opacity-60">
            <Save className="w-4 h-4" />
            {loading ? "Guardando..." : mode === "create" ? "Guardar garantía" : "Actualizar"}
          </button>
        </div>
      </div>
    </form>
  );
}
