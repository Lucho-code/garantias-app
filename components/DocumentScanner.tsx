"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Camera, X, RotateCcw, Check, ScanLine, Loader2, FlipHorizontal } from "lucide-react";

interface Props {
  userId: string;
  warrantyId?: string;
  onUpload: (url: string) => void;
  onClose: () => void;
}

type Step = "camera" | "preview" | "uploading" | "done";

export default function DocumentScanner({ userId, warrantyId, onUpload, onClose }: Props) {
  const videoRef   = useRef<HTMLVideoElement>(null);
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const streamRef  = useRef<MediaStream | null>(null);

  const [step, setStep]           = useState<Step>("camera");
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl]     = useState<string | null>(null);
  const [scanMode, setScanMode]         = useState(false);
  const [facing, setFacing]             = useState<"environment" | "user">("environment");
  const [error, setError]               = useState("");
  const [scanning, setScanning]         = useState(false);

  const startCamera = useCallback(async (facingMode: "environment" | "user") => {
    setError("");
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch {
      setError("No se pudo acceder a la cámara. Verificá los permisos del navegador.");
    }
  }, []);

  useEffect(() => {
    startCamera(facing);
    return () => { streamRef.current?.getTracks().forEach((t) => t.stop()); };
  }, [startCamera, facing]);

  function flipCamera() {
    const next = facing === "environment" ? "user" : "environment";
    setFacing(next);
  }

  function applyDocumentFilter(ctx: CanvasRenderingContext2D, w: number, h: number) {
    const imageData = ctx.getImageData(0, 0, w, h);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      const enhanced = Math.min(255, Math.max(0, (gray - 128) * 1.5 + 128 + 30));
      data[i] = data[i + 1] = data[i + 2] = enhanced;
    }
    ctx.putImageData(imageData, 0, 0);
  }

  async function capture() {
    if (!videoRef.current || !canvasRef.current) return;
    setScanning(true);
    await new Promise((r) => setTimeout(r, 200));

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width  = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(video, 0, 0);

    if (scanMode) applyDocumentFilter(ctx, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (!blob) return;
      setCapturedBlob(blob);
      setPreviewUrl(URL.createObjectURL(blob));
      streamRef.current?.getTracks().forEach((t) => t.stop());
      setScanning(false);
      setStep("preview");
    }, "image/jpeg", 0.92);
  }

  function retake() {
    setPreviewUrl(null);
    setCapturedBlob(null);
    setStep("camera");
    startCamera(facing);
  }

  async function upload() {
    if (!capturedBlob) return;
    setStep("uploading");
    const supabase = createClient();
    const path = `${userId}/${warrantyId ?? "temp"}/scan_${Date.now()}.jpg`;
    const { error: upErr } = await supabase.storage.from("warranties").upload(path, capturedBlob, {
      contentType: "image/jpeg",
      upsert: true,
    });
    if (upErr) { setError(upErr.message); setStep("preview"); return; }
    const { data } = supabase.storage.from("warranties").getPublicUrl(path);
    onUpload(data.publicUrl);
    setStep("done");
    setTimeout(onClose, 800);
  }

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-black/80 backdrop-blur">
        <button onClick={onClose} className="p-2 text-white/70 hover:text-white">
          <X className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2 text-white font-medium text-sm">
          <ScanLine className="w-4 h-4 text-violet-400" />
          Escanear documento
        </div>
        {step === "camera" && (
          <button onClick={flipCamera} className="p-2 text-white/70 hover:text-white">
            <FlipHorizontal className="w-5 h-5" />
          </button>
        )}
        {step !== "camera" && <div className="w-9" />}
      </div>

      {/* Main area */}
      <div className="flex-1 relative overflow-hidden">
        {step === "camera" && (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            {/* Document overlay guide */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="relative w-[85%] max-w-sm aspect-[3/4] sm:aspect-[4/3]">
                <div className="absolute inset-0 border-2 border-white/40 rounded-lg" />
                {/* Corner marks */}
                {[
                  "top-0 left-0 border-t-2 border-l-2 rounded-tl-lg",
                  "top-0 right-0 border-t-2 border-r-2 rounded-tr-lg",
                  "bottom-0 left-0 border-b-2 border-l-2 rounded-bl-lg",
                  "bottom-0 right-0 border-b-2 border-r-2 rounded-br-lg",
                ].map((cls, i) => (
                  <div key={i} className={`absolute w-8 h-8 border-white ${cls}`} />
                ))}
                {scanning && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-full h-0.5 bg-violet-400 animate-pulse" />
                  </div>
                )}
              </div>
            </div>
            <p className="absolute bottom-24 inset-x-0 text-center text-white/60 text-xs px-6">
              Encuadrá el documento dentro del recuadro
            </p>
          </>
        )}

        {(step === "preview" || step === "uploading" || step === "done") && previewUrl && (
          <img
            src={previewUrl}
            alt="Documento escaneado"
            className="w-full h-full object-contain bg-black"
          />
        )}

        {step === "done" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <div className="bg-emerald-500 rounded-full p-4">
              <Check className="w-8 h-8 text-white" />
            </div>
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Footer controls */}
      <div className="bg-black/80 backdrop-blur px-6 py-5">
        {error && (
          <p className="text-red-400 text-sm text-center mb-3">{error}</p>
        )}

        {step === "camera" && (
          <div className="flex items-center justify-between">
            {/* Scan mode toggle */}
            <button
              onClick={() => setScanMode(!scanMode)}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors ${
                scanMode ? "bg-violet-600 text-white" : "text-white/50 hover:text-white"
              }`}
            >
              <ScanLine className="w-5 h-5" />
              <span className="text-xs">B&N</span>
            </button>

            {/* Capture button */}
            <button
              onClick={capture}
              disabled={scanning}
              className="w-16 h-16 rounded-full bg-white border-4 border-white/40 hover:scale-105 active:scale-95 transition-transform disabled:opacity-60 flex items-center justify-center"
            >
              {scanning ? (
                <Loader2 className="w-6 h-6 text-gray-800 animate-spin" />
              ) : (
                <Camera className="w-6 h-6 text-gray-800" />
              )}
            </button>

            <div className="w-16" />
          </div>
        )}

        {step === "preview" && (
          <div className="flex gap-3">
            <button
              onClick={retake}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-white/20 text-white text-sm font-medium hover:bg-white/10 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Repetir
            </button>
            <button
              onClick={upload}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium transition-colors"
            >
              <Check className="w-4 h-4" />
              Usar esta foto
            </button>
          </div>
        )}

        {step === "uploading" && (
          <div className="flex items-center justify-center gap-2 text-white py-3">
            <Loader2 className="w-5 h-5 animate-spin text-violet-400" />
            <span className="text-sm">Subiendo documento...</span>
          </div>
        )}
      </div>
    </div>
  );
}
