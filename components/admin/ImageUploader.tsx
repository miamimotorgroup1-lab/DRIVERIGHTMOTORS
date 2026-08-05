"use client";

import { ChevronDown, ChevronUp, ImagePlus, Star, Trash2 } from "lucide-react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from "react";
import CarImage from "@/components/ui/CarImage";
import CropModal from "@/components/admin/CropModal";

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

type ImagesUpdater = string[] | ((prev: string[]) => string[]);

type ImageUploaderProps = {
  images: string[];
  // Accepts a functional updater (like setState) rather than a plain array
  // — uploads resolve asynchronously, and when two are in flight at once
  // (e.g. a multi-file drop), each one's success callback must apply against
  // the *latest* array, not the `images` prop it closed over when the
  // upload started. A plain-value onChange caused exactly that: whichever
  // upload's callback ran last would silently overwrite the other's URL,
  // even though both files uploaded fine to Storage.
  onChange: (update: ImagesUpdater) => void;
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
// Takes the CROPPED blob (from CropModal), not the original file — `name`
// is only carried along for the uploads-in-progress list in the UI; the
// server derives the extension from the blob's own content type.
function uploadWithProgress(
  blob: Blob,
  name: string,
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
    formData.append("file", blob, name);
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

  // Files that passed validation and are waiting to be framed. cropQueue[0]
  // is always the one currently shown in CropModal — "advancing" is just
  // shifting the array, so there's only ever one crop step on screen even
  // when several files were dropped at once.
  const [cropQueue, setCropQueue] = useState<File[]>([]);
  const activeCropFile = cropQueue[0] ?? null;

  // Derived, not stored — creating the object URL belongs in render (it's a
  // pure function of activeCropFile), revoking it is the one real side
  // effect and lives in a cleanup-only effect below.
  const cropImageUrl = useMemo(
    () => (activeCropFile ? URL.createObjectURL(activeCropFile) : null),
    [activeCropFile],
  );

  useEffect(() => {
    return () => {
      if (cropImageUrl) URL.revokeObjectURL(cropImageUrl);
    };
  }, [cropImageUrl]);

  function startUpload(blob: Blob, name: string) {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setUploads((prev) => [...prev, { id, name, progress: 0, status: "uploading" }]);

    uploadWithProgress(blob, name, (progress) => {
      setUploads((prev) =>
        prev.map((item) => (item.id === id ? { ...item, progress } : item)),
      );
    })
      .then((url) => {
        setUploads((prev) => prev.filter((item) => item.id !== id));
        onChange((prev) => [...prev, url]);
      })
      .catch((err: Error) => {
        setUploads((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, status: "error", error: err.message } : item,
          ),
        );
      });
  }

  // Type/size are checked on the ORIGINAL file, before it ever reaches the
  // cropper — an oversized or wrong-type file shouldn't cost the user a
  // crop step before being rejected.
  function handleFiles(files: FileList | File[]) {
    const queued: File[] = [];
    for (const file of Array.from(files)) {
      const validationError = validateFile(file);
      if (validationError) {
        const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
        setUploads((prev) => [
          ...prev,
          { id, name: file.name, progress: 0, status: "error", error: validationError },
        ]);
        continue;
      }
      queued.push(file);
    }
    if (queued.length > 0) {
      setCropQueue((prev) => [...prev, ...queued]);
    }
  }

  function handleCropConfirm(blob: Blob) {
    if (!activeCropFile) return;
    startUpload(blob, activeCropFile.name);
    setCropQueue((prev) => prev.slice(1));
  }

  function handleCropCancel() {
    setCropQueue((prev) => prev.slice(1));
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
    // `index` is the position the user sees right now (the `images` prop);
    // the removal itself is applied by value against the latest array, in
    // case an in-flight upload's functional update lands between the click
    // and this running.
    const url = images[index];
    onChange((prev) => prev.filter((item) => item !== url));
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
    // Same reasoning as removeImage: swap by value against the latest array
    // rather than assuming `images` (this render's prop) is still current.
    const a = images[index];
    const b = images[target];
    onChange((prev) => {
      const ai = prev.indexOf(a);
      const bi = prev.indexOf(b);
      if (ai === -1 || bi === -1) return prev;
      const next = [...prev];
      [next[ai], next[bi]] = [next[bi], next[ai]];
      return next;
    });
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

      {activeCropFile && cropImageUrl && (
        <CropModal
          key={cropImageUrl}
          imageSrc={cropImageUrl}
          fileName={activeCropFile.name}
          onConfirm={handleCropConfirm}
          onCancel={handleCropCancel}
        />
      )}
    </div>
  );
}
