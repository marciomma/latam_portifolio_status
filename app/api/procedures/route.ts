import { getFromRedis, setToRedis } from '@/lib/data';
import { NextResponse } from 'next/server';
import type { Procedure, Product } from '@/types/database';

// GET /api/procedures
export async function GET() {
  try {
    const procedures = await getFromRedis<Procedure>('procedures');
    return NextResponse.json(procedures);
  } catch (error) {
    console.error('Error fetching procedures:', error);
    return NextResponse.json(
      { error: 'Failed to fetch procedures' },
      { status: 500 }
    );
  }
}

// DELETE /api/procedures?ids=id1,id2,id3
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const idsParam = searchParams.get('ids');
    
    if (!idsParam) {
      return NextResponse.json(
        { error: 'No ids provided' },
        { status: 400 }
      );
    }
    
    const ids = idsParam.split(',');
    
    // Get existing procedures
    const procedures = await getFromRedis<Procedure>('procedures');
    const filteredProcedures = procedures.filter(p => !ids.includes(p.id));
    
    // Check if any procedures were actually removed
    if (filteredProcedures.length === procedures.length) {
      return NextResponse.json(
        { error: 'No procedures found with the provided ids' },
        { status: 404 }
      );
    }
    
    // Check if the procedures to delete are used by any products
    const products = await getFromRedis<Product>('products');
    const usedProcedureIds = new Set(products.map(product => product.procedureId));
    
    const attemptingToDeleteUsed = ids.filter(id => usedProcedureIds.has(id));
    if (attemptingToDeleteUsed.length > 0) {
      // Option 1: Prevent deletion
      return NextResponse.json(
        { 
          error: 'Cannot delete procedures that are used by products',
          usedProcedureIds: attemptingToDeleteUsed
        },
        { status: 400 }
      );
      
      // Option 2: Delete the procedures anyway and leave orphaned products
      // (Uncomment this code if you want to allow deletion of used procedures)
      // console.warn('Deleting procedures that are used by products:', attemptingToDeleteUsed);
    }
    
    // Save filtered procedures list
    await setToRedis('procedures', filteredProcedures);
    
    return NextResponse.json({
      success: true,
      message: `${procedures.length - filteredProcedures.length} procedure(s) deleted successfully`,
      remaining: filteredProcedures.length
    });
  } catch (error) {
    console.error('Error deleting procedures:', error);
    return NextResponse.json(
      { error: 'Failed to delete procedures' },
      { status: 500 }
    );
  }
} 