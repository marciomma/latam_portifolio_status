import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { PortfolioService } from "@/services/portfolio-service";
import type { Product } from "@/types/database";

// POST - Salvar produtos modificados
export async function POST(req: Request) {
  try {
    const { products } = await req.json();
    
    if (!Array.isArray(products)) {
      return NextResponse.json(
        { error: "Formato inválido. Esperado um array de produtos." },
        { status: 400 }
      );
    }
    
    console.log(`[API] Recebido ${products.length} produtos para atualizar/adicionar`);
    
    // Verificar nomes duplicados entre os novos produtos
    const productNames = products.map(p => p.name.trim().toLowerCase());
    const uniqueNames = new Set(productNames);
    
    if (uniqueNames.size !== productNames.length) {
      const duplicates = productNames.filter((name, index) => 
        productNames.indexOf(name) !== index
      );
      
      return NextResponse.json(
        { 
          error: "Nomes de produtos duplicados", 
          message: `Os seguintes nomes estão duplicados: ${[...new Set(duplicates)].join(', ')}` 
        },
        { status: 400 }
      );
    }
    
    // Buscar produtos existentes
    const existingProducts = await PortfolioService.getProducts();
    console.log(`[API] Existem atualmente ${existingProducts.length} produtos no banco`);
    
    // Verificar duplicidade com produtos existentes 
    // (exceto se for o mesmo produto sendo atualizado)
    const existingIds = new Set(existingProducts.map(p => p.id));
    
    for (const product of products) {
      // Se não estiver atualizando um produto existente, verificar duplicidade de nome
      if (!existingIds.has(product.id)) {
        const duplicateName = existingProducts.find(
          p => p.name.trim().toLowerCase() === product.name.trim().toLowerCase()
        );
        
        if (duplicateName) {
          return NextResponse.json(
            { 
              error: "Nome de produto duplicado", 
              message: `O nome "${product.name}" já existe no banco de dados` 
            },
            { status: 400 }
          );
        }
      }
    }
    
    // Verificar que todos os produtos têm os campos necessários
    const invalidProducts = products.filter(
      p => !p.id || !p.name || !p.procedureId || !p.productTypeId
    );
    
    if (invalidProducts.length > 0) {
      return NextResponse.json(
        { 
          error: "Produtos inválidos", 
          message: `${invalidProducts.length} produto(s) não possuem todos os campos obrigatórios` 
        },
        { status: 400 }
      );
    }
    
    // Mesclar produtos novos/modificados com existentes
    const productMap = new Map<string, Product>();
    
    // Adicionar produtos existentes
    existingProducts.forEach(product => {
      productMap.set(product.id, product);
    });
    
    // Atualizar/adicionar produtos modificados
    products.forEach(product => {
      productMap.set(product.id, product);
    });
    
    // Converter de volta para array
    const updatedProducts = Array.from(productMap.values());
    console.log(`[API] Total de ${updatedProducts.length} produtos após mesclagem`);
    
    // Salvar no Redis, garantindo que seja armazenado como string JSON
    await redis.del('products');
    const jsonString = JSON.stringify(updatedProducts);
    const result = await redis.set('products', jsonString);
    
    // Verificar se os dados foram salvos corretamente
    const verification = await redis.get('products');
    let savedCount = 0;
    
    if (Array.isArray(verification)) {
      savedCount = verification.length;
      console.log(`[API] Verificação: Redis retornou ${savedCount} produtos como array`);
    } else if (typeof verification === 'string') {
      try {
        const parsed = JSON.parse(verification);
        if (Array.isArray(parsed)) {
          savedCount = parsed.length;
          console.log(`[API] Verificação: Redis retornou ${savedCount} produtos como string JSON`);
        }
      } catch (error) {
        console.error('[API] Erro ao verificar dados salvos:', error);
      }
    }
    
    if (savedCount !== updatedProducts.length) {
      console.error(`[API] Anomalia na verificação: esperava ${updatedProducts.length} produtos, encontrou ${savedCount}`);
    }
    
    return NextResponse.json({
      success: true,
      message: `${products.length} produto(s) salvo(s) com sucesso`,
      totalProducts: updatedProducts.length,
      savedProducts: savedCount
    });
  } catch (error) {
    console.error('[API] Erro ao salvar produtos:', error);
    return NextResponse.json(
      { success: false, error: "Falha ao salvar produtos", message: String(error) },
      { status: 500 }
    );
  }
} 