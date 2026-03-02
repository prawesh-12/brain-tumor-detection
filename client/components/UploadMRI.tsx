"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { cn } from "../lib/utils";

type TumorClass = "glioma" | "meningioma" | "pituitary" | "notumor";

interface PredictionResult {
  predictedClass: TumorClass;
  confidence: number;
}

interface UploadMRIProps {
  compact?: boolean;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:5000";
const CLIENT_ID_STORAGE_KEY = "brainshield_client_id";

const classLabel: Record<TumorClass, string> = {
  glioma: "Glioma",
  meningioma: "Meningioma",
  pituitary: "Pituitary",
  notumor: "No Tumor",
};

const classBadgeVariant: Record<TumorClass, "red" | "yellow" | "blue" | "green"> = {
  glioma: "red",
  meningioma: "yellow",
  pituitary: "blue",
  notumor: "green",
};

interface PredictApiResponse {
  predictedClass: string;
  confidence: number;
  error?: string;
}

function toTumorClass(value: string): TumorClass | null {
  const normalized = value.trim().toLowerCase().replace(" ", "");
  if (normalized === "glioma") return "glioma";
  if (normalized === "meningioma") return "meningioma";
  if (normalized === "pituitary") return "pituitary";
  if (normalized === "notumor") return "notumor";
  return null;
}

function getOrCreateClientId(): string {
  if (typeof window === "undefined") return "server-render";

  const savedId = window.localStorage.getItem(CLIENT_ID_STORAGE_KEY);
  if (savedId) return savedId;

  const newId =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  window.localStorage.setItem(CLIENT_ID_STORAGE_KEY, newId);
  return newId;
}

async function predictMRI(file: File): Promise<PredictionResult> {
  const formData = new FormData();
  formData.append("file", file);

  const clientId = getOrCreateClientId();
  const response = await fetch(`${API_BASE_URL}/api/predict`, {
    method: "POST",
    headers: {
      "X-Client-Id": clientId,
    },
    body: formData,
  });

  let payload: PredictApiResponse;
  try {
    payload = (await response.json()) as PredictApiResponse;
  } catch {
    throw new Error("Backend returned a non-JSON response.");
  }

  if (!response.ok) {
    throw new Error(payload.error || "Prediction request failed.");
  }

  const predictedClass = toTumorClass(payload.predictedClass);
  if (!predictedClass) {
    throw new Error(`Backend returned unsupported class: ${payload.predictedClass}`);
  }

  if (typeof payload.confidence !== "number" || Number.isNaN(payload.confidence)) {
    throw new Error("Backend returned invalid confidence value.");
  }

  return {
    predictedClass,
    confidence: Number(payload.confidence.toFixed(2)),
  };
}

export default function UploadMRI({ compact = false }: UploadMRIProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [file]);

  const acceptedLabel = useMemo(
    () => (file ? `${file.name} selected` : "Drop MRI image here or click to browse"),
    [file],
  );

  const onFileSelect = (selectedFile: File | null) => {
    if (!selectedFile || !selectedFile.type.startsWith("image/")) return;
    setFile(selectedFile);
    setResult(null);
    setErrorMessage(null);
    setIsViewerOpen(false);
  };

