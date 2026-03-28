import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { ADMIN_SESSION_COOKIE, verifyAdminToken } from "@/lib/workspace-admin/jwt"
import { WorkspaceAdminShell } from "@/components/workspace-admin/workspace-admin-shell"

export default async function WorkspaceAdminShellLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const jar = await cookies()
  const t = jar.get(ADMIN_SESSION_COOKIE)?.value
  if (!t) redirect("/workspace-admin")
  try {
    await verifyAdminToken(t)
  } catch {
    redirect("/workspace-admin")
  }
  return <WorkspaceAdminShell>{children}</WorkspaceAdminShell>
}
