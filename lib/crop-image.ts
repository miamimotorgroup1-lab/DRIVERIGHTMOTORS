// Pure canvas helper for CropModal — renders the cropped region of an
// <img> src (an object URL, in practice) to a canvas and exports it as a
// JPEG Blob. Browser-only (Image/canvas), but doesn't touch React, so no
// "use client" directive needed — it's fine imported from one.
import type { Area } from "react-easy-crop";

const OUTPUT_TYPE = "image/jpeg";
const OUTPUT_QUALITY = 0.92;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Could not load the image for cropping."));
    image.src = src;
  });
}

export async function getCroppedImageBlob(
  imageSrc: string,
  area: Area,
): Promise<Blob> {
  const image = await loadImage(imageSrc);

  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(area.width));
  canvas.height = Math.max(1, Math.round(area.height));

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not supported in this browser.");

  ctx.drawImage(
    image,
    area.x,
    area.y,
    area.width,
    area.height,
    0,
    0,
    canvas.width,
    canvas.height,
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Failed to export the cropped image."));
      },
      OUTPUT_TYPE,
      OUTPUT_QUALITY,
    );
  });
}