  useEffect(() => {
    if (!isViewerOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsViewerOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isViewerOpen]);

  const handlePredict = async () => {
    if (!file) return;

    setIsLoading(true);
    setErrorMessage(null);
    try {
      const prediction = await predictMRI(file);
      setResult(prediction);
    } catch (error) {
      setResult(null);
      setErrorMessage(error instanceof Error ? error.message : "Prediction failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section
      id="upload"
      className={cn(
        "mx-auto grid w-full max-w-[1360px] gap-6 px-4 sm:px-6 lg:grid-cols-2 lg:px-8",
        compact ? "min-h-0 flex-1 py-4" : "py-10",
      )}
    >
      <Card
        className={cn(
          "rounded-3xl border-black/10 bg-white shadow-none",
          compact && "flex h-full min-h-0 flex-col",
        )}
      >
        <CardHeader>
          <CardTitle className="text-2xl text-[#111]">Upload MRI</CardTitle>
          <CardDescription className="text-black/65">
            Drag and drop an MRI scan image for model inference.
          </CardDescription>
        </CardHeader>
        <CardContent className={cn("space-y-4", compact && "flex min-h-0 flex-1 flex-col")}>
          <label
            htmlFor="mri-upload"
            onDragOver={(event) => {
              event.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(event) => {
              event.preventDefault();
              setIsDragging(false);
              onFileSelect(event.dataTransfer.files?.[0] ?? null);
            }}
            className={cn(
              "flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 text-center transition",
              compact ? "min-h-44 flex-1" : "min-h-56",
              isDragging
                ? "border-[#9fcc9f] bg-[#eef8ee]"
                : "border-black/15 bg-[#fafaf7] hover:border-[#9fcc9f] hover:bg-[#f1f8f1]",
            )}
          >
            <input
              id="mri-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => onFileSelect(event.target.files?.[0] ?? null)}
            />
            <p className="text-sm font-medium text-[#111]">{acceptedLabel}</p>
            <p className="mt-2 text-xs uppercase tracking-[0.1em] text-black/55">Accepted: PNG, JPG, JPEG</p>
          </label>

          <Button className="w-full rounded-xl" size="lg" disabled={!file || isLoading} onClick={handlePredict}>
            {isLoading ? "Predicting..." : "Predict"}
          </Button>

          {errorMessage && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{errorMessage}</div>
          )}
        </CardContent>
      </Card>

      <Card
        className={cn(
          "rounded-3xl border-black/10 bg-white shadow-none",
          compact && "flex h-full min-h-0 flex-col",
        )}
      >
        <CardHeader>
          <CardTitle className="text-2xl text-[#111]">Prediction Result</CardTitle>
          <CardDescription className="text-black/65">Model output for the uploaded MRI image.</CardDescription>
        </CardHeader>
        <CardContent className={cn("space-y-5", compact && "flex min-h-0 flex-1 flex-col")}>
          <div className="overflow-hidden rounded-2xl border border-black/10 bg-[#fafaf7]">
            {previewUrl ? (
              <button
                type="button"
                onClick={() => setIsViewerOpen(true)}
                className="block w-full cursor-zoom-in"
                aria-label="Open uploaded MRI image preview"
              >
                <Image
                  src={previewUrl}
                  alt="MRI preview"
                  width={640}
                  height={320}
                  unoptimized
                  className={cn(
                    "w-full bg-[#0f0f0f] object-contain",
                    compact ? "h-44" : "h-56",
                  )}
                />
              </button>
            ) : (
              <div
                className={cn(
                  "flex items-center justify-center text-sm text-black/55",
                  compact ? "h-44" : "h-56",
                )}
              >
                MRI preview will appear here
              </div>
            )}
          </div>

          {result ? (
            <div className="space-y-3 rounded-2xl border border-[#b9dfb9] bg-[#f1faf1] p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-black/65">Predicted class</p>
                <Badge variant={classBadgeVariant[result.predictedClass]}>
                  {classLabel[result.predictedClass]}
                </Badge>
              </div>
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-black/65">Confidence</p>
                <p className="text-lg font-semibold text-[#111]">{result.confidence}%</p>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-black/10 bg-[#fafaf7] p-4 text-sm text-black/55">
              No prediction yet. Upload an image and click Predict.
            </div>
          )}
        </CardContent>
      </Card>

      {isViewerOpen && previewUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
          onClick={() => setIsViewerOpen(false)}
        >
          <button
            type="button"
            onClick={() => setIsViewerOpen(false)}
            className="absolute right-4 top-4 rounded-md border border-white/20 bg-black/40 px-3 py-1 text-sm text-white"
            aria-label="Close image viewer"
          >
            Close
          </button>

          <Image
            src={previewUrl}
            alt="Uploaded MRI full view"
            width={1400}
            height={1000}
            unoptimized
            className="max-h-[88vh] w-auto max-w-[94vw] object-contain"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}
    </section>
  );
}
