"use client";

import { useState, useRef, useEffect } from "react";

interface Sugerencia {
  nombre: string;
  categoria: string;
}

const PRODUCTOS: Sugerencia[] = [
  // Electrodomésticos
  { nombre: "Heladera",          categoria: "Electrodomésticos" },
  { nombre: "Freezer",           categoria: "Electrodomésticos" },
  { nombre: "Lavarropas",        categoria: "Electrodomésticos" },
  { nombre: "Secarropas",        categoria: "Electrodomésticos" },
  { nombre: "Lavavajillas",      categoria: "Electrodomésticos" },
  { nombre: "Aire acondicionado",categoria: "Electrodomésticos" },
  { nombre: "Microondas",        categoria: "Electrodomésticos" },
  { nombre: "Horno eléctrico",   categoria: "Electrodomésticos" },
  { nombre: "Cocina",            categoria: "Electrodomésticos" },
  { nombre: "Calefón",           categoria: "Electrodomésticos" },
  { nombre: "Termotanque",       categoria: "Electrodomésticos" },
  { nombre: "Aspiradora",        categoria: "Electrodomésticos" },
  { nombre: "Plancha",           categoria: "Electrodomésticos" },
  { nombre: "Ventilador",        categoria: "Electrodomésticos" },
  { nombre: "Cafetera",          categoria: "Electrodomésticos" },
  { nombre: "Licuadora",         categoria: "Electrodomésticos" },
  { nombre: "Batidora",          categoria: "Electrodomésticos" },
  { nombre: "Tostadora",         categoria: "Electrodomésticos" },
  { nombre: "Pava eléctrica",    categoria: "Electrodomésticos" },
  // Electrónica
  { nombre: "Smart TV",          categoria: "Electrónica" },
  { nombre: "Celular",           categoria: "Electrónica" },
  { nombre: "Tablet",            categoria: "Electrónica" },
  { nombre: "Cámara de fotos",   categoria: "Electrónica" },
  { nombre: "Auriculares",       categoria: "Electrónica" },
  { nombre: "Parlante bluetooth",categoria: "Electrónica" },
  { nombre: "Consola de juegos", categoria: "Electrónica" },
  // Informática
  { nombre: "Notebook",          categoria: "Informática" },
  { nombre: "PC de escritorio",  categoria: "Informática" },
  { nombre: "Monitor",           categoria: "Informática" },
  { nombre: "Impresora",         categoria: "Informática" },
  { nombre: "Router WiFi",       categoria: "Informática" },
  { nombre: "Disco externo",     categoria: "Informática" },
  // Vehículos
  { nombre: "Auto",              categoria: "Vehículos" },
  { nombre: "Moto",              categoria: "Vehículos" },
  { nombre: "Bicicleta eléctrica",categoria: "Vehículos" },
  // Herramientas
  { nombre: "Taladro",           categoria: "Herramientas" },
  { nombre: "Amoladora",         categoria: "Herramientas" },
  { nombre: "Sierra circular",   categoria: "Herramientas" },
  { nombre: "Soldadora",         categoria: "Herramientas" },
];

interface Props {
  value: string;
  onChange: (nombre: string, categoria?: string) => void;
  className?: string;
  placeholder?: string;
  required?: boolean;
}

export default function ProductoCombobox({ value, onChange, className, placeholder, required }: Props) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState(value);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sincronizar si value cambia externamente (modo edición)
  useEffect(() => { setQ(value); }, [value]);

  // Cerrar al click fuera
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const sugerencias = q.trim().length > 0
    ? PRODUCTOS.filter(p => p.nombre.toLowerCase().includes(q.toLowerCase())).slice(0, 7)
    : PRODUCTOS.slice(0, 7);

  const exactMatch = PRODUCTOS.some(p => p.nombre.toLowerCase() === q.trim().toLowerCase());

  function seleccionar(p: Sugerencia) {
    setQ(p.nombre);
    onChange(p.nombre, p.categoria);
    setOpen(false);
    inputRef.current?.blur();
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setQ(val);
    onChange(val);
    setOpen(true);
  }

  return (
    <div className="relative" ref={containerRef}>
      <input
        ref={inputRef}
        value={q}
        required={required}
        onChange={handleChange}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        className={className}
        autoComplete="off"
      />

      {open && (sugerencias.length > 0 || q.trim()) && (
        <div className="absolute top-full left-0 right-0 z-30 mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700/70 rounded-xl shadow-xl overflow-hidden">
          {sugerencias.map((p) => (
            <button
              key={p.nombre}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => seleccionar(p)}
              className="w-full text-left px-4 py-2.5 text-sm flex items-center justify-between gap-3 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
            >
              <span className="text-gray-800 dark:text-gray-200 font-medium">{p.nombre}</span>
              <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">{p.categoria}</span>
            </button>
          ))}

          {q.trim() && !exactMatch && (
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => { onChange(q.trim()); setOpen(false); }}
              className="w-full text-left px-4 py-2.5 text-sm text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors border-t border-gray-100 dark:border-gray-800 flex items-center gap-2"
            >
              <span className="text-indigo-400 dark:text-indigo-500 font-bold">+</span>
              Agregar &ldquo;{q.trim()}&rdquo;
            </button>
          )}
        </div>
      )}
    </div>
  );
}
