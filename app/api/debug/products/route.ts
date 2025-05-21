import { NextResponse } from "next/server";
import { getFromRedis, setToRedis } from "@/lib/data";
import { redis } from "@/lib/redis";
import { PortfolioService } from "@/services/portfolio-service";

// GET - Verificar estado do Redis e retornar detalhes de diagnóstico
export async function GET(req: Request) {
  try {
    // Obter informações sobre a chave de produtos diretamente
    const rawProductsData = await redis.get('products');
    
    // Carregar produtos via service
    const productsViaService = await PortfolioService.getProducts();
    
    // Informações sobre o Redis
    const redisKeys = await redis.keys('*');
    
    // Identificar se a string JSON é válida (se for string)
    let jsonValid = false;
    let jsonLength = 0;
    let jsonError = null;
    
    if (typeof rawProductsData === 'string') {
      jsonLength = rawProductsData.length;
      try {
        JSON.parse(rawProductsData);
        jsonValid = true;
      } catch (e) {
        jsonError = String(e);
      }
    }
    
    return NextResponse.json({
      status: "success",
      diagnostics: {
        redisKeys,
        productsKey: {
          exists: rawProductsData !== null,
          type: typeof rawProductsData,
          length: jsonLength,
          jsonValid,
          jsonError,
          firstChars: typeof rawProductsData === 'string' ? rawProductsData.substring(0, 100) : null,
          lastChars: typeof rawProductsData === 'string' ? rawProductsData.substring(rawProductsData.length - 100) : null
        },
        products: {
          viaService: {
            count: productsViaService.length,
            first: productsViaService[0] || null,
            last: productsViaService.length > 0 ? productsViaService[productsViaService.length - 1] : null
          }
        }
      }
    });
  } catch (error) {
    console.error("[Debug] Erro:", error);
    return NextResponse.json(
      { error: "Falha na depuração", message: String(error) },
      { status: 500 }
    );
  }
}

// POST - Força salvar um array de produtos para teste
export async function POST(req: Request) {
  try {
    const { products, forceReplace } = await req.json();
    
    // Validar entrada
    if (!Array.isArray(products)) {
      return NextResponse.json(
        { error: "Formato inválido. Esperado um array de produtos." },
        { status: 400 }
      );
    }
    
    // Verificar nomes duplicados
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
    
    let result;
    
    // Forçar substituição ou mesclar com existentes
    if (forceReplace) {
      console.log(`[Debug] Forçando substituição com ${products.length} produtos`);
      
      // Verificar e corrigir o formato dos dados antes de salvar
      const cleanProducts = products.map(p => ({
        id: p.id,
        name: p.name,
        procedureId: p.procedureId,
        productTypeId: p.productTypeId,
        productTier: p.productTier,
        productLifeCycle: p.productLifeCycle,
        isActive: p.isActive === undefined ? true : p.isActive
      }));
      
      // Forçar redis reset para garantir que estamos salvando corretamente
      // Primeiro, excluir a chave atual
      await redis.del('products');
      console.log(`[Debug] Chave 'products' excluída para reset`);
      
      // Então salvar novos dados
      result = await setToRedis('products', cleanProducts);
    } else {
      console.log(`[Debug] Mesclando ${products.length} produtos com existentes`);
      const existingProducts = await PortfolioService.getProducts();
      
      // Verificar nomes duplicados ao mesclar
      const existingNames = existingProducts.map(p => p.name.trim().toLowerCase());
      const newNames = products
        .filter(p => !existingProducts.some(ep => ep.id === p.id)) // Apenas produtos realmente novos
        .map(p => p.name.trim().toLowerCase());
        
      const duplicatesWithExisting = newNames.filter(name => existingNames.includes(name));
      
      if (duplicatesWithExisting.length > 0) {
        return NextResponse.json(
          { 
            error: "Nomes de produtos duplicados com existentes", 
            message: `Os seguintes nomes já existem: ${[...new Set(duplicatesWithExisting)].join(', ')}` 
          },
          { status: 400 }
        );
      }
      
      // Atualizar produtos existentes e adicionar novos
      const productMap = new Map();
      
      // Adicionar produtos existentes ao mapa
      existingProducts.forEach(product => {
        productMap.set(product.id, {
          id: product.id,
          name: product.name,
          procedureId: product.procedureId,
          productTypeId: product.productTypeId,
          productTier: product.productTier,
          productLifeCycle: product.productLifeCycle,
          isActive: product.isActive === undefined ? true : product.isActive
        });
      });
      
      // Atualizar com novos produtos
      products.forEach(product => {
        productMap.set(product.id, {
          id: product.id,
          name: product.name,
          procedureId: product.procedureId,
          productTypeId: product.productTypeId,
          productTier: product.productTier,
          productLifeCycle: product.productLifeCycle,
          isActive: product.isActive === undefined ? true : product.isActive
        });
      });
      
      // Converter mapa de volta para array
      const updatedProducts = Array.from(productMap.values());
      console.log(`[Debug] Total após mesclagem: ${updatedProducts.length} produtos`);
      
      // Forçar redis reset para garantir que estamos salvando corretamente
      await redis.del('products');
      console.log(`[Debug] Chave 'products' excluída para reset`);
      
      result = await setToRedis('products', updatedProducts);
    }
    
    // Verificar resultado
    const productsAfter = await PortfolioService.getProducts();
    
    // Verificar se o número esperado de produtos foi salvo
    const expectedCount = forceReplace ? products.length : (products.length + await PortfolioService.getProducts().then(p => p.length) - products.filter(p => p.id).length);
    const savedCount = productsAfter.length;
    
    if (productsAfter.length === 0) {
      return NextResponse.json({
        success: false,
        error: "Nenhum produto foi salvo no Redis",
        expectedCount,
        actualCount: savedCount,
        recommendation: "Verifique as configurações do Redis e tente novamente"
      }, { status: 500 });
    }
    
    return NextResponse.json({
      success: !!result && productsAfter.length > 0,
      result,
      message: result ? "Produtos salvos com sucesso" : "Falha ao salvar produtos",
      productCount: productsAfter.length,
      products: productsAfter
    });
  } catch (error) {
    console.error("[Debug] Erro ao salvar produtos:", error);
    return NextResponse.json(
      { error: "Falha ao salvar produtos", message: String(error) },
      { status: 500 }
    );
  }
} 