import { NextResponse } from "next/server";
import { redis } from '@/lib/redis';

export async function GET(req: Request) {
  try {
    // Obter a URL da requisição
    const url = new URL(req.url);
    
    // Obter o parâmetro "key" da query string (opcional)
    const key = url.searchParams.get("key");
    
    if (key) {
      // Se uma chave específica foi solicitada, retornar apenas seus dados
      const value = await redis.get(key);
      return NextResponse.json({ 
        key, 
        dataType: typeof value,
        isArray: Array.isArray(value),
        isEmpty: value === null || (Array.isArray(value) && value.length === 0),
        sample: value ? (Array.isArray(value) ? value.slice(0, 2) : value) : null
      });
    } else {
      // Caso contrário, listar todas as chaves e seus tamanhos
      const keys = await redis.keys("*");
      
      // Obter os dados para cada chave
      const data = await Promise.all(
        keys.map(async (key) => {
          const value = await redis.get(key);
          let size = 0;
          let type: string = typeof value;
          
          if (value) {
            if (Array.isArray(value)) {
              size = value.length;
              type = "array";
            } else if (typeof value === "string") {
              try {
                const parsed = JSON.parse(value);
                size = Array.isArray(parsed) ? parsed.length : 1;
                type = Array.isArray(parsed) ? "json_array" : "json_object";
              } catch {
                size = value.length;
                type = "string";
              }
            } else if (typeof value === "object") {
              size = Object.keys(value).length;
              type = "object";
            }
          }
          
          return { key, type, size };
        })
      );
      
      return NextResponse.json({ keys: data });
    }
  } catch (error) {
    console.error("Erro ao verificar dados:", error);
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
} 