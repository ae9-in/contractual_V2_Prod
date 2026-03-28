import { PrismaClient, Role } from "./generated/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  const hash = await bcrypt.hash("password123", 12)

  await prisma.user.upsert({
    where: { email: "freelancer@demo.contractual" },
    create: {
      email: "freelancer@demo.contractual",
      name: "Jordan Lee",
      role: Role.FREELANCER,
      passwordHash: hash,
    },
    update: { name: "Jordan Lee", role: Role.FREELANCER, passwordHash: hash },
  })

  await prisma.user.upsert({
    where: { email: "business@demo.contractual" },
    create: {
      email: "business@demo.contractual",
      name: "Alex Johnson",
      role: Role.BUSINESS,
      companyName: "TechCorp",
      passwordHash: hash,
    },
    update: {
      name: "Alex Johnson",
      role: Role.BUSINESS,
      companyName: "TechCorp",
      passwordHash: hash,
    },
  })

  await prisma.user.upsert({
    where: { email: "admin@demo.contractual" },
    create: {
      email: "admin@demo.contractual",
      name: "Ops Admin",
      role: Role.ADMIN,
      passwordHash: hash,
    },
    update: { name: "Ops Admin", role: Role.ADMIN, passwordHash: hash },
  })

  console.log("Seeded demo users (password: password123):")
  console.log("  - freelancer@demo.contractual (FREELANCER)")
  console.log("  - business@demo.contractual (BUSINESS)")
  console.log("  - admin@demo.contractual (ADMIN)")
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e)
    prisma.$disconnect()
    process.exit(1)
  })
