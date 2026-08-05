import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        // Supabase Storage public objects (car-photos bucket — see
        // app/api/admin/car-images/route.ts and components/admin/
        // ImageUploader.tsx). Must match the project ref in
        // NEXT_PUBLIC_SUPABASE_URL — without this, next/image's optimizer
        // 400s on these URLs instead of proxying/resizing them, and
        // CarImage's onError fallback kicks in, showing the placeholder.
        protocol: "https",
        hostname: "sycdxzsmcqsrzoedszcw.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
