import bcrypt from "bcryptjs"
import crypto from "crypto"

async function generate() {
  const email = "admin@contractual.pro"
  const password = crypto.randomBytes(16).toString('hex')
  const secretKey = crypto.randomBytes(32).toString('base64')
  const hash = await bcrypt.hash(password, 12)

  console.log("\n=========================================")
  console.log("SECURE ADMIN CREDENTIALS GENERATED")
  console.log("=========================================")
  console.log(`Email: ${email}`)
  console.log(`Password: ${password}`)
  console.log(`\n--- ADD THESE TO YOUR .env ---`)
  console.log(`ADMIN_EMAIL=${email}`)
  console.log(`ADMIN_PASSWORD_HASH=${hash}`)
  console.log(`ADMIN_SECRET_KEY=${secretKey}`)
  console.log("=========================================\n")
}

generate()
