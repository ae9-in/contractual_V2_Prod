import fs from "fs"
import path from "path"

export function getAdminCreds() {
  const envEmail = process.env.ADMIN_EMAIL
  const envHash = process.env.ADMIN_PASSWORD_HASH
  
  if (envEmail && envHash) {
    return { email: envEmail, hash: envHash }
  }
  
  // Fallback 1: JSON Config
  try {
    const configPath = path.join(process.cwd(), "config", "admin-config.json")
    if (fs.existsSync(configPath)) {
      const data = JSON.parse(fs.readFileSync(configPath, "utf8"))
      if (data.email && data.hash) return { email: data.email, hash: data.hash }
    }
  } catch (e) {}

  // No admin credentials found.
  throw new Error("ADMIN_EMAIL or ADMIN_PASSWORD_HASH not configured.")
}
