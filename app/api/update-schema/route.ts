import { NextResponse } from "next/server";
import { getFromRedis, setToRedis } from "@/lib/data";
import { PortfolioService } from "@/services/portfolio-service";
import type { StatusPortfolio } from "@/types/database";

export async function GET(req: Request) {
  try {
    // Obter todos os registros statusPortfolios
    const statusPortfolios = await getFromRedis<StatusPortfolio>('statusPortfolios') as StatusPortfolio[];
    
    if (!Array.isArray(statusPortfolios)) {
      console.error("statusPortfolios não é um array", typeof statusPortfolios);
      return NextResponse.json({ 
        success: false, 
        message: "statusPortfolios não é um array válido" 
      }, { status: 500 });
    }
    
    console.log(`Encontrados ${statusPortfolios.length} registros para atualizar`);
    
    // Adicionar o campo setsQty a cada registro se não existir
    const updatedPortfolios = statusPortfolios.map((item) => {
      if (item.setsQty === undefined) {
        return { 
          ...item, 
          setsQty: "" 
        };
      }
      return item;
    });
    
    // Salvar os dados atualizados de volta ao Redis
    try {
      await setToRedis('statusPortfolios', updatedPortfolios);
      console.log(`Dados salvos: ${updatedPortfolios.length} registros`);
    } catch (redisError) {
      console.error("Erro ao salvar no Redis:", redisError);
      return NextResponse.json({ 
        success: false, 
        message: `Erro ao salvar no Redis: ${String(redisError)}`
      }, { status: 500 });
    }
    
    // Reconstruir a view com os dados atualizados
    try {
      const viewResult = await PortfolioService.rebuildPortfolioStatusView();
      console.log("Resultado da reconstrução da view:", viewResult);
    } catch (viewError) {
      console.error("Erro ao reconstruir view:", viewError);
      return NextResponse.json({ 
        success: false, 
        message: `Registros atualizados, mas erro ao reconstruir view: ${String(viewError)}`
      }, { status: 500 });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: `${updatedPortfolios.length} registros atualizados e view reconstruída` 
    });
  } catch (error) {
    console.error("Erro geral:", error);
    return NextResponse.json({ 
      success: false, 
      error: String(error) 
    }, { status: 500 });
  }
}