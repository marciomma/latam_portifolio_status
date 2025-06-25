import { NextResponse } from "next/server";
import { setToRedis } from "@/lib/data";
import { PortfolioService } from "@/services/portfolio-service";

// GET - Obter todos os países
export async function GET() {
  try {
    const countries = await PortfolioService.getCountries();
    console.log(`[API] GET /api/countries - Retornando ${countries.length} países`);
    return NextResponse.json(countries);
  } catch (error) {
    console.error("[API] GET /api/countries - Erro:", error);
    return NextResponse.json(
      { error: "Falha ao obter países", message: String(error) },
      { status: 500 }
    );
  }
}

// POST - Salvar alterações de países (atualizar e adicionar)
export async function POST(req: Request) {
  try {
    const data = await req.json();
    
    // Redirecionar para a API de debug para melhor tratamento
    console.log(`[API] POST /api/countries - Redirecionando para /api/debug/countries/save com ${data.countries?.length || 0} países`);
    
    const debugResponse = await fetch(new URL('/api/debug/countries/save', req.url).toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    // Retornar a resposta da API de debug
    const result = await debugResponse.json();
    return NextResponse.json(result);
    
  } catch (error) {
    console.error("[API] Erro ao salvar países:", error);
    return NextResponse.json(
      { error: "Falha ao salvar países", message: String(error) },
      { status: 500 }
    );
  }
}

// DELETE - Excluir países específicos
export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const ids = url.searchParams.get('ids');
    
    console.log(`[API] DELETE /api/countries - IDs para excluir: ${ids}`);
    
    if (!ids) {
      return NextResponse.json(
        { error: "IDs de países não especificados" },
        { status: 400 }
      );
    }
    
    const countryIds = ids.split(',');
    console.log(`[API] Excluindo ${countryIds.length} países`);
    
    // Obter países existentes
    const allCountries = await PortfolioService.getCountries();
    console.log(`[API] Total de países antes da exclusão: ${allCountries.length}`);
    
    // Filtrar países que não serão excluídos
    const remainingCountries = allCountries.filter(
      country => !countryIds.includes(country.id)
    );
    
    console.log(`[API] Países restantes após exclusão: ${remainingCountries.length}`);
    
    // Salvar países restantes
    const result = await setToRedis('countries', remainingCountries);
    console.log(`[API] Resultado da exclusão no Redis:`, result);
    
    if (result) {
      // Verificar se os países foram realmente excluídos
      const verifiedCountries = await PortfolioService.getCountries();
      console.log(`[API] Países após verificação de exclusão: ${verifiedCountries.length}`);
      
      return NextResponse.json({
        success: true,
        message: `${countryIds.length} países excluídos com sucesso.`,
        deletedCount: countryIds.length,
        remainingCount: verifiedCountries.length
      });
    } else {
      throw new Error("Falha ao atualizar o Redis após exclusão");
    }
  } catch (error) {
    console.error("[API] Erro ao excluir países:", error);
    return NextResponse.json(
      { error: "Falha ao excluir países", message: String(error) },
      { status: 500 }
    );
  }
} 