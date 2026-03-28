import bcrypt from "bcryptjs"
import fs from "fs"

async function main() {
  const email = "admin@contractual.com"
  const pass = "Admin@55vuxww8"
  const h = await bcrypt.hash(pass, 12)
  const line = `\n# Workspace Admin Auth\nADMIN_EMAIL="${email}"\nADMIN_PASSWORD_HASH="${h}"\n`
  fs.appendFileSync(".env", line)
  console.log("Added admin credentials to .env")
}

main()
