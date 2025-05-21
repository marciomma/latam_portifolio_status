import { NextResponse } from "next/server";
import { PortfolioService } from "@/services/portfolio-service";

export async function GET() {
  try {
    const success = await PortfolioService.refreshCache();
    
    return NextResponse.json({
      success,
      message: success 
        ? "Cache limpo com sucesso. Os dados serão recarregados na próxima solicitação." 
        : "Erro ao limpar o cache."
    });
  } catch (error) {
    console.error("Erro ao limpar o cache:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Falha ao limpar o cache",
        message: error instanceof Error ? error.message : String(error)
      }, 
      { status: 500 }
    );
  }
} 