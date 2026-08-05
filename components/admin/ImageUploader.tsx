"use client";

import { ChevronDown, ChevronUp, ImagePlus, Star, Trash2 } from "lucide-react";
import { useRef, useState, type ChangeEvent, type DragEvent } from "react";
import CarImage from "@/components/ui/CarImage";

const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);

type UploadItem = {
  id: string;
  name: string;
  progress: number;
  status: "uploading" | "error";
  error?: string;
};

type ImageUploaderProps = {
  images: string[];
  onChange: (images: string[]) => void;
  error?: string;
};

function validateFile(file: File): string | null {
  if (!ALLOWED_TYPES.has(file.type)) {
    return "Only JPEG, PNG, WebP, GIF, or AVIF images are allowed.";
  }
  if (file.size > MAX_BYTES) {
    return "Image must be smaller than 10MB.";
  }
  return null;
}

// XHR (not fetch) so we get real upload progress via xhr.upload.onprogress.
function uploadWithProgress(
  file: File,
  onProgress: (percent: number) => void,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/admin/car-images");
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };
    xhr.onload = () => {
      let data: unknown = null;
      try {
        data = JSON.parse(xhr.responseText);
      } catch {
        // handled by the fallback error message below
      }
      if (
        xhr.status >= 200 &&
        xhr.status < 300 &&
        data &&
        typeof data === "object" &&
        "url" in data
      ) {
        resolve(String((data as { url: unknown }).url));
        return;
      }
      const message =
        data && typeof data === "object" && "error" in data
          ? String((data as { error: unknown }).error)
          : `Upload failed (${xhr.status}).`;
      reject(new Error(message));
    };
    xhr.onerror = () => reject(new Error("Network error during upload."));
    const formData = new FormData();
    formData.append("file", file);
    xhr.send(formData);
  });
}

export default function ImageUploader({
  images,
  onChange,
  error,
}: ImageUploaderProps) {
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFiles(files: FileList | File[]) {
    for (const file of Array.from(files)) {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const validationError = validateFile(file);

      if (validationError) {
        setUploads((prev) => [
          ...prev,
          { id, name: file.name, progress: 0, status: "error", error: validationError },
        ]);
        continue;
      }

      setUploads((prev) => [
        ...prev,
        { id, name: file.name, progress: 0, status: "uploading" },
      ]);

      uploadWithProgress(file, (progress) => {
        setUploads((prev) =>
          prev.map((item) => (item.id === id ? { ...item, progress } : item)),
        );
      })
        .then((url) => {
          setUploads((prev) => prev.filter((item) => item.id !== id));
          onChange([...images, url]);
        })
        .catch((err: Error) => {
          setUploads((prev) =>
            prev.map((item) =>
              item.id === id ? { ...item, status: "error", error: err.message } : item,
            ),
          );
        });
    }
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragOver(false);
    if (event.dataTransfer.files?.length) handleFiles(event.dataTransfer.files);
  }

  function onInputChange(event: ChangeEvent<HTMLInputElement>) {
    if (event.target.files?.length) handleFiles(event.target.files);
    event.target.value = "";
  }

  async function removeImage(index: number) {
    const url = images[index];
    onChange(images.filter((_, i) => i !== index));
    try {
      await fetch("/api/admin/car-images", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
    } catch (err) {
      // Best-effort cleanup — the image is already gone from the car's
      // list either way, so a Storage-delete failure isn't shown to the user.
      console.error("Failed to delete Storage object:", err);
    }
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= images.length) return;
    const next = [...images];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  return (
    <div className="space-y-4">
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            inputRef.current?.click();
          }
        }}
        className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-card border border-dashed px-6 py-10 text-center transition-colors duration-300 ${
          dragOver ? "border-accent bg-elevated" : "border-hairline hover:border-accent"
        }`}
      >
        <ImagePlus size={22} className="text-muted" />
        <p className="text-sm text-text">Drop images here, or click to select</p>
        <p className="text-xs text-muted">
          JPEG, PNG, WebP, GIF, or AVIF — up to 10MB each. Web-sized images
          load fastest.
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={onInputChange}
          className="hidden"
        />
      </div>

      {uploads.length > 0 && (
        <ul className="space-y-2">
          {uploads.map((item) => (
            <li
              key={item.id}
              className="rounded-card border border-hairline bg-elevated px-3 py-2 text-sm"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="min-w-0 truncate text-text">{item.name}</span>
                {item.status === "uploading" ? (
                  <span className="shrink-0 text-xs text-muted">{item.progress}%</span>
                ) : (
                  <button
                    type="button"
                    onClick={() =>
                      setUploads((prev) => prev.filter((upload) => upload.id !== item.id))
                    }
                    className="shrink-0 text-xs text-red-400 transition-colors duration-300 hover:text-red-300"
                  >
                    Dismiss
                  </button>
                )}
              </div>
              {item.status === "uploading" ? (
                <div className="mt-2 h-1 w-full overflow-hidden rounded-pill bg-hairline">
                  <div
                    className="h-full bg-accent transition-[width] duration-300"
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
              ) : (
                <p className="mt-1 text-xs text-red-400">{item.error}</p>
              )}
            </li>
          ))}
        </ul>
      )}

      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {images.map((src, index) => (
            <div
              key={`${src}-${index}`}
              className={`relative overflow-hidden rounded-card border ${
                index === 0 ? "border-accent" : "border-hairline"
              }`}
            >
              <div className="relative aspect-[4/3] bg-elevated">
                <CarImage
                  src={src}
                  alt={`Image ${index + 1}`}
                  fallbackLabel="Image"
                  hasImage
                  sizes="200px"
                  className="object-cover"
                />
              </div>

              {index === 0 && (
                <span className="absolute left-2 top-2 flex items-center gap-1 rounded-pill bg-accent px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-bg">
                  <Star size={10} fill="currentColor" />
                  Primary
                </span>
              )}

              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-bg/80 px-2 py-1.5 backdrop-blur">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => move(index, -1)}
                    disabled={index === 0}
                    aria-label="Move earlier"
                    className="text-muted transition-colors duration-300 hover:text-text disabled:opacity-30"
                  >
                    <ChevronUp size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(index, 1)}
                    disabled={index === images.length - 1}
                    aria-label="Move later"
                    className="text-muted transition-colors duration-300 hover:text-text disabled:opacity-30"
                  >
                    <ChevronDown size={14} />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  aria-label="Remove image"
                  className="text-muted transition-colors duration-300 hover:text-red-400"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
