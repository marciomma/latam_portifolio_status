import { NextResponse } from "next/server";
import { resetRedisClient } from "@/lib/redis";
import { redis } from "@/lib/redis";

// GET - Resetar o cliente Redis
export async function GET() {
  try {
    console.log("[RedisReset] Resetando cliente Redis...");
    
    // Resetar o cliente Redis
    resetRedisClient();
    
    // Testar a nova conexão com uma operação simples
    const testKey = "__redis_reset_test__";
    await redis.set(testKey, "RESET_TEST");
    const testResult = await redis.get(testKey);
    await redis.del(testKey);
    
    return NextResponse.json({
      success: true,
      message: "Cliente Redis resetado com sucesso",
      testResult: {
        key: testKey,
        expectedValue: "RESET_TEST",
        actualValue: testResult,
        success: testResult === "RESET_TEST"
      }
    });
  } catch (error) {
    console.error("[RedisReset] Erro ao resetar cliente Redis:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Falha ao resetar cliente Redis", 
        message: String(error) 
      },
      { status: 500 }
    );
  }
} 