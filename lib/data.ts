import { redis } from './redis'

export async function getFromRedis<T>(key: string): Promise<T[]> {
  const data = await redis.get(key)
  return data ? (data as T[]) : []
}

export async function setToRedis<T>(key: string, value: T[]): Promise<string | null> {
  return await redis.set(key, JSON.stringify(value))
}
