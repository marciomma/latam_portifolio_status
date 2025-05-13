// lib/data.ts
import { redis } from "./redis"

/**
 * Lê lista armazenada no Redis.
 * Aceita tanto string JSON quanto objeto/array já parseado.
 */
export async function getFromRedis<T>(key: string): Promise<T[]> {
  const data = await redis.get(key)

  if (!data) return []

  if (typeof data === "string") {
    try {
      return JSON.parse(data) as T[]
    } catch {
      return []
    }
  }

  return data as T[]
}

/**
 * Salva lista como string JSON.
 * O @upstash/redis devolve uma string (geralmente "OK") em sucesso ou null em erro.
 */
export async function setToRedis<T>(key: string, value: T[]): Promise<string | null> {
  return await redis.set(key, JSON.stringify(value))
}
