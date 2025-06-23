import { NextResponse } from "next/server";
import { PortfolioService } from "@/services/portfolio-service";

// Simple in-memory cache with TTL
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 30 * 1000; // 30 seconds

export async function GET(request: Request) {
  try {
    // Check if we have cached data
    const cacheKey = 'dashboard-data';
    const cached = cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      // Return cached data with cache headers
      return NextResponse.json(cached.data, {
        headers: {
          'X-Cache': 'HIT',
          'Cache-Control': 'private, max-age=30',
        }
      });
    }

    // Fetch fresh data
    const [
      countries,
      portfolioViewData,
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

    const data = {
      countries,
      portfolioData: portfolioViewData,
      procedures,
      productTypes,
      statuses,
      products
    };

    // Cache the data
    cache.set(cacheKey, { data, timestamp: Date.now() });

    // Return with cache headers
    return NextResponse.json(data, {
      headers: {
        'X-Cache': 'MISS',
        'Cache-Control': 'private, max-age=30',
      }
    });
  } catch (error) {
    console.error("Error loading dashboard data:", error);
    
    // Clear cache on error
    cache.clear();
    
    return NextResponse.json(
      { 
        error: "Failed to load dashboard data",
        message: error instanceof Error ? error.message : String(error)
      }, 
      { status: 500 }
    );
  }
}

// Optional: Add POST method to invalidate cache
export async function POST() {
  cache.clear();
  return NextResponse.json({ message: "Cache cleared" });
} 