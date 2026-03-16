interface ImageCache {
  [key: string]: {
    loaded: boolean;
    url: string;
    timestamp: number;
    retryCount: number;
  };
}

class ImageLoader {
  private cache: ImageCache = {};
  private loadingPromises: { [key: string]: Promise<string> } = {};
  private readonly maxRetries = 3;
  private readonly retryDelay = 1000; // 1 second
  private readonly cacheExpiry = 5 * 60 * 1000; // 5 minutes

  private isValidUrl(url: string): boolean {
    return url && (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:'));
  }

  private normalizeUrl(url: string): string {
    if (!url) return '';
    
    // Handle protocol-relative URLs
    if (url.startsWith('//')) {
      return 'https:' + url;
    }
    
    // Convert HTTP to HTTPS
    if (url.startsWith('http://')) {
      return url.replace('http://', 'https://');
    }
    
    // Handle relative URLs from WordPress
    if (url.startsWith('/')) {
      return 'https://tw.aykays.com' + url;
    }
    
    return url;
  }

  private isCacheValid(cacheEntry: { timestamp: number }): boolean {
    return Date.now() - cacheEntry.timestamp < this.cacheExpiry;
  }

  private async retryLoad(url: string, retryCount: number): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        this.cache[url] = {
          loaded: true,
          url: url,
          timestamp: Date.now(),
          retryCount: 0
        };
        resolve(url);
      };

      img.onerror = () => {
        if (retryCount < this.maxRetries) {
          setTimeout(() => {
            this.retryLoad(url, retryCount + 1)
              .then(resolve)
              .catch(reject);
          }, this.retryDelay * (retryCount + 1)); // Exponential backoff
        } else {
          reject(new Error(`Failed to load image after ${this.maxRetries} retries: ${url}`));
        }
      };

      img.src = url;
    });
  }

  async preloadImage(url: string): Promise<string> {
    const normalizedUrl = this.normalizeUrl(url);
    
    if (!this.isValidUrl(normalizedUrl)) {
      throw new Error('Invalid image URL');
    }

    // Check cache first
    const cacheKey = normalizedUrl;
    if (this.cache[cacheKey] && this.isCacheValid(this.cache[cacheKey]) && this.cache[cacheKey].loaded) {
      return this.cache[cacheKey].url;
    }

    // Check if already loading
    if (this.loadingPromises[cacheKey]) {
      return this.loadingPromises[cacheKey];
    }

    // Create new loading promise
    const loadingPromise = this.retryLoad(normalizedUrl, 0)
      .finally(() => {
        // Clean up the loading promise after completion
        delete this.loadingPromises[cacheKey];
      });

    this.loadingPromises[cacheKey] = loadingPromise;
    return loadingPromise;
  }

  async preloadImages(urls: string[]): Promise<string[]> {
    const uniqueUrls = [...new Set(urls)];
    const promises = uniqueUrls.map(url => this.preloadImage(url).catch(() => ''));
    return Promise.all(promises);
  }

  getCachedUrl(url: string): string {
    const normalizedUrl = this.normalizeUrl(url);
    const cacheEntry = this.cache[normalizedUrl];
    
    if (cacheEntry && this.isCacheValid(cacheEntry) && cacheEntry.loaded) {
      return cacheEntry.url;
    }
    
    return normalizedUrl;
  }

  clearCache(): void {
    this.cache = {};
    this.loadingPromises = {};
  }

  // Preload images for a list of projects
  async preloadProjectImages(projects: Array<{ imageUrl?: string }>): Promise<void> {
    const imageUrls = projects
      .map(p => p.imageUrl)
      .filter((url): url is string => !!url && url !== 'data:image/gif;base64,R0lGODlhAQABAAAAACw=');
    
    if (imageUrls.length > 0) {
      await this.preloadImages(imageUrls);
    }
  }
}

export const imageLoader = new ImageLoader();

// React hook for image loading with state management
export const useImageLoader = (src: string, options?: { preload?: boolean; retryCount?: number }) => {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);
  const [retryCount, setRetryCount] = useState<number>(0);
  const maxRetries = options?.retryCount ?? 3;

  useEffect(() => {
    if (!src) {
      setIsLoading(false);
      setHasError(true);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setHasError(false);

    const loadImage = async () => {
      try {
        if (options?.preload) {
          const loadedUrl = await imageLoader.preloadImage(src);
          if (isMounted) {
            setImageUrl(loadedUrl);
            setIsLoading(false);
          }
        } else {
          // Direct loading with retry logic
          const img = new Image();
          
          img.onload = () => {
            if (isMounted) {
              setImageUrl(src);
              setIsLoading(false);
            }
          };

          img.onerror = () => {
            if (isMounted && retryCount < maxRetries) {
              setTimeout(() => {
                if (isMounted) {
                  setRetryCount(prev => prev + 1);
                }
              }, 1000 * (retryCount + 1));
            } else if (isMounted) {
              setHasError(true);
              setIsLoading(false);
            }
          };

          img.src = src;
        }
      } catch (error) {
        if (isMounted) {
          setHasError(true);
          setIsLoading(false);
        }
      }
    };

    loadImage();

    return () => {
      isMounted = false;
    };
  }, [src, retryCount, options?.preload, maxRetries]);

  return { imageUrl, isLoading, hasError, retry: () => setRetryCount(prev => prev + 1) };
};

// Import React for the hook
import { useState, useEffect } from 'react';