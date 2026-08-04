"use client";

import Image from "next/image";
import { useState } from "react";

type CarImageProps = {
  src: string;
  alt: string;
  fallbackLabel: string;
  hasImage: boolean;
  className?: string;
  sizes?: string;
  priority?: boolean;
};

export default function CarImage({
  src,
  alt,
  fallbackLabel,
  hasImage,
  className = "",
  sizes,
  priority,
}: CarImageProps) {
  const [errored, setErrored] = useState(!hasImage);

  if (errored) {
    return (
      <div
        className={`absolute inset-0 flex items-center justify-center border border-hairline bg-elevated text-center ${className}`}
      >
        <span className="px-6 font-display text-lg text-muted">
          {fallbackLabel}
        </span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes ?? "100vw"}
      priority={priority}
      className={className}
      onError={() => setErrored(true)}
    />
  );
}
