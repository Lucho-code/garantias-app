"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { Warranty, getWarrantyStatus } from "@/types/warranty";
import { STATUS_LABELS, formatDate } from "@/lib/utils";

export default function ExportButton({ warranties }: { warranties: Warranty[] }) {
  const [open, setOpen] = useState(false);

  async function exportPDF() {
    setOpen(false);
    const { default: jsPDF } = await import("jspdf");
    const { default: autoTable } = await import("jspdf-autotable");
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.setTextColor(79, 70, 229);
    doc.text("GarantíasApp — Mis Garantías", 14, 20);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generado el ${new Date().toLocaleDateString("es-AR")}`, 14, 28);

    autoTable(doc, {
      startY: 35,
      head: [["Producto", "Categoría", "Marca", "Compra", "Vence", "Estado"]],
      body: warranties.map((w) => [
        w.name,
        w.category,
        w.brand ?? "-",
        formatDate(w.purchase_date),
        formatDate(w.expiry_date),
        STATUS_LABELS[getWarrantyStatus(w.expiry_date)],
      ]),
      headStyles: { fillColor: [79, 70, 229] },
      alternateRowStyles: { fillColor: [245, 247, 255] },
      styles: { fontSize: 9 },
    });

    doc.save("garantias.pdf");
  }

  async function exportExcel() {
    setOpen(false);
    const XLSX = await import("xlsx");
    const data = warranties.map((w) => ({
      Producto: w.name,
      Categoría: w.category,
      Marca: w.brand ?? "",
      Modelo: w.model ?? "",
      Tienda: w.store ?? "",
      Precio: w.price ?? "",
      "Fecha de compra": w.purchase_date,
      "Meses de garantía": w.warranty_months,
      "Fecha de vencimiento": w.expiry_date,
      Estado: STATUS_LABELS[getWarrantyStatus(w.expiry_date)],
      Notas: w.notes ?? "",
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Garantías");
    XLSX.writeFile(wb, "garantias.xlsx");
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
      >
        <Download className="w-4 h-4" />
        Exportar
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-1 w-40 bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden">
            <button
              onClick={exportPDF}
              className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              📄 Exportar PDF
            </button>
            <button
              onClick={exportExcel}
              className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              📊 Exportar Excel
            </button>
          </div>
        </>
      )}
    </div>
  );
}
