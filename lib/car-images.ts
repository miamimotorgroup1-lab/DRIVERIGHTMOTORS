import { existsSync } from "node:fs";
import path from "node:path";

export function carImageExists(src: string): boolean {
  if (!src) return false;
  const filePath = path.join(process.cwd(), "public", src);
  return existsSync(filePath);
}
