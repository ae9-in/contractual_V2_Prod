import bcrypt from "bcryptjs"
import { PrismaClient, Role, ApprovalStatus } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  const email = "admin@contractual.com"
  const password = "Admin@" + Math.random().toString(36).slice(-8)
  const name = "System Administrator"

  const passwordHash = await bcrypt.hash(password, 12)

  await prisma.user.upsert({
    where: { email },
    update: { passwordHash, role: Role.ADMIN, approvalStatus: ApprovalStatus.APPROVED },
    create: {
      email,
      name,
      passwordHash,
      role: Role.ADMIN,
      approvalStatus: ApprovalStatus.APPROVED,
    },
  })

  const creds = `-----------------------------------------
Admin User (Upserted)
Email: ${email}
Password: ${password}
Keep these credentials safe.
-----------------------------------------`

  console.log(creds)
  require("fs").writeFileSync("admin_creds.txt", creds)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => {
    void prisma.$disconnect()
  })
