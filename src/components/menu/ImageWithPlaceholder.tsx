"use client";

import { useState, type ReactNode } from "react";

interface ImageWithPlaceholderProps {
  src: string;
  alt: string;
  imageClassName?: string;
  containerClassName?: string;
  fallback?: ReactNode;
}

/**
 * Renders an image with a pulsing skeleton placeholder while it loads,
 * fading it in once ready. Falls back to `fallback` content if the image
 * fails to load (e.g. broken/removed upload).
 */
export function ImageWithPlaceholder({
  src,
  alt,
  imageClassName,
  containerClassName,
  fallback,
}: ImageWithPlaceholderProps) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);

  if (errored) return <>{fallback}</>;

  return (
    <div className={`relative ${containerClassName ?? ""}`}>
      {!loaded && (
        <div className="absolute inset-0 animate-pulse bg-gray-200" aria-hidden="true" />
      )}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={() => setErrored(true)}
        className={`${imageClassName ?? ""} transition-opacity duration-300 ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
}
