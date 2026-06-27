export interface FallbackStrategy<T> {
  execute: () => Promise<T>;
}

export interface FallbackOptions {
  useCache?: boolean; // Whether to use cached data as a fallback
  cacheTimeout?: number; // Time in milliseconds to keep data in cache
  defaultResponse?: any; // Default response to return if fallback fails
  retryCount?: number; // Number of times to retry the operation before giving up
  retryDelay?: number; // Delay in milliseconds between retries
}
