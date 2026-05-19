import { prisma } from "@bs42/db"

// apps/store/app/api/cron/exchange-rate/route.ts
export async function GET(request: Request) {
  // Verify cron secret to prevent unauthorized calls
  const authHeader = request.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 })
  }

  try {
    const response = await fetch("https://api.exchangerate-api.com/v4/latest/USD")
    const data = await response.json()
    const rate = data.rates.GHS as number

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    await prisma.exchangeRate.upsert({
      where: { from_to_date: { from: "USD", to: "GHS", date: today } },
      create: { from: "USD", to: "GHS", rate, date: today },
      update: { rate, fetchedAt: new Date() },
    })

    return Response.json({ success: true, rate })
  } catch (error) {
    return Response.json({ success: false, error: String(error) }, { status: 500 })
  }
}
