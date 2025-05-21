import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { setToRedis } from "@/lib/data";
import { PortfolioService } from "@/services/portfolio-service";

// GET - Resetar produtos
export async function GET(req: Request) {
  try {
    // Backup dos produtos existentes
    console.log("[API Reset] Fazendo backup dos produtos existentes...");
    const existingProducts = await PortfolioService.getProducts();
    
    if (existingProducts.length > 0) {
      console.log(`[API Reset] Backup de ${existingProducts.length} produtos realizado`);
      
      // Salvar backup
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      await redis.set(`products_backup_${timestamp}`, JSON.stringify(existingProducts));
      console.log(`[API Reset] Backup salvo como 'products_backup_${timestamp}'`);
    } else {
      console.log("[API Reset] Nenhum produto encontrado para backup");
    }

    // Deletar a chave de produtos
    console.log("[API Reset] Excluindo chave de produtos...");
    await redis.del("products");
    console.log("[API Reset] Chave de produtos excluída com sucesso");

    // Reinicializar com array vazio
    console.log("[API Reset] Inicializando produtos com array vazio...");
    const result = await setToRedis("products", []);
    console.log(`[API Reset] Inicialização concluída. Resultado: ${result}`);

    // Verificar se a inicialização foi bem-sucedida
    const verification = await redis.get("products");
    let verificationSuccess = false;
    
    if (verification && typeof verification === "string") {
      try {
        const parsed = JSON.parse(verification);
        if (Array.isArray(parsed)) {
          console.log("[API Reset] Verificação bem-sucedida: produtos inicializados como array vazio");
          verificationSuccess = true;
        } else {
          console.error("[API Reset] Verificação falhou: os produtos não são um array");
        }
      } catch (e) {
        console.error("[API Reset] Verificação falhou: JSON inválido");
      }
    } else {
      console.error(`[API Reset] Verificação falhou: tipo inesperado (${typeof verification})`);
    }

    return NextResponse.json({
      success: !!result && verificationSuccess,
      message: "Reset de produtos concluído com sucesso",
      backup: {
        count: existingProducts.length,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error("[API Reset] Erro durante reset de produtos:", error);
    return NextResponse.json(
      { error: "Falha ao resetar produtos", message: String(error) },
      { status: 500 }
    );
  }
} 