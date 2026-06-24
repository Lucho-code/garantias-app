"use client";

import { useRef, useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Upload, X, FileText, Image, Loader2, ScanLine } from "lucide-react";
import dynamic from "next/dynamic";

const DocumentScanner = dynamic(() => import("@/components/DocumentScanner"), { ssr: false });

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
  const [uploading, setUploading]   = useState(false);
  const [preview, setPreview]       = useState<string | null>(currentUrl ?? null);
  const [error, setError]           = useState("");
  const [scanning, setScanning]     = useState(false);

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

  function handleScanUpload(url: string) {
    setPreview(url);
    onUpload(url);
    setScanning(false);
  }

  const [hasCameraSupport, setHasCameraSupport] = useState(false);
  useEffect(() => {
    setHasCameraSupport(!!navigator.mediaDevices?.getUserMedia);
  }, []);

  return (
    <>
      {scanning && (
        <DocumentScanner
          userId={userId}
          warrantyId={warrantyId}
          onUpload={handleScanUpload}
          onClose={() => setScanning(false)}
        />
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>

        {!preview && !uploading && (
          <div className="flex gap-2">
            {/* Drag & drop / file picker */}
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => inputRef.current?.click()}
              className="flex-1 border-2 border-dashed border-gray-300 hover:border-indigo-400 rounded-xl p-4 cursor-pointer transition-colors group"
            >
              <input
                ref={inputRef}
                type="file"
                accept={accept}
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
              />
              <div className="flex flex-col items-center py-1 text-gray-400 group-hover:text-indigo-500 transition-colors">
                <Upload className="w-5 h-5 mb-1" />
                <span className="text-xs text-center">
                  Arrastrá o <span className="text-indigo-600 font-medium">elegí archivo</span><br />
                  {isImage ? "JPG, PNG, WEBP · máx 10 MB" : "PDF · máx 10 MB"}
                </span>
              </div>
            </div>

            {/* Scan button (only if camera available and accepting images) */}
            {hasCameraSupport && isImage && (
              <button
                type="button"
                onClick={() => setScanning(true)}
                className="flex flex-col items-center justify-center gap-1.5 px-4 border-2 border-dashed border-indigo-300 hover:border-indigo-500 hover:bg-indigo-50 rounded-xl text-indigo-500 hover:text-indigo-700 transition-colors min-w-[80px]"
              >
                <ScanLine className="w-5 h-5" />
                <span className="text-xs font-medium">Escanear</span>
              </button>
            )}
          </div>
        )}

        {uploading && (
          <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 flex flex-col items-center text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin mb-1" />
            <span className="text-xs">Subiendo...</span>
          </div>
        )}

        {preview && !uploading && (
          <div className="flex items-center gap-3 border border-gray-200 rounded-xl p-3">
            {isImage && (preview.startsWith("blob:") || preview.startsWith("http")) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="preview" className="w-14 h-14 object-cover rounded-lg bg-gray-50" />
            ) : (
              <div className="w-14 h-14 bg-indigo-50 rounded-lg flex items-center justify-center">
                {isImage ? <Image className="w-6 h-6 text-indigo-400" /> : <FileText className="w-6 h-6 text-indigo-400" />}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-700 truncate">
                {preview.startsWith("blob:") || preview.startsWith("http") ? "Archivo subido" : preview}
              </p>
              <div className="flex gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="text-xs text-indigo-600 hover:underline"
                >
                  Cambiar archivo
                </button>
                {hasCameraSupport && isImage && (
                  <>
                    <span className="text-gray-300">·</span>
                    <button
                      type="button"
                      onClick={() => setScanning(true)}
                      className="text-xs text-indigo-600 hover:underline flex items-center gap-1"
                    >
                      <ScanLine className="w-3 h-3" /> Escanear
                    </button>
                  </>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={() => { setPreview(null); onUpload(""); }}
              className="p-1.5 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
            >
              <X className="w-4 h-4" />
            </button>
            <input ref={inputRef} type="file" accept={accept} className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
          </div>
        )}

        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </div>
    </>
  );
}
