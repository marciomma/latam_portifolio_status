import { NextResponse } from 'next/server';
import { redis } from "@/lib/redis";

// Define a function to identify modern records (created through country editor)
const isModernRecord = (id: string) => {
  // Modern records have timestamp-based IDs like "view-1747164665513-f5p8ts2"
  return id.startsWith('view-') && id.split('-').length > 2 && !id.match(/^view-prod-\d+$/);
};

export async function POST() {
  try {
    // Get all portfolio status data
    const portfolioData = await redis.get('portfolioStatusView') as any[];
    
    if (!Array.isArray(portfolioData)) {
      return NextResponse.json({ 
        message: 'No portfolio data found or invalid format', 
        success: false 
      }, { status: 400 });
    }
    
    console.log(`Found ${portfolioData.length} total records`);
    
    // Filter to keep only modern records
    const modernRecords = portfolioData.filter(item => isModernRecord(item.id));
    
    console.log(`Keeping ${modernRecords.length} modern records, removing ${portfolioData.length - modernRecords.length} legacy records`);
    
    // Store filtered data back to Redis
    await redis.set('portfolioStatusView', modernRecords);
    
    return NextResponse.json({ 
      message: `Database cleaned. Kept ${modernRecords.length} records, removed ${portfolioData.length - modernRecords.length} legacy records.`,
      success: true 
    });
    
  } catch (error) {
    console.error('Error cleaning portfolio data:', error);
    return NextResponse.json({ 
      message: `Error cleaning data: ${error instanceof Error ? error.message : String(error)}`,
      success: false 
    }, { status: 500 });
  }
} 