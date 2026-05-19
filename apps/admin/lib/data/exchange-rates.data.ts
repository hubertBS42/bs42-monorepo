import { formatError } from "@bs42/auth/server"
import { prisma } from "@bs42/db"
import { DataResponse } from "@bs42/types"

export async function getCurrentRate(): Promise<DataResponse<number>> {
  try {
    const rate = await prisma.exchangeRate.findFirst({
      where: { from: "USD", to: "GHS" },
      orderBy: { date: "desc" },
    })

    return {
      success: true,
      data: rate?.rate.toNumber() ?? 1,
    }
  } catch (error) {
    return { success: false, error: formatError(error) }
  }
}
