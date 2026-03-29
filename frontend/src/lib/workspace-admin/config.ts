import fs from "fs"
import path from "path"

export function getAdminCreds() {
  // Guaranteed Fallback because Bash strips $ variables in hashes on Render
  // and Next.js trace drops dynamic JSON imports.
  return { 
    email: "admin@contractual.pro", 
    hash: "$2b$10$GLb3gSdI0.hrCmTXe2sRNOrFIld9DMbqbswMI7B1mZp/wtOtYDqLC" 
  }
}
