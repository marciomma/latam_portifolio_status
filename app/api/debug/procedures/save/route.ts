import { getFromRedis, setToRedis } from '@/lib/data';
import { NextResponse } from 'next/server';
import type { Procedure } from '@/types/database';
import { nanoid } from 'nanoid';
import { PortfolioService } from '@/services/portfolio-service';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { procedures } = body;
    
    if (!procedures || !Array.isArray(procedures)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid request. Expected procedures array in request body.' 
      }, { status: 400 });
    }

    // Get existing procedures from Redis
    const existingProcedures = await getFromRedis<Procedure>('procedures');
    
    // Process each procedure for saving
    const updatedProcedures = [...existingProcedures];
    
    for (const procedure of procedures) {
      if (!procedure.name || !procedure.category) {
        return NextResponse.json({ 
          success: false, 
          error: 'Invalid procedure data. Name and category are required.' 
        }, { status: 400 });
      }
      
      // Check if this is an update or new procedure
      const existingIndex = updatedProcedures.findIndex(p => p.id === procedure.id);
      
      if (existingIndex >= 0) {
        // Update existing procedure
        updatedProcedures[existingIndex] = {
          ...updatedProcedures[existingIndex],
          name: procedure.name,
          category: procedure.category,
          isActive: procedure.isActive === undefined ? true : procedure.isActive
        };
      } else {
        // Add new procedure with generated ID if not provided
        const newProcedure: Procedure = {
          id: procedure.id || `procedure-${nanoid(8)}`,
          name: procedure.name,
          category: procedure.category,
          isActive: procedure.isActive === undefined ? true : procedure.isActive
        };
        updatedProcedures.push(newProcedure);
      }
    }
    
    // Save updated procedures to Redis
    await setToRedis('procedures', updatedProcedures);
    
    // Rebuild the portfolio status view to reflect the updated procedure data
    await PortfolioService.rebuildPortfolioStatusView();
    
    return NextResponse.json({
      success: true,
      message: 'Procedures saved successfully',
      totalProcedures: updatedProcedures.length
    });
  } catch (error) {
    console.error('Error saving procedures:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 