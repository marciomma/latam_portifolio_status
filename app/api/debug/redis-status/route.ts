import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";

// GET - Verificar status do Redis
export async function GET() {
  try {
    console.log("[RedisStatus] Verificando conexão com Redis...");
    
    // Testar conexão com ping
    let pingResult: string | null = null;
    let pingError: string | null = null;
    
    try {
      // Tentar obter cliente e executar ping diretamente
      let pingSuccess = false;
      
      try {
        // Usar o wrapper do redis para ping (simulando-o com get)
        const testKey = "__ping_test__";
        await redis.set(testKey, "PING");
        const result = await redis.get(testKey);
        pingResult = result ? "PONG" : null;
        await redis.del(testKey);
        pingSuccess = true;
      } catch (pingErr) {
        console.error("[RedisStatus] Erro ao simular ping:", pingErr);
      }
      
      if (!pingSuccess) {
        console.log("[RedisStatus] Cliente não disponível para ping direto");
      }
    } catch (error) {
      pingError = String(error);
      console.error("[RedisStatus] Erro ao executar ping:", error);
    }
    
    // Tentar obter todas as chaves
    let keys: string[] = [];
    let keysError: string | null = null;
    
    try {
      keys = await redis.keys("*") || [];
      console.log(`[RedisStatus] Encontradas ${keys.length} chaves`);
    } catch (error) {
      keysError = String(error);
      console.error("[RedisStatus] Erro ao obter chaves:", error);
    }
    
    // Tentar obter dados de produtos
    interface ProductsInfo {
      count?: number;
      type: string;
      sample?: unknown;
      length?: number;
      value?: unknown;
    }
    
    let products: ProductsInfo | null = null;
    let productsError: string | null = null;
    
    try {
      const productsData = await redis.get("products");
      if (productsData) {
        if (Array.isArray(productsData)) {
          products = {
            count: productsData.length,
            type: "array",
            sample: productsData.slice(0, 2)
          };
        } else if (typeof productsData === "string") {
          try {
            const parsed = JSON.parse(productsData);
            products = {
              count: Array.isArray(parsed) ? parsed.length : 1,
              type: "string (parsed JSON)",
              sample: Array.isArray(parsed) ? parsed.slice(0, 2) : parsed
            };
          } catch {
            products = {
              type: "string (not JSON)",
              length: productsData.length,
              sample: productsData.substring(0, 100) + "..."
            };
          }
        } else {
          products = {
            type: typeof productsData,
            value: productsData
          };
        }
      } else {
        products = {
          type: "null/undefined",
          value: null
        };
      }
    } catch (error) {
      productsError = String(error);
      console.error("[RedisStatus] Erro ao obter produtos:", error);
    }
    
    // Preparar informações sobre ambiente
    const environment = {
      node_env: process.env.NODE_ENV,
      redis_url_defined: !!process.env.UPSTASH_REDIS_REST_URL,
      redis_token_defined: !!process.env.UPSTASH_REDIS_REST_TOKEN
    };
    
    // Retornar todas as informações coletadas
    return NextResponse.json({
      status: "online",
      timestamp: new Date().toISOString(),
      environment,
      redis: {
        ping: {
          success: pingResult === "PONG",
          result: pingResult,
          error: pingError
        },
        keys: {
          success: Array.isArray(keys),
          count: keys.length,
          list: keys,
          error: keysError
        },
        products: {
          success: products !== null,
          data: products,
          error: productsError
        }
      }
    });
  } catch (error) {
    console.error("[RedisStatus] Erro geral:", error);
    return NextResponse.json(
      { 
        status: "error", 
        message: String(error),
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
} 