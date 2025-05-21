// lib/data.ts
import { redis } from "./redis"

export async function getFromRedis<T>(key: string): Promise<T[]> {
  const data = await redis.get(key)

  if (!data) return []

  // Se vier string, parse; se já for objeto/array, só devolve
  if (typeof data === "string") {
    try {
      return JSON.parse(data) as T[]
    } catch {
      // string não-JSON (ex.: “OK”); retorna vazio
      return []
    }
  }

  return data as T[]
}

export async function setToRedis<T>(key: string, value: T[]): Promise<"OK" | null> {
  // O client @upstash/redis já faz JSON.stringify para objetos/arrays,
  // então não precisamos (nem devemos) envolver em JSON.stringify aqui.
  return await redis.set(key, value)
}
