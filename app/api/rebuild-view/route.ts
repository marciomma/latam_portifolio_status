import { NextResponse } from "next/server";
import { PortfolioService } from "@/services/portfolio-service";

export async function GET() {
  try {
    const success = await PortfolioService.rebuildPortfolioStatusView();
    
    if (success) {
      return NextResponse.json({ 
        success: true, 
        message: "View reconstruída com sucesso" 
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        message: "Erro ao reconstruir view" 
      }, { status: 500 });
    }
  } catch (error) {
    console.error("Erro:", error);
    return NextResponse.json({ 
      success: false, 
      error: String(error) 
    }, { status: 500 });
  }
}