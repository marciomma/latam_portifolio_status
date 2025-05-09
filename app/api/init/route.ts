// app/api/init-db/route.ts
import { NextResponse } from "next/server"
import { PortfolioService } from "@/services/portfolio-service"

export async function GET() {
  try {
    await PortfolioService.initializeData()
    return NextResponse.json({ success: true, message: "Database initialized successfully" })
  } catch (error) {
    console.error("Error initializing database:", error)
    return NextResponse.json({ success: false, message: "Failed to initialize database" }, { status: 500 })
  }
}
