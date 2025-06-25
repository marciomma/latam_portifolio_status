import { NextResponse } from "next/server";
import { setToRedis } from "@/lib/data";
import { PortfolioService } from "@/services/portfolio-service";

// GET - Obter todos os produtos
export async function GET() {
  try {
    const products = await PortfolioService.getProducts();
    console.log(`[API] GET /api/products - Retornando ${products.length} produtos`);
    return NextResponse.json(products);
  } catch (error) {
    console.error("[API] GET /api/products - Erro:", error);
    return NextResponse.json(
      { error: "Falha ao obter produtos", message: String(error) },
      { status: 500 }
    );
  }
}

// POST - Salvar alterações de produtos (atualizar e adicionar)
export async function POST(req: Request) {
  try {
    const data = await req.json();
    
    // Redirecionar para a API de debug para melhor tratamento
    console.log(`[API] POST /api/products - Redirecionando para /api/debug/products com ${data.products?.length || 0} produtos`);
    
    const debugResponse = await fetch(new URL('/api/debug/products', req.url).toString(), {
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
    console.error("[API] Erro ao salvar produtos:", error);
    return NextResponse.json(
      { error: "Falha ao salvar produtos", message: String(error) },
      { status: 500 }
    );
  }
}

// DELETE - Excluir produtos específicos
export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const ids = url.searchParams.get('ids');
    
    console.log(`[API] DELETE /api/products - IDs para excluir: ${ids}`);
    
    if (!ids) {
      return NextResponse.json(
        { error: "IDs de produtos não especificados" },
        { status: 400 }
      );
    }
    
    const productIds = ids.split(',');
    console.log(`[API] Excluindo ${productIds.length} produtos`);
    
    // Obter produtos existentes
    const allProducts = await PortfolioService.getProducts();
    console.log(`[API] Total de produtos antes da exclusão: ${allProducts.length}`);
    
    // Filtrar produtos que não serão excluídos
    const remainingProducts = allProducts.filter(
      product => !productIds.includes(product.id)
    );
    
    console.log(`[API] Produtos restantes após exclusão: ${remainingProducts.length}`);
    
    // Salvar produtos restantes
    const result = await setToRedis('products', remainingProducts);
    console.log(`[API] Resultado da exclusão no Redis:`, result);
    
    if (result) {
      // Verificar se os produtos foram realmente excluídos
      const verifiedProducts = await PortfolioService.getProducts();
      console.log(`[API] Produtos após verificação de exclusão: ${verifiedProducts.length}`);
      
      return NextResponse.json({
        success: true,
        message: `${productIds.length} produtos excluídos com sucesso.`,
        deletedCount: productIds.length,
        remainingCount: verifiedProducts.length
      });
    } else {
      throw new Error("Falha ao atualizar o Redis após exclusão");
    }
  } catch (error) {
    console.error("[API] Erro ao excluir produtos:", error);
    return NextResponse.json(
      { error: "Falha ao excluir produtos", message: String(error) },
      { status: 500 }
    );
  }
} 