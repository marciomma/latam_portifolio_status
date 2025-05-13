import { NextResponse } from "next/server";
import { PortfolioService } from "@/services/portfolio-service";

export async function GET() {
  try {
    const [
      countries,
      portfolioViewData,
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
      countries,
      portfolioData: portfolioViewData,
      procedures,
      productTypes,
      statuses
    });
  } catch (error) {
    console.error("Error loading dashboard data:", error);
    return NextResponse.json(
      { 
        error: "Failed to load dashboard data",
        message: error instanceof Error ? error.message : String(error)
      }, 
      { status: 500 }
    );
  }
} 