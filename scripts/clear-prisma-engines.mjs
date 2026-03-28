/**
 * Remove generated Prisma client output before `prisma generate` so Windows
 * does not hit EPERM when replacing locked query engine files. Client output
 * lives under `prisma/generated/` (see schema `generator.output`).
 */
import { existsSync, rmSync, statSync } from "node:fs";
import { join } from "node:path";

const target = join(process.cwd(), "prisma", "generated");
if (existsSync(target) && statSync(target).isDirectory()) {
  try {
    rmSync(target, { recursive: true, force: true });
    console.log("[prisma] cleared:", target);
  } catch (e) {
    const err = /** @type {NodeJS.ErrnoException} */ (e);
    console.warn("[prisma] could not clear output dir:", err.message);
  }
}
