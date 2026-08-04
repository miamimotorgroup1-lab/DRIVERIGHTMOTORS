import { existsSync } from "node:fs";
import path from "node:path";

export function carImageExists(src: string): boolean {
  if (!src) return false;
  // Admin-added images (lib/car-schema.ts) are full URLs, not files under
  // /public — there's nothing on disk to check, so assume they're valid.
  // CarImage's onError fallback still catches a URL that turns out broken.
  if (/^https?:\/\//i.test(src)) return true;
  const filePath = path.join(process.cwd(), "public", src);
  return existsSync(filePath);
}
