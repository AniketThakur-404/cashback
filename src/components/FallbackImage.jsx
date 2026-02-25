import React, { useEffect, useState } from "react";

const FallbackImage = ({
  src,
  alt,
  className,
  fallbackSrc = "/placeholder.svg",
  fallback, // Support React Element as fallback
  ...props
}) => {
  const [imgError, setImgError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src || fallbackSrc);

  useEffect(() => {
    setImgError(false);
    setCurrentSrc(src || fallbackSrc);
  }, [src, fallbackSrc]);

  if (imgError && fallback) {
    return <div className={className}>{fallback}</div>;
  }

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={className}
      onError={() => {
        setImgError(true);
        if (currentSrc !== fallbackSrc) {
          setCurrentSrc(fallbackSrc);
        }
      }}
      {...props}
    />
  );
};

export default FallbackImage;
