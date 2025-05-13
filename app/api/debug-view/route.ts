import { NextResponse } from "next/server";
import { PortfolioService } from "@/services/portfolio-service";

export async function GET() {
  try {
    // Obter todos os dados que o dashboard precisa
    const [
      countries,
      portfolioView,
      procedures,
      productTypes,
      statuses
    ] = await Promise.all([
      PortfolioService.getCountries(),
      PortfolioService.getPortfolioStatusView(),
      PortfolioService.getProcedures(),
      PortfolioService.getProductTypes(),
      PortfolioService.getStatuses()
    ]);
    
    return NextResponse.json({
      status: 'ok',
      counts: {
        countries: countries.length,
        portfolioView: portfolioView.length,
        procedures: procedures.length,
        productTypes: productTypes.length,
        statuses: statuses.length
      },
      // Dados simplificados para diagnóstico
      data: {
        countries: countries.slice(0, 2),
        portfolioSample: portfolioView.slice(0, 1)
      }
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
} 