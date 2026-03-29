import bcrypt from "bcryptjs"
import crypto from "crypto"
import fs from "fs"

async function generate() {
  const email = "admin@contractual.pro"
  const password = crypto.randomBytes(16).toString('hex')
  const secretKey = crypto.randomBytes(32).toString('base64')
  const hash = await bcrypt.hash(password, 12)

  const output = `
=========================================
SECURE ADMIN CREDENTIALS GENERATED
=========================================
Email: ${email}
Password: ${password}

--- ADD THESE TO YOUR .env ---
ADMIN_EMAIL=${email}
ADMIN_PASSWORD_HASH=${hash}
ADMIN_SECRET_KEY=${secretKey}
=========================================
`
  fs.writeFileSync("admin_final.txt", output)
  console.log("Credentials written to admin_final.txt")
}

generate()
