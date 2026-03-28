import { PrismaClient } from "@prisma/client"
const p = new PrismaClient()
try {
  const [gigs, users] = await Promise.all([p.gig.count(), p.user.count()])
  console.log("OK DB: gigs=", gigs, "users=", users)
} catch (e) {
  console.error("DB ERR:", e.message)
  process.exit(1)
} finally {
  await p.$disconnect()
}
