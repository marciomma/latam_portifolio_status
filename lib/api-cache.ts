import { unstable_cache } from 'next/cache';
import { PortfolioService } from '@/services/portfolio-service';

// Cache tags for granular invalidation
export const CACHE_TAGS = {
  PORTFOLIO: 'portfolio',
  COUNTRIES: 'countries',
  PRODUCTS: 'products',
  PROCEDURES: 'procedures',
  STATUSES: 'statuses',
} as const;

// Cached data fetchers with revalidation
export const getCachedPortfolioData = unstable_cache(
  async () => {
    const [
      countries,
      portfolioData,
      procedures,
      productTypes,
      statuses,
      products
    ] = await Promise.all([
      PortfolioService.getCountries(),
      PortfolioService.getPortfolioStatusView(),
      PortfolioService.getProcedures(),
      PortfolioService.getProductTypes(),
      PortfolioService.getStatuses(),
      PortfolioService.getProducts()
    ]);

    return {
      countries,
      portfolioData,
      procedures,
      productTypes,
      statuses,
      products,
      timestamp: Date.now(),
    };
  },
  ['portfolio-data'],
  {
    revalidate: 60, // Cache for 60 seconds
    tags: [CACHE_TAGS.PORTFOLIO],
  }
);

// Individual cached fetchers for granular control
export const getCachedCountries = unstable_cache(
  () => PortfolioService.getCountries(),
  ['countries'],
  { 
    revalidate: 3600, // Countries change rarely, cache for 1 hour
    tags: [CACHE_TAGS.COUNTRIES] 
  }
);

export const getCachedProducts = unstable_cache(
  () => PortfolioService.getProducts(),
  ['products'],
  { 
    revalidate: 300, // Products might change more often, cache for 5 minutes
    tags: [CACHE_TAGS.PRODUCTS] 
  }
);

// Function to invalidate specific cache tags
export async function invalidateCache(tags: string[]) {
  try {
    const { revalidateTag } = await import('next/cache');
    tags.forEach(tag => revalidateTag(tag));
  } catch (error) {
    console.error('Error invalidating cache:', error);
  }
}

// Memory cache for frequently accessed data
class MemoryCache<T> {
  private cache = new Map<string, { data: T; timestamp: number }>();
  private ttl: number;

  constructor(ttlSeconds: number) {
    this.ttl = ttlSeconds * 1000;
  }

  get(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() - cached.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  set(key: string, data: T): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  clear(): void {
    this.cache.clear();
  }
}

// Create memory caches for hot data
export const portfolioCache = new MemoryCache<any>(30); // 30 seconds TTL
export const countriesCache = new MemoryCache<any>(300); // 5 minutes TTL 