import { NextResponse } from "next/server";
import { PortfolioService } from "@/services/portfolio-service";
import { getFromRedis } from "@/lib/data";

// API para atualizar status com refresh forçado dos dados
export async function POST(req: Request) {
  try {
    // Obter os dados do corpo da requisição
    const updates = await req.json();
    
    // Validar se o formato é correto
    if (!Array.isArray(updates) && !updates.productId) {
      return NextResponse.json(
        { error: "Formato inválido. Envie um objeto ou array de objetos com productId, countryId e statusId" },
        { status: 400 }
      );
    }
    
    // Converter para array se for um único objeto
    const updateArray = Array.isArray(updates) ? updates : [updates];
    
    // Validar cada item do array
    for (const update of updateArray) {
      if (!update.productId || !update.countryId) {
        return NextResponse.json(
          { error: "Cada atualização deve ter productId e countryId", detail: update },
          { status: 400 }
        );
      }
      
      // statusId pode ser vazio (para exclusão), mas não pode ser undefined/null
      if (update.statusId === undefined || update.statusId === null) {
        return NextResponse.json(
          { error: "O campo statusId não pode ser undefined ou null", detail: update },
          { status: 400 }
        );
      }
      
      // setsQty é opcional, então não precisa validar
    }
    
    // Realizar as atualizações usando o serviço
    const success = await PortfolioService.bulkUpdateStatus(updateArray);
    
    if (success) {
      // Verificar se os dados foram realmente salvos
      const statusPortfolios = await getFromRedis('statusPortfolios');
      const portfolioView = await getFromRedis('portfolioStatusView');
      
      return NextResponse.json({
        success: true,
        message: `${updateArray.length} atualizações processadas com sucesso`,
        statusPortfoliosCount: Array.isArray(statusPortfolios) ? statusPortfolios.length : 0,
        portfolioViewCount: Array.isArray(portfolioView) ? portfolioView.length : 0
      });
    } else {
      return NextResponse.json(
        { success: false, error: "Falha ao atualizar os status", detail: "O serviço retornou falha" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Erro ao processar atualização:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao processar atualização", message: String(error), stack: error instanceof Error ? error.stack : undefined },
      { status: 500 }
    );
  }
} 