import React, { useEffect, useState } from "react";
import { getAuthToken } from "../lib/auth";
import { ShoppingBag } from "lucide-react";

const AuthImage = ({
  src,
  alt,
  className,
  fallback, // React element fallback
  showLoader = true,
  onError: externalOnError,
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
        setError(true);
        return;
      }

      const sourceStr = String(src).trim();

      const isAuthRequired = /\/api\/upload\//i.test(sourceStr);

      if (!isAuthRequired) {
        setError(false);
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
        if (active) {
          setError(true);
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
  }, [src]);

  // Render fallback when error
  if (error) {
    if (fallback) {
      return <div className={className}>{fallback}</div>;
    }
    return (
      <div className={`relative flex items-center justify-center bg-slate-100 dark:bg-zinc-800/50 ${className || ""}`}>
        <ShoppingBag className="text-slate-300 dark:text-zinc-600 w-12 h-12" />
      </div>
    );
  }

  return (
    <div className={`relative ${className || ""}`}>
      {loading && showLoader && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100 dark:bg-zinc-800 animate-pulse">
          <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      {imgSrc ? (
        <img
          src={imgSrc}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            loading ? "opacity-0" : "opacity-100"
          }`}
          onError={() => {
            setError(true);
            if (externalOnError) externalOnError();
          }}
          {...props}
        />
      ) : null}
    </div>
  );
};

export default AuthImage;
