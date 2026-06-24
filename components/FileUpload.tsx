"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Upload, X, FileText, Image, Loader2 } from "lucide-react";

interface Props {
  userId: string;
  warrantyId?: string;
  label: string;
  accept: string;
  currentUrl?: string | null;
  onUpload: (url: string) => void;
}

export default function FileUpload({ userId, warrantyId, label, accept, currentUrl, onUpload }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentUrl ?? null);
  const [error, setError] = useState("");

  const isImage = accept.includes("image");

  async function handleFile(file: File) {
    if (file.size > 10 * 1024 * 1024) { setError("El archivo no puede superar 10 MB."); return; }
    setError("");
    setUploading(true);
    const supabase = createClient();
    const ext = file.name.split(".").pop();
    const path = `${userId}/${warrantyId ?? "temp"}/${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from("warranties").upload(path, file, { upsert: true });
    if (upErr) { setError(upErr.message); setUploading(false); return; }
    const { data } = supabase.storage.from("warranties").getPublicUrl(path);
    setPreview(isImage ? URL.createObjectURL(file) : file.name);
    onUpload(data.publicUrl);
    setUploading(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-gray-300 hover:border-indigo-400 rounded-xl p-4 cursor-pointer transition-colors group"
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
        />

        {uploading ? (
          <div className="flex flex-col items-center py-2 text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin mb-1" />
            <span className="text-xs">Subiendo...</span>
          </div>
        ) : preview ? (
          <div className="flex items-center gap-3">
            {isImage && preview.startsWith("blob:") ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="preview" className="w-14 h-14 object-cover rounded-lg" />
            ) : (
              <div className="w-14 h-14 bg-indigo-50 rounded-lg flex items-center justify-center">
                {isImage ? <Image className="w-6 h-6 text-indigo-400" /> : <FileText className="w-6 h-6 text-indigo-400" />}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-700 truncate">
                {isImage && preview.startsWith("blob:") ? "Foto subida" : preview}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">Clic para cambiar</p>
            </div>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setPreview(null); onUpload(""); }}
              className="p-1 text-gray-400 hover:text-red-500 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center py-2 text-gray-400 group-hover:text-indigo-500 transition-colors">
            <Upload className="w-6 h-6 mb-1" />
            <span className="text-xs text-center">
              Arrastrá un archivo o <span className="text-indigo-600 font-medium">hacé clic</span><br />
              {isImage ? "JPG, PNG, WEBP · máx 10 MB" : "PDF · máx 10 MB"}
            </span>
          </div>
        )}
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
