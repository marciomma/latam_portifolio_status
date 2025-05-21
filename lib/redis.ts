// lib/redis.ts
import { Redis } from '@upstash/redis'

// Opções de retry
const MAX_RETRIES = 3
const RETRY_DELAY_MS = 300

// Manter uma única instância do cliente para reutilização
let redisClientInstance: Redis | null = null;

// Função para resetar a instância do cliente (útil para debug)
export const resetRedisClient = () => {
  redisClientInstance = null;
  console.log('Instância do cliente Redis resetada');
}

// Expor para testes
export const getRedisClientForTest = () => {
  return getRedisClient();
};

// Criar função de acesso ao Redis ao invés de instância global
// Isso evita problemas de inicialização durante build
export function getRedisClient() {
  // Se já temos uma instância, retornar ela
  if (redisClientInstance) {
    return redisClientInstance;
  }

  // Valores fixos para ambiente de desenvolvimento
  const defaultUrl = "https://united-mammal-20071.upstash.io";
  const defaultToken = "AU5nAAIjcDFmM2ZiZjU3NjMxZDQ0YWY1OTIyMmZlMzgxMDgzMTkzYXAxMA";
  
  // Tentar obter das variáveis de ambiente primeiro
  let url = process.env.UPSTASH_REDIS_REST_URL || '';
  let token = process.env.UPSTASH_REDIS_REST_TOKEN || '';
  
  // Remover aspas extras se existirem
  url = url.replace(/^["'](.*)["']$/, '$1');
  token = token.replace(/^["'](.*)["']$/, '$1');

  // Usar valores padrão se não estiverem definidos
  if (!url || url.length < 5) {
    console.log('Usando URL padrão do Redis para ambiente de desenvolvimento');
    url = defaultUrl;
  }
  
  if (!token || token.length < 5) {
    console.log('Usando token padrão do Redis para ambiente de desenvolvimento');
    token = defaultToken;
  }

  try {
    // Criar nova instância do cliente Redis com timeout
    redisClientInstance = new Redis({ 
      url, 
      token,
      retry: {
        retries: 3,        // Número de tentativas antes de falhar
        backoff: (retryCount) => Math.min(1000 * Math.pow(2, retryCount), 5000)  // Backoff exponencial com limite
      }
    });
    
    console.log('Cliente Redis inicializado com sucesso');
    return redisClientInstance;
  } catch (error) {
    console.error('Erro ao inicializar cliente Redis:', error);
    return null;
  }
}

// Função de sleep para retry
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Wrapper para métodos Redis com verificação de client e retry
export const redis = {
  async get(key: string) {
    const client = getRedisClient()
    if (!client) {
      console.error(`[Redis] Cliente não inicializado ao tentar GET ${key}`)
      return null
    }
    
    let retries = 0
    let lastError = null
    
    while (retries < MAX_RETRIES) {
      try {
        console.log(`[Redis] GET ${key} (tentativa ${retries + 1})`)
        const result = await client.get(key)
        console.log(`[Redis] GET ${key} - Sucesso: ${result ? 'dados recebidos' : 'null/vazio'}`)
        return result
      } catch (error) {
        lastError = error
        console.error(`[Redis] Erro GET ${key} (tentativa ${retries + 1}):`, error)
        retries++
        
        if (retries < MAX_RETRIES) {
          await sleep(RETRY_DELAY_MS * retries)
        }
      }
    }
    
    console.error(`[Redis] Falha em todas as ${MAX_RETRIES} tentativas de GET ${key}:`, lastError)
    return null
  },
  
  async set(key: string, value: any) {
    const client = getRedisClient()
    if (!client) {
      console.error(`[Redis] Cliente não inicializado ao tentar SET ${key}`)
      return null
    }
    
    let retries = 0
    let lastError = null
    
    while (retries < MAX_RETRIES) {
      try {
        console.log(`[Redis] SET ${key} (tentativa ${retries + 1})`)
        const result = await client.set(key, value)
        console.log(`[Redis] SET ${key} - Resultado: ${result}`)
        return result
      } catch (error) {
        lastError = error
        console.error(`[Redis] Erro SET ${key} (tentativa ${retries + 1}):`, error)
        retries++
        
        if (retries < MAX_RETRIES) {
          await sleep(RETRY_DELAY_MS * retries)
        }
      }
    }
    
    console.error(`[Redis] Falha em todas as ${MAX_RETRIES} tentativas de SET ${key}:`, lastError)
    return null
  },
  
  async keys(pattern: string) {
    const client = getRedisClient()
    if (!client) {
      console.error(`[Redis] Cliente não inicializado ao tentar KEYS ${pattern}`)
      return []
    }
    
    let retries = 0
    let lastError = null
    
    while (retries < MAX_RETRIES) {
      try {
        console.log(`[Redis] KEYS ${pattern} (tentativa ${retries + 1})`)
        const result = await client.keys(pattern)
        console.log(`[Redis] KEYS ${pattern} - Encontrados: ${result.length}`)
        return result
      } catch (error) {
        lastError = error
        console.error(`[Redis] Erro KEYS ${pattern} (tentativa ${retries + 1}):`, error)
        retries++
        
        if (retries < MAX_RETRIES) {
          await sleep(RETRY_DELAY_MS * retries)
        }
      }
    }
    
    console.error(`[Redis] Falha em todas as ${MAX_RETRIES} tentativas de KEYS ${pattern}:`, lastError)
    return []
  },
  
  async del(key: string) {
    const client = getRedisClient()
    if (!client) {
      console.error(`[Redis] Cliente não inicializado ao tentar DEL ${key}`)
      return null
    }
    
    let retries = 0
    let lastError = null
    
    while (retries < MAX_RETRIES) {
      try {
        console.log(`[Redis] DEL ${key} (tentativa ${retries + 1})`)
        const result = await client.del(key)
        console.log(`[Redis] DEL ${key} - Resultado: ${result}`)
        return result
      } catch (error) {
        lastError = error
        console.error(`[Redis] Erro DEL ${key} (tentativa ${retries + 1}):`, error)
        retries++
        
        if (retries < MAX_RETRIES) {
          await sleep(RETRY_DELAY_MS * retries)
        }
      }
    }
    
    console.error(`[Redis] Falha em todas as ${MAX_RETRIES} tentativas de DEL ${key}:`, lastError)
    return null
  }
}
