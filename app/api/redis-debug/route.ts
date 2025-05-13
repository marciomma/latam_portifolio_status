import { NextResponse } from "next/server";
import { redis } from '@/lib/redis';

export async function GET() {
  try {
    // Listar todas as chaves
    const keys = await redis.keys('*');
    
    // Obter dados básicos se houver chaves
    const countriesData = await redis.get('countries');
    const countriesCount = countriesData ? 
      (Array.isArray(countriesData) ? countriesData.length : 
      (typeof countriesData === 'string' ? JSON.parse(countriesData).length : 0)) : 0;
    
    // Informações de conexão (sem expor tokens)
    const connectionInfo = {
      hasUrl: !!process.env.UPSTASH_REDIS_REST_URL,
      hasToken: !!process.env.UPSTASH_REDIS_REST_TOKEN
    };
    
    return NextResponse.json({
      status: 'ok',
      connection: connectionInfo,
      keys,
      countriesCount,
      environment: process.env.NODE_ENV
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      environment: process.env.NODE_ENV
    }, { status: 500 });
  }
} 