import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
  lazy?: boolean;
  quality?: number;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className,
  fallbackSrc = '/placeholder.svg',
  lazy = true,
  quality = 80,
  ...props
}) => {
  const [imageSrc, setImageSrc] = useState<string>(lazy ? '' : src);
  const [imageRef, setImageRef] = useState<HTMLDivElement | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!lazy) {
      setImageSrc(src);
      return;
    }

    let observer: IntersectionObserver;
    
    if (imageRef) {
      observer = new IntersectionObserver(
        (entries) => {
          const [entry] = entries;
          if (entry.isIntersecting) {
            setImageSrc(src);
            observer.unobserve(imageRef);
          }
        },
        { threshold: 0.1 }
      );
      
      observer.observe(imageRef);
    }

    return () => {
      if (observer && imageRef) {
        observer.unobserve(imageRef);
      }
    };
  }, [imageRef, src, lazy]);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImageSrc(fallbackSrc);
    }
  };

  // Optimize image URL for Supabase storage
  const getOptimizedSrc = (originalSrc: string) => {
    if (!originalSrc || hasError) return fallbackSrc;
    
    // Check if it's a Supabase storage URL and add optimization parameters
    if (originalSrc.includes('supabase') && originalSrc.includes('storage')) {
      const url = new URL(originalSrc);
      url.searchParams.set('quality', quality.toString());
      return url.toString();
    }
    
    return originalSrc;
  };

  return (
    <div 
      ref={setImageRef} 
      className={cn("relative overflow-hidden", className)}
    >
      {imageSrc && (
        <img
          {...props}
          src={getOptimizedSrc(imageSrc)}
          alt={alt}
          loading={lazy ? "lazy" : "eager"}
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            "transition-opacity duration-300",
            isLoaded ? "opacity-100" : "opacity-0",
            className
          )}
        />
      )}
      
      {!isLoaded && imageSrc && (
        <div className={cn(
          "absolute inset-0 bg-muted animate-pulse flex items-center justify-center",
          className
        )}>
          <div className="w-8 h-8 bg-muted-foreground/20 rounded"></div>
        </div>
      )}
    </div>
  );
};

export default OptimizedImage;