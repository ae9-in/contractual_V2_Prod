"use client"

import { Suspense, useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn } from "next-auth/react"
import { toast } from "sonner"
import { Eye, EyeOff, Shield, Users, TrendingUp, Building2, UserCircle } from "lucide-react"
import { cn } from "@/lib/utils"

function SignInPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [accountType, setAccountType] = useState<"business" | "freelancer">("business")

  useEffect(() => {
    const r = searchParams.get("role")
    if (r === "freelancer" || r === "business") setAccountType(r)
  }, [searchParams])

  const urlError = searchParams.get("error")
  const rejectReason = searchParams.get("reason")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const callbackUrl = searchParams.get("callbackUrl") ?? undefined
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    })
    if (res?.error) {
      toast.error("Invalid email or password")
      return
    }
    const me = await fetch("/api/me").then((r) => r.json())
    const target = callbackUrl && callbackUrl.startsWith("/") ? callbackUrl : me.home
    router.push(target ?? "/freelancer/dashboard")
    router.refresh()
  }

  return (
    <main className="min-h-screen flex">
      {/* Left panel - Visual */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-[#1a1a2e] via-[#0f3460] to-[#2d7a7e] p-12 flex-col justify-between overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-[10%] w-64 h-64 rounded-full bg-[var(--primary)] opacity-20 blur-3xl animate-float" />
          <div className="absolute bottom-40 right-[10%] w-80 h-80 rounded-full bg-cyan-500 opacity-15 blur-3xl animate-float-delayed" />
        </div>

        {/* Logo */}
        <Link href="/" className="relative z-10 flex items-center gap-2">
          <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="currentColor">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" fill="none" />
            </svg>
          </div>
          <span className="text-2xl font-bold text-white">Contractual</span>
        </Link>

        {/* Center illustration */}
        <div className="relative z-10 flex-1 flex items-center justify-center">
          <div className="relative">
            {/* Stacked cards mockup */}
            <div className="absolute -left-8 -bottom-8 w-[280px] h-[180px] bg-white/10 backdrop-blur rounded-2xl border border-white/20 -rotate-6" />
            <div className="absolute -left-4 -bottom-4 w-[280px] h-[180px] bg-white/15 backdrop-blur rounded-2xl border border-white/20 -rotate-3" />
            <div className="relative w-[280px] bg-white/20 backdrop-blur rounded-2xl border border-white/30 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-500" />
                <div>
                  <div className="h-3 w-24 bg-white/60 rounded mb-2" />
                  <div className="h-2 w-16 bg-white/40 rounded" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-2 w-full bg-white/40 rounded" />
                <div className="h-2 w-3/4 bg-white/30 rounded" />
              </div>
              <div className="flex items-center gap-2 mt-4">
                <span className="px-2 py-1 bg-green-500/30 text-green-300 text-xs font-medium rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                  Contract Signed
                </span>
              </div>
            </div>

            {/* Floating notification */}
            <div className="absolute -top-4 -right-8 px-4 py-3 bg-white/20 backdrop-blur rounded-xl border border-white/30 animate-bounce-subtle">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-amber-400" />
                <span className="text-white text-sm font-medium">+₹3,200 Earned</span>
              </div>
            </div>
          </div>
        </div>

        {/* Testimonial */}
        <div className="relative z-10 bg-white/10 backdrop-blur rounded-2xl border border-white/20 p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-semibold">
              S
            </div>
            <div className="flex-1">
              <p className="text-white/90 text-sm leading-relaxed mb-3">
                &ldquo;Just closed a ₹3,200 contract with a vetted developer. Contractual made it effortless.&rdquo;
              </p>
              <p className="text-white font-medium text-sm">Sarah K.</p>
              <p className="text-white/60 text-xs">CTO at LaunchPad</p>
            </div>
          </div>
        </div>

        {/* Floating badges */}
        <div className="absolute bottom-32 left-12 flex items-center gap-3">
          <div className="px-3 py-2 bg-white/10 backdrop-blur rounded-lg border border-white/20 flex items-center gap-2">
            <Users className="w-4 h-4 text-white/80" />
            <span className="text-white/80 text-sm">12,000+ Freelancers</span>
          </div>
          <div className="px-3 py-2 bg-white/10 backdrop-blur rounded-lg border border-white/20 flex items-center gap-2">
            <Shield className="w-4 h-4 text-white/80" />
            <span className="text-white/80 text-sm">Secure Contracts</span>
          </div>
        </div>
      </div>

      {/* Right panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 bg-white">
        <div className="w-full max-w-[420px]">
          {/* Mobile logo */}
          <Link href="/" className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] rounded-xl flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="currentColor">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" fill="none" />
              </svg>
            </div>
            <span className="text-2xl font-bold text-[var(--text-primary)]">Contractual</span>
          </Link>

          <h1 className="text-2xl md:text-[28px] font-bold text-[var(--text-primary)] mb-2">
            Welcome back
          </h1>
          <p className="text-[var(--text-secondary)] mb-6">
            Sign in to your Contractual account
          </p>

          {urlError === "rejected" && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
              Your account was not approved.
              {rejectReason ? ` Reason: ${decodeURIComponent(rejectReason)}` : ""}
            </div>
          )}
          {urlError === "suspended" && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
              Your account has been suspended. Contact support.
            </div>
          )}

          <div className="mb-8 grid grid-cols-2 gap-2 rounded-xl bg-[var(--bg-alt)] p-1">
            <button
              type="button"
              onClick={() => setAccountType("business")}
              className={cn(
                "flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-all",
                accountType === "business"
                  ? "bg-white text-[var(--text-primary)] shadow-sm"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              )}
            >
              <Building2 className="h-4 w-4" />
              Business
            </button>
            <button
              type="button"
              onClick={() => setAccountType("freelancer")}
              className={cn(
                "flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-all",
                accountType === "freelancer"
                  ? "bg-white text-[var(--text-primary)] shadow-sm"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              )}
            >
              <UserCircle className="h-4 w-4" />
              Freelancer
            </button>
          </div>

          {/* Google SSO */}
          <button
            type="button"
            onClick={() => signIn("google", { callbackUrl: "/" })}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border border-[var(--border)] rounded-xl text-[var(--text-primary)] font-medium hover:bg-[var(--bg-alt)] hover:border-[var(--primary)] transition-all"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-px bg-[var(--border)]" />
            <span className="text-sm text-[var(--text-secondary)]">or continue with email</span>
            <div className="flex-1 h-px bg-[var(--border)]" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 border border-[var(--border)] rounded-xl text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 pr-12 border border-[var(--border)] rounded-xl text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-[var(--border)] text-[var(--primary)] focus:ring-[var(--primary)] accent-[var(--primary)]"
                />
                <span className="text-sm text-[var(--text-primary)]">Remember me</span>
              </label>
              <Link href="/auth/forgot-password" className="text-sm text-[var(--primary)] hover:text-[var(--primary-dark)] font-medium">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl text-base font-semibold text-white bg-gradient-to-r from-[var(--primary)] to-[var(--primary-dark)] hover:scale-[1.02] hover:shadow-lg hover:shadow-[var(--shadow-teal)] transition-all duration-300"
            >
              Sign In
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-[var(--text-secondary)]">
            {"Don't have an account? "}
            <Link
              href={accountType === "business" ? "/auth/register?role=business" : "/auth/register?role=freelancer"}
              className="text-[var(--primary)] hover:text-[var(--primary-dark)] font-medium"
            >
              Join Free &rarr;
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-white text-[var(--text-secondary)]">
          Loading…
        </main>
      }
    >
      <SignInPageInner />
    </Suspense>
  )
}
