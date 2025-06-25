import { NextResponse } from "next/server";
import { getFromRedis } from '@/lib/data';

export async function GET(req: Request) {
  const url = new URL(req.url)
  const key = url.searchParams.get("key") ?? "countries"
  const data = await getFromRedis<unknown[]>(key)
  return NextResponse.json({ key, count: Array.isArray(data) ? data.length : 0, data })
}
