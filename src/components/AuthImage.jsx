import React, { useEffect, useState } from "react";
import { getAuthToken } from "../lib/auth";

const AuthImage = ({
  src,
  alt,
  className,
  fallbackSrc = "/placeholder.svg",
  fallback, // React element fallback
  showLoader = true,
  ...props
}) => {
  const [imgSrc, setImgSrc] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    let objectUrl = "";

    const loadImage = async () => {
      if (!src) {
        setImgSrc(fallbackSrc);
        return;
      }

      const sourceStr = String(src).trim();

      // If it doesn't contain /api/upload or isn't a relative upload API route,
      // load it directly
      const isAuthRequired = /\/api\/upload\//i.test(sourceStr);

      if (!isAuthRequired) {
        setImgSrc(sourceStr);
        return;
      }

      try {
        setLoading(true);
        setError(false);

        const token = getAuthToken();
        const headers = {};
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        const response = await fetch(sourceStr, { headers });

        if (!response.ok) {
          throw new Error(`Failed to fetch authenticated image: ${response.status}`);
        }

        const blob = await response.blob();
        if (!active) return;

        objectUrl = URL.createObjectURL(blob);
        setImgSrc(objectUrl);
      } catch (err) {
        console.error("AuthImage load error:", err);
        if (active) {
          setError(true);
          setImgSrc(fallbackSrc);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadImage();

    return () => {
      active = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [src, fallbackSrc]);

  if (error && fallback) {
    return <div className={className}>{fallback}</div>;
  }

  return (
    <div className={`relative ${className || ""}`}>
      {loading && showLoader && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100 dark:bg-zinc-800 animate-pulse">
          <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      <img
        src={imgSrc || fallbackSrc}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          loading ? "opacity-0" : "opacity-100"
        }`}
        onError={() => {
          setError(true);
          setImgSrc(fallbackSrc);
        }}
        {...props}
      />
    </div>
  );
};

export default AuthImage;
