// lib/redis.ts
import { Redis } from '@upstash/redis'

// Criar função de acesso ao Redis ao invés de instância global
// Isso evita problemas de inicialização durante build
const getRedisClient = () => {
  let url = process.env.UPSTASH_REDIS_REST_URL || ''
  let token = process.env.UPSTASH_REDIS_REST_TOKEN || ''
  
  // Remover aspas extras se existirem
  url = url.replace(/^["'](.*)["']$/, '$1')
  token = token.replace(/^["'](.*)["']$/, '$1')

  if (!url || !token) {
    console.warn('Redis URL ou token não configurados')
    return null
  }

  return new Redis({ url, token })
}

// Wrapper para métodos Redis com verificação de client
export const redis = {
  async get(key: string) {
    const client = getRedisClient()
    if (!client) return null
    return client.get(key)
  },
  
  async set(key: string, value: any) {
    const client = getRedisClient()
    if (!client) return null
    return client.set(key, value)
  },
  
  async keys(pattern: string) {
    const client = getRedisClient()
    if (!client) return []
    return client.keys(pattern)
  }
}
