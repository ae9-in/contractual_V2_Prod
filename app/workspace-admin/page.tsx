"use client"

import { useState } from "react"
import {
  AlertTriangle,
  Eye,
  EyeOff,
  Key,
  Loader2,
  Mail,
  ShieldCheck,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export default function WorkspaceAdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [code, setCode] = useState("")
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch("/api/workspace-admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, captchaToken: undefined }),
      })
      const text = await res.text()
      let j: { data?: { success?: boolean }; error?: string } = {}
      if (text) {
        try {
          j = JSON.parse(text) as typeof j
        } catch {
          j = { error: text.slice(0, 200) }
        }
      }
      if (!res.ok) {
        toast.error(j.error ?? "Invalid credentials")
        return
      }
      toast.success("Welcome")
      router.push("/workspace-admin/dashboard")
      router.refresh()
    } catch {
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0f172a] px-4 py-12">
      <div
        className="w-full max-w-[420px] rounded-2xl border border-white/[0.08] bg-[#1e293b] p-10 shadow-[0_25px_60px_rgba(0,0,0,0.5)]"
        style={{ padding: 40 }}
      >
        <div className="mb-6 text-center">
          <div className="mb-3 flex justify-center">
            <ShieldCheck className="h-8 w-8 text-[#6d9c9f]" strokeWidth={1.5} />
          </div>
          <h1 className="font-display text-[22px] font-extrabold text-white">Workspace Admin</h1>
          <p className="mt-1 text-[12px] font-medium text-[#ef4444]">Restricted Access Only</p>
          <div className="my-6 h-px bg-white/[0.06]" />
        </div>

        <form onSubmit={(e) => void onSubmit(e)} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-[12px] font-semibold text-[#94a3b8]">
              Admin Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#64748b]" />
              <input
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 w-full rounded-lg border border-white/10 bg-[#0f172a] py-0 pl-10 pr-3.5 text-sm text-white placeholder:text-[#64748b] outline-none focus:border-[#6d9c9f] focus:ring-2 focus:ring-[#6d9c9f]/20"
                required
              />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-[12px] font-semibold text-[#94a3b8]">
              Admin Password
            </label>
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 w-full rounded-lg border border-white/10 bg-[#0f172a] py-0 pl-3.5 pr-11 text-sm text-white outline-none focus:border-[#6d9c9f] focus:ring-2 focus:ring-[#6d9c9f]/20"
                required
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748b] hover:text-white"
              >
                {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-[12px] font-semibold text-[#94a3b8]">
              Security Code (if prompted)
            </label>
            <div className="relative">
              <Key className="absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#64748b]" />
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="h-11 w-full rounded-lg border border-white/10 bg-[#0f172a] py-0 pl-10 pr-3.5 text-sm text-white outline-none focus:border-[#6d9c9f] focus:ring-2 focus:ring-[#6d9c9f]/20"
                placeholder="Optional"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-5 flex h-[46px] w-full items-center justify-center rounded-[10px] bg-gradient-to-br from-[#6d9c9f] to-[#2d7a7e] text-[15px] font-bold text-white disabled:opacity-80"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying...
              </>
            ) : (
              "Access Admin Panel"
            )}
          </button>
        </form>

        <p className="mt-4 flex items-start justify-center gap-1.5 text-center text-[11px] text-[#64748b]">
          <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0 text-[#f59e0b]" />
          Unauthorized access attempts are logged and reported.
        </p>
      </div>
    </div>
  )
}
