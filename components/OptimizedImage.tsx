import React, { useState, useEffect, useCallback } from 'react';
import { imageLoader, useImageLoader } from '../utils/imageLoader';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  preload?: boolean;
  retryCount?: number;
  fallbackSrc?: string;
  onLoad?: () => void;
  onError?: () => void;
  loading?: 'lazy' | 'eager';
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  preload = false,
  retryCount = 3,
  fallbackSrc = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="400" viewBox="0 0 100 100"><rect width="100" height="100" fill="#1a1a1a"/><text x="50" y="50" dominant-baseline="middle" text-anchor="middle" fill="#444" font-size="8">Image Unavailable</text></svg>',
  onLoad,
  onError,
  loading = 'lazy'
}) => {
  const { imageUrl, isLoading, hasError } = useImageLoader(src, { preload, retryCount });
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [currentSrc, setCurrentSrc] = useState<string>('');

  useEffect(() => {
    if (imageUrl && !hasError) {
      setCurrentSrc(imageUrl);
      setIsImageLoaded(false);
    }
  }, [imageUrl, hasError]);

  const handleImageLoad = useCallback(() => {
    setIsImageLoaded(true);
    onLoad?.();
  }, [onLoad]);

  const handleImageError = useCallback(() => {
    if (currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      onError?.();
    }
  }, [currentSrc, fallbackSrc, onError]);

  // Show skeleton loader while loading
  if (isLoading && !isImageLoaded) {
    return (
      <div className={`relative ${className}`}>
        <div className="absolute inset-0 bg-zinc-800 animate-pulse" />
        <img
          src={fallbackSrc}
          alt={alt}
          className={`${className} opacity-0`}
          loading={loading}
        />
      </div>
    );
  }

  // Show fallback on error
  if (hasError && !isImageLoaded) {
    return (
      <img
        src={fallbackSrc}
        alt={alt}
        className={className}
        loading={loading}
      />
    );
  }

  return (
    <img
      src={currentSrc || fallbackSrc}
      alt={alt}
      className={className}
      onLoad={handleImageLoad}
      onError={handleImageError}
      loading={loading}
    />
  );
};

export default OptimizedImage;