import { PrismaClient, GigStatus } from "@prisma/client"
const prisma = new PrismaClient()
const where = { status: GigStatus.OPEN }
try {
  const rows = await prisma.gig.findMany({
    where,
    take: 5,
    include: {
      business: {
        select: {
          id: true,
          name: true,
          image: true,
          isVerified: true,
          companyName: true,
        },
      },
      requiredSkills: true,
      _count: { select: { applications: true } },
    },
  })
  console.log("OK rows:", rows.length)
} catch (e) {
  console.error("ERR", e)
  process.exit(1)
} finally {
  await prisma.$disconnect()
}
