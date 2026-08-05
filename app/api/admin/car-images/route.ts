import { randomUUID } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Uploads/deletes car photos in the Supabase Storage "car-photos" bucket
// (created + made public in the Supabase dashboard — see AGENTS.md for the
// setup note). A Route Handler rather than a Server Action on purpose:
//   - Server Actions cap request bodies at 1MB by default (see
//     node_modules/next/dist/docs/01-app/02-guides/server-actions.md); our
//     10MB image limit needs a plain HTTP endpoint instead.
//   - XHR against a Route Handler gives real per-file upload progress
//     (xhr.upload.onprogress) — a Server Action's RSC transport doesn't
//     expose that.
// Auth is re-verified here (not just by proxy.ts) for the same reason every
// Server Action re-verifies: this endpoint is reachable by direct POST
// regardless of which page rendered the uploader.

const BUCKET = "car-photos";
const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};

async function requireAdminJson() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) {
    return { supabase: null, unauthorized: NextResponse.json(
      { error: "Unauthorized." },
      { status: 401 },
    ) };
  }
  return { supabase, unauthorized: null };
}

export async function POST(request: NextRequest) {
  const { supabase, unauthorized } = await requireAdminJson();
  if (unauthorized) return unauthorized;

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid upload." }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }

  const extension = ALLOWED_TYPES[file.type];
  if (!extension) {
    return NextResponse.json(
      { error: "Only JPEG, PNG, WebP, GIF, or AVIF images are allowed." },
      { status: 400 },
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "Image must be smaller than 10MB." },
      { status: 400 },
    );
  }

  const path = `${randomUUID()}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });

  if (uploadError) {
    console.error("Car image upload failed:", uploadError);
    // A missing/misconfigured bucket or a Storage RLS policy that doesn't
    // grant authenticated INSERT surfaces here — see AGENTS.md for what to
    // check in the Supabase dashboard.
    return NextResponse.json(
      { error: `Upload failed: ${uploadError.message}` },
      { status: 500 },
    );
  }

  const { data: publicUrlData } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return NextResponse.json({ url: publicUrlData.publicUrl });
}

// Best-effort Storage cleanup when an image is removed from a car's list in
// the admin form. Not load-bearing — CarForm ignores failures here, since a
// dangling Storage object is a much smaller problem than blocking the edit.
export async function DELETE(request: NextRequest) {
  const { supabase, unauthorized } = await requireAdminJson();
  if (unauthorized) return unauthorized;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const url =
    typeof body === "object" && body !== null && "url" in body
      ? (body as { url?: unknown }).url
      : undefined;
  if (typeof url !== "string") {
    return NextResponse.json({ error: "Missing url." }, { status: 400 });
  }

  const path = extractStoragePath(url);
  if (!path) {
    // Not one of our Storage URLs (a pasted external URL, or a legacy local
    // /cars/... path from the original seed) — nothing to clean up.
    return NextResponse.json({ success: true });
  }

  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) {
    console.error("Car image delete failed:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}

function extractStoragePath(url: string): string | null {
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const index = url.indexOf(marker);
  if (index === -1) return null;
  return decodeURIComponent(url.slice(index + marker.length));
}
