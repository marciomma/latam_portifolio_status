import { NextResponse } from "next/server";
import { PortfolioService } from "@/services/portfolio-service";
import { getFromRedis } from '@/lib/data';


export async function GET(req: Request) {
  const url = new URL(req.url)
  const key = url.searchParams.get("key") ?? "countries"
  const data = await getFromRedis<any>(key)
  return NextResponse.json({ key, count: data.length, data })
}
