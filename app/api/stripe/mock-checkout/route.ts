import { NextResponse } from "next/server"
import { z } from "zod"

const bodySchema = z.object({
  amount: z.number().positive(),
  currency: z.string().default("usd"),
  metadata: z.record(z.string()).optional(),
})

/** Mock Stripe checkout — returns a fake client secret and intent id */
export async function POST(req: Request) {
  try {
    const json = await req.json()
    const parsed = bodySchema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 })
    }
    const id = `pi_mock_${Date.now()}`
    return NextResponse.json({
      id,
      clientSecret: `${id}_secret_mock`,
      status: "requires_payment_method",
      amount: parsed.data.amount,
      currency: parsed.data.currency,
      mock: true,
    })
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
