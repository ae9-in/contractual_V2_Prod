"use client"

import { Suspense, useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn } from "next-auth/react"
import { toast } from "sonner"
import { Eye, EyeOff, Building2, Briefcase, Check, ArrowLeft, Users, Shield } from "lucide-react"
import { cn } from "@/lib/utils"

type AccountType = "business" | "freelancer" | null
type Step = 1 | 2

function RegisterPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [step, setStep] = useState<Step>(1)
  const [accountType, setAccountType] = useState<AccountType>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    companyName: "",
    agreeToTerms: false,
  })

  useEffect(() => {
    const r = searchParams.get("role")
    if (r === "business" || r === "freelancer") {
      setAccountType(r)
      setStep(2)
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (step === 1 && accountType) {
      setStep(2)
      return
    }
    if (step === 2 && accountType) {
      const role = accountType === "business" ? "BUSINESS" : "FREELANCER"
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: formData.fullName || formData.companyName || "New User",
          role,
        }),
      })
      const payload = await res.json().catch(() => ({}))
      const data = payload as { data?: { pendingApproval?: boolean }; error?: string }
      if (!res.ok) {
        toast.error(typeof data.error === "string" ? data.error : "Could not create account")
        return
      }
      if (data.data?.pendingApproval) {
        toast.success("Application submitted for review.")
        router.push(
          `/auth/pending-approval?email=${encodeURIComponent(formData.email)}`
        )
        return
      }
      const sign = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })
      if (sign?.error) {
        toast.success("Account created — sign in to continue.")
        router.push("/auth/signin")
        return
      }
      const me = await fetch("/api/me").then((r) => r.json())
      router.push(me.home ?? "/freelancer/dashboard")
      router.refresh()
    }
  }

  const updateFormData = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
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
            {/* Layered cards */}
            <div className="absolute -left-8 -bottom-8 w-[300px] h-[200px] bg-white/10 backdrop-blur rounded-2xl border border-white/20 -rotate-6" />
            <div className="absolute -left-4 -bottom-4 w-[300px] h-[200px] bg-white/15 backdrop-blur rounded-2xl border border-white/20 -rotate-3" />
            
            {/* Main card - Gig preview */}
            <div className="relative w-[300px] bg-white/20 backdrop-blur rounded-2xl border border-white/30 overflow-hidden">
              <div className="h-24 bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)]" />
              <div className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-white/90" />
                  <div>
                    <div className="h-3 w-20 bg-white/70 rounded mb-1" />
                    <div className="h-2 w-14 bg-white/50 rounded" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-2 w-full bg-white/50 rounded" />
                  <div className="h-2 w-3/4 bg-white/40 rounded" />
                </div>
              </div>
            </div>

            {/* Chat bubble */}
            <div className="absolute -bottom-4 -right-8 w-[180px] bg-white/20 backdrop-blur rounded-xl border border-white/30 p-4 animate-float-slow">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full bg-green-400" />
                <div className="h-2 w-16 bg-white/60 rounded" />
              </div>
              <div className="space-y-1">
                <div className="h-2 w-full bg-white/40 rounded" />
                <div className="h-2 w-2/3 bg-white/30 rounded" />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom testimonial */}
        <div className="relative z-10 bg-white/10 backdrop-blur rounded-2xl border border-white/20 p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-semibold">
              M
            </div>
            <div className="flex-1">
              <p className="text-white/90 text-sm leading-relaxed mb-3">
                &ldquo;I have tripled my income since joining Contractual. The quality of clients here is unmatched.&rdquo;
              </p>
              <p className="text-white font-medium text-sm">Michael Park</p>
              <p className="text-white/60 text-xs">Senior Developer</p>
            </div>
          </div>
        </div>

        {/* Floating badges */}
        <div className="absolute bottom-32 left-12 flex items-center gap-3">
          <div className="px-3 py-2 bg-white/10 backdrop-blur rounded-lg border border-white/20 flex items-center gap-2">
            <Users className="w-4 h-4 text-white/80" />
            <span className="text-white/80 text-sm">8,400+ Businesses</span>
          </div>
          <div className="px-3 py-2 bg-white/10 backdrop-blur rounded-lg border border-white/20 flex items-center gap-2">
            <Shield className="w-4 h-4 text-white/80" />
            <span className="text-white/80 text-sm">Trusted Platform</span>
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

          {/* Step indicator */}
          <div className="flex items-center gap-3 mb-8">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors",
              step >= 1 ? "bg-[var(--primary)] text-white" : "bg-[var(--bg-alt)] text-[var(--text-secondary)]"
            )}>
              {step > 1 ? <Check className="w-4 h-4" /> : "1"}
            </div>
            <div className={cn(
              "flex-1 h-1 rounded-full transition-colors",
              step >= 2 ? "bg-[var(--primary)]" : "bg-[var(--bg-alt)]"
            )} />
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors",
              step >= 2 ? "bg-[var(--primary)] text-white" : "bg-[var(--bg-alt)] text-[var(--text-secondary)]"
            )}>
              2
            </div>
          </div>

          {step === 1 ? (
            <>
              <h1 className="text-2xl md:text-[28px] font-bold text-[var(--text-primary)] mb-2">
                Join Contractual
              </h1>
              <p className="text-[var(--text-secondary)] mb-8">
                Choose how you want to use Contractual
              </p>

              {/* Account type selection */}
              <div className="space-y-4 mb-8">
                <button
                  type="button"
                  onClick={() => setAccountType("business")}
                  className={cn(
                    "w-full p-5 rounded-xl border-2 text-left transition-all",
                    accountType === "business"
                      ? "border-[var(--primary)] bg-[var(--primary-light)]"
                      : "border-[var(--border)] hover:border-[var(--primary-light)]"
                  )}
                >
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
                      accountType === "business"
                        ? "bg-[var(--primary)] text-white"
                        : "bg-[var(--bg-alt)] text-[var(--primary)]"
                    )}>
                      <Building2 className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-[var(--text-primary)]">{"I'm a Business"}</h3>
                        {accountType === "business" && (
                          <div className="w-5 h-5 rounded-full bg-[var(--primary)] flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-[var(--text-secondary)] mt-1">
                        Post gigs and hire skilled freelancers
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setAccountType("freelancer")}
                  className={cn(
                    "w-full p-5 rounded-xl border-2 text-left transition-all",
                    accountType === "freelancer"
                      ? "border-[var(--primary)] bg-[var(--primary-light)]"
                      : "border-[var(--border)] hover:border-[var(--primary-light)]"
                  )}
                >
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
                      accountType === "freelancer"
                        ? "bg-[var(--primary)] text-white"
                        : "bg-[var(--bg-alt)] text-[var(--primary)]"
                    )}>
                      <Briefcase className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-[var(--text-primary)]">{"I'm a Freelancer"}</h3>
                        {accountType === "freelancer" && (
                          <div className="w-5 h-5 rounded-full bg-[var(--primary)] flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-[var(--text-secondary)] mt-1">
                        Find gigs and grow your career
                      </p>
                    </div>
                  </div>
                </button>
              </div>

              <button
                onClick={() => accountType && setStep(2)}
                disabled={!accountType}
                className={cn(
                  "w-full py-3.5 rounded-xl text-base font-semibold transition-all duration-300",
                  accountType
                    ? "text-white bg-gradient-to-r from-[var(--primary)] to-[var(--primary-dark)] hover:scale-[1.02] hover:shadow-lg hover:shadow-[var(--shadow-teal)]"
                    : "text-[var(--text-secondary)] bg-[var(--bg-alt)] cursor-not-allowed"
                )}
              >
                Continue
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setStep(1)}
                className="flex items-center gap-1 text-[var(--text-secondary)] hover:text-[var(--primary)] mb-6 -ml-1"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm">Back</span>
              </button>

              <h1 className="text-2xl md:text-[28px] font-bold text-[var(--text-primary)] mb-2">
                Create your account
              </h1>
              <p className="text-[var(--text-secondary)] mb-8">
                {accountType === "business"
                  ? "Set up your business account"
                  : "Set up your freelancer profile"}
              </p>

              {/* Google SSO */}
              <button className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border border-[var(--border)] rounded-xl text-[var(--text-primary)] font-medium hover:bg-[var(--bg-alt)] hover:border-[var(--primary)] transition-all">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </button>

              {/* Divider */}
              <div className="flex items-center gap-4 my-6">
                <div className="flex-1 h-px bg-[var(--border)]" />
                <span className="text-sm text-[var(--text-secondary)]">or</span>
                <div className="flex-1 h-px bg-[var(--border)]" />
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                    Full Name
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => updateFormData("fullName", e.target.value)}
                    placeholder="John Doe"
                    className="w-full px-4 py-3 border border-[var(--border)] rounded-xl text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all"
                    required
                  />
                </div>

                {accountType === "business" && (
                  <div>
                    <label htmlFor="companyName" className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                      Company Name
                    </label>
                    <input
                      id="companyName"
                      type="text"
                      value={formData.companyName}
                      onChange={(e) => updateFormData("companyName", e.target.value)}
                      placeholder="Acme Inc."
                      className="w-full px-4 py-3 border border-[var(--border)] rounded-xl text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all"
                      required
                    />
                  </div>
                )}

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateFormData("email", e.target.value)}
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
                      value={formData.password}
                      onChange={(e) => updateFormData("password", e.target.value)}
                      placeholder="Create a strong password"
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

                <label className="flex items-start gap-3 cursor-pointer pt-2">
                  <input
                    type="checkbox"
                    checked={formData.agreeToTerms}
                    onChange={(e) => updateFormData("agreeToTerms", e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded border-[var(--border)] text-[var(--primary)] focus:ring-[var(--primary)] accent-[var(--primary)]"
                    required
                  />
                  <span className="text-sm text-[var(--text-secondary)]">
                    I agree to the{" "}
                    <Link href="/terms" className="text-[var(--primary)] hover:underline">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="text-[var(--primary)] hover:underline">
                      Privacy Policy
                    </Link>
                  </span>
                </label>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl text-base font-semibold text-white bg-gradient-to-r from-[var(--cta-amber)] to-[var(--cta-amber-dark)] hover:scale-[1.02] hover:shadow-lg hover:shadow-amber-500/25 transition-all duration-300"
                >
                  Create Account
                </button>
              </form>
            </>
          )}

          <p className="mt-8 text-center text-sm text-[var(--text-secondary)]">
            Already have an account?{" "}
            <Link
              href={accountType ? `/auth/signin?role=${accountType}` : "/auth/signin"}
              className="text-[var(--primary)] hover:text-[var(--primary-dark)] font-medium"
            >
              Sign In &rarr;
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-white text-[var(--text-secondary)]">
          Loading…
        </main>
      }
    >
      <RegisterPageInner />
    </Suspense>
  )
}
