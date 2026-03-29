"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Building2,
  ArrowLeft,
  Eye,
  EyeOff,
  Check,
  ChevronRight,
  Shield,
  Users,
  Globe,
  Clock,
  Briefcase,
  Mail,
  Lock,
  User,
  FileText,
  MapPin,
  Phone,
  CheckCircle2,
  Zap,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

/* ─────────── Constants ─────────── */

const INDUSTRIES = [
  "Technology",
  "Finance & Banking",
  "Healthcare",
  "E-Commerce",
  "Education",
  "Real Estate",
  "Marketing & Advertising",
  "Manufacturing",
  "Media & Entertainment",
  "Consulting",
  "Legal",
  "Other",
]

const COMPANY_SIZES = [
  { label: "1-10", desc: "Startup" },
  { label: "11-50", desc: "Small business" },
  { label: "51-200", desc: "Mid-market" },
  { label: "201-1000", desc: "Enterprise" },
  { label: "1000+", desc: "Corporation" },
]

const PASSWORD_REQUIREMENTS = [
  { label: "8+ characters", regex: /.{8,}/ },
  { label: "One uppercase", regex: /[A-Z]/ },
  { label: "One number", regex: /[0-9]/ },
  { label: "One special char", regex: /[^A-Za-z0-9]/ },
]

const PERKS = [
  { icon: <Shield className="w-5 h-5" />, title: "Vetted Talent Pool", desc: "Access pre-verified freelancers" },
  { icon: <Zap className="w-5 h-5" />, title: "Secure Contracts", desc: "Milestone-based escrow payments" },
  { icon: <Clock className="w-5 h-5" />, title: "Fast Matching", desc: "Find talent within 24 hours" },
]

/* ─────────── Component ─────────── */

export function BusinessRegisterWizard() {
  const router = useRouter()
  const [step, setStep] = useState(1) // 1 = Account, 2 = Company, 3 = Review
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Form state
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    companyName: "",
    companyDesc: "",
    industry: "",
    companySize: "",
    website: "",
    location: "",
    agreeToTerms: false,
  })

  const set = (key: string, val: any) => setForm((p) => ({ ...p, [key]: val }))

  // Validation
  const step1Valid =
    form.name.trim().length >= 2 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) &&
    form.password.length >= 8 &&
    /[A-Z]/.test(form.password) &&
    /[0-9]/.test(form.password) &&
    /[^A-Za-z0-9]/.test(form.password) &&
    form.password === form.confirmPassword

  const step2Valid =
    form.companyName.trim().length >= 2 &&
    form.industry.length > 0 &&
    form.companySize.length > 0

  const passwordStrength = useMemo(() => {
    let count = 0
    if (form.password.length >= 8) count++
    if (/[A-Z]/.test(form.password)) count++
    if (/[0-9]/.test(form.password)) count++
    if (/[^A-Za-z0-9]/.test(form.password)) count++
    if (count === 0) return { label: "", color: "bg-gray-200", pct: 0 }
    if (count <= 1) return { label: "Weak", color: "bg-red-500", pct: 25 }
    if (count === 2) return { label: "Fair", color: "bg-amber-500", pct: 50 }
    if (count === 3) return { label: "Strong", color: "bg-green-500", pct: 75 }
    return { label: "Very Strong", color: "bg-teal-500", pct: 100 }
  }, [form.password])

  const nextStep = () => {
    if (step === 1 && !step1Valid) {
      toast.error("Please fill all required fields correctly")
      return
    }
    if (step === 2 && !step2Valid) {
      toast.error("Company name, industry, and size are required")
      return
    }
    setStep((s) => Math.min(3, s + 1))
    window.scrollTo({ top: 0, behavior: "smooth" })
  }
  const prevStep = () => setStep((s) => Math.max(1, s - 1))

  const handleSubmit = async () => {
    if (!form.agreeToTerms) {
      toast.error("Please agree to the Terms of Service")
      return
    }
    setIsSubmitting(true)
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          name: form.name,
          role: "BUSINESS",
          companyName: form.companyName,
          onboardingData: {
            phone: form.phone,
            companyDesc: form.companyDesc,
            industry: form.industry,
            companySize: form.companySize,
            website: form.website,
            location: form.location,
          },
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Registration failed")
      }
      // Business accounts go to pending approval
      router.push(`/auth/pending-approval?email=${encodeURIComponent(form.email)}`)
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const steps = [
    { id: 1, label: "Account" },
    { id: 2, label: "Company" },
    { id: 3, label: "Review" },
  ]

  return (
    <div className="min-h-screen flex bg-white font-plus-jakarta">
      {/* ── Left Panel (40%) ── */}
      <div className="hidden lg:flex lg:w-[40%] bg-gradient-to-br from-[#0f172a] via-[#1e3a5f] to-[#0d9488] p-12 flex-col justify-between relative overflow-hidden text-white">
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />
        {/* Decorative blobs */}
        <div className="absolute top-20 right-[10%] w-64 h-64 rounded-full bg-teal-500 opacity-20 blur-3xl" />
        <div className="absolute bottom-32 left-[5%] w-80 h-80 rounded-full bg-blue-500 opacity-15 blur-3xl" />

        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-2 mb-16">
            <Shield className="w-8 h-8 text-white" />
            <span className="text-2xl font-black font-josefin tracking-tight">Contractual</span>
          </Link>

          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <h2 className="text-4xl font-black font-josefin leading-tight mb-4">
              Hire the best talent for your business
            </h2>
            <p className="text-lg text-white/70 font-medium">
              Post gigs, manage contracts, and pay securely — all in one platform.
            </p>
          </motion.div>
        </div>

        <div className="relative z-10 space-y-4">
          {PERKS.map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.15 }}
              className="flex items-center gap-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-5"
            >
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                {p.icon}
              </div>
              <div>
                <p className="font-bold text-sm">{p.title}</p>
                <p className="text-xs text-white/60">{p.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="relative z-10 flex items-center gap-3 mt-8">
          <div className="px-3 py-2 bg-white/10 backdrop-blur rounded-lg border border-white/20 flex items-center gap-2">
            <Users className="w-4 h-4 text-white/80" />
            <span className="text-white/80 text-sm">3,200+ Businesses</span>
          </div>
          <div className="px-3 py-2 bg-white/10 backdrop-blur rounded-lg border border-white/20 flex items-center gap-2">
            <Shield className="w-4 h-4 text-white/80" />
            <span className="text-white/80 text-sm">Admin Verified</span>
          </div>
        </div>
      </div>

      {/* ── Right Panel ── */}
      <div className="w-full lg:w-[58%] overflow-y-auto px-6 py-12 lg:px-20">
        <div className="max-w-[520px] mx-auto">
          {/* Mobile logo */}
          <Link href="/" className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-700 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-[#0f172a]">Contractual</span>
          </Link>

          {/* Back */}
          <Link
            href="/auth/register"
            className="inline-flex items-center gap-1 text-gray-400 font-bold text-xs uppercase hover:text-[#0f172a] mb-6"
          >
            <ArrowLeft size={14} /> Back
          </Link>

          {/* ── Progress Steps ── */}
          <div className="mb-10 relative flex items-center justify-between">
            <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -translate-y-1/2 -z-10" />
            <div
              className="absolute top-1/2 left-0 h-1 bg-teal-500 -translate-y-1/2 -z-10 transition-all duration-500"
              style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
            />
            {steps.map((s) => (
              <div key={s.id} className="flex flex-col items-center gap-2">
                <div
                  className={cn(
                    "w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500",
                    step > s.id
                      ? "bg-teal-500 text-white"
                      : step === s.id
                      ? "bg-white border-4 border-teal-500 text-teal-600 ring-8 ring-teal-50"
                      : "bg-white border-2 border-gray-200 text-gray-400"
                  )}
                >
                  {step > s.id ? <Check className="w-4 h-4" /> : s.id}
                </div>
                <span
                  className={cn(
                    "text-[10px] font-black uppercase tracking-wider",
                    step >= s.id ? "text-teal-600" : "text-gray-400"
                  )}
                >
                  {s.label}
                </span>
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {/* ────────── STEP 1: Account Details ────────── */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-7"
              >
                <div>
                  <h1 className="text-3xl font-black font-josefin text-[#0f172a]">Create your account</h1>
                  <p className="text-gray-500 font-medium mt-1">Your login credentials and contact info</p>
                </div>

                <div className="grid gap-5">
                  {/* Full Name */}
                  <div>
                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2 block">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={form.name}
                        onChange={(e) => set("name", e.target.value)}
                        placeholder="John Doe"
                        className="w-full h-12 pl-11 pr-4 rounded-xl border border-gray-200 text-sm font-semibold outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-50 transition-all"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2 block">
                      Business Email *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => set("email", e.target.value)}
                        placeholder="you@company.com"
                        className="w-full h-12 pl-11 pr-4 rounded-xl border border-gray-200 text-sm font-semibold outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-50 transition-all"
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2 block">
                      Phone Number
                    </label>
                    <div className="flex gap-2">
                      <div className="flex h-12 w-16 items-center justify-center rounded-xl border border-gray-200 bg-gray-50 text-sm font-bold">
                        🇮🇳 +91
                      </div>
                      <input
                        value={form.phone}
                        onChange={(e) => set("phone", e.target.value)}
                        placeholder="9876543210"
                        className="h-12 flex-1 rounded-xl border border-gray-200 px-4 text-sm font-semibold outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-50"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2 block">
                      Password *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={form.password}
                        onChange={(e) => set("password", e.target.value)}
                        placeholder="Create a strong password"
                        className="w-full h-12 pl-11 pr-12 rounded-xl border border-gray-200 text-sm font-semibold outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-50 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {form.password && (
                      <div className="mt-3 space-y-2">
                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                          <span className="text-gray-400">Security</span>
                          <span className={cn("text-xs", passwordStrength.color.replace("bg-", "text-"))}>
                            {passwordStrength.label}
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={cn("h-full transition-all duration-500", passwordStrength.color)}
                            style={{ width: `${passwordStrength.pct}%` }}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                          {PASSWORD_REQUIREMENTS.map((r) => {
                            const ok = r.regex.test(form.password)
                            return (
                              <div
                                key={r.label}
                                className={cn(
                                  "flex items-center gap-1.5 text-[10px] font-bold uppercase",
                                  ok ? "text-teal-600" : "text-gray-300"
                                )}
                              >
                                <div className={cn("w-1.5 h-1.5 rounded-full", ok ? "bg-teal-500" : "bg-gray-200")} />
                                {r.label}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2 block">
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="password"
                        value={form.confirmPassword}
                        onChange={(e) => set("confirmPassword", e.target.value)}
                        placeholder="Re-enter your password"
                        className={cn(
                          "w-full h-12 pl-11 pr-4 rounded-xl border text-sm font-semibold outline-none focus:ring-4 transition-all",
                          form.confirmPassword && form.password !== form.confirmPassword
                            ? "border-red-300 focus:border-red-500 focus:ring-red-50"
                            : form.confirmPassword && form.password === form.confirmPassword
                            ? "border-teal-300 focus:border-teal-500 focus:ring-teal-50"
                            : "border-gray-200 focus:border-teal-500 focus:ring-teal-50"
                        )}
                      />
                      {form.confirmPassword && form.password === form.confirmPassword && (
                        <CheckCircle2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-teal-500" />
                      )}
                    </div>
                    {form.confirmPassword && form.password !== form.confirmPassword && (
                      <p className="mt-1 text-xs text-red-500 font-medium">Passwords don&apos;t match</p>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={nextStep}
                  disabled={!step1Valid}
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-teal-500 to-teal-700 text-white font-black text-base shadow-xl shadow-teal-500/20 hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
                >
                  Continue <ChevronRight className="w-5 h-5" />
                </button>

                <p className="text-center text-sm text-gray-500">
                  Already registered?{" "}
                  <Link href="/auth/signin?role=business" className="text-teal-600 font-bold hover:underline">
                    Sign in
                  </Link>
                </p>
              </motion.div>
            )}

            {/* ────────── STEP 2: Company Details ────────── */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-7"
              >
                <div>
                  <h1 className="text-3xl font-black font-josefin text-[#0f172a]">Tell us about your company</h1>
                  <p className="text-gray-500 font-medium mt-1">This helps us verify your business</p>
                </div>

                <div className="grid gap-5">
                  {/* Company Name */}
                  <div>
                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2 block">
                      Company Name *
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={form.companyName}
                        onChange={(e) => set("companyName", e.target.value)}
                        placeholder="Acme Inc."
                        className="w-full h-12 pl-11 pr-4 rounded-xl border border-gray-200 text-sm font-semibold outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-50 transition-all"
                      />
                    </div>
                  </div>

                  {/* Industry */}
                  <div>
                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-3 block">
                      Industry *
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {INDUSTRIES.map((ind) => (
                        <button
                          key={ind}
                          type="button"
                          onClick={() => set("industry", ind)}
                          className={cn(
                            "px-3 py-2.5 rounded-xl border-2 text-xs font-bold transition-all text-center",
                            form.industry === ind
                              ? "border-teal-500 bg-teal-50 text-teal-700 shadow-md"
                              : "border-gray-100 text-gray-600 hover:border-gray-200"
                          )}
                        >
                          {ind}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Company Size */}
                  <div>
                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-3 block">
                      Company Size *
                    </label>
                    <div className="grid grid-cols-5 gap-2">
                      {COMPANY_SIZES.map((sz) => (
                        <button
                          key={sz.label}
                          type="button"
                          onClick={() => set("companySize", sz.label)}
                          className={cn(
                            "p-3 rounded-xl border-2 text-center transition-all",
                            form.companySize === sz.label
                              ? "border-teal-500 bg-teal-50 shadow-md"
                              : "border-gray-100 hover:border-gray-200"
                          )}
                        >
                          <p
                            className={cn(
                              "text-sm font-black",
                              form.companySize === sz.label ? "text-teal-700" : "text-gray-800"
                            )}
                          >
                            {sz.label}
                          </p>
                          <p className="text-[9px] text-gray-500 uppercase font-bold mt-0.5">{sz.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Company Description */}
                  <div>
                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2 block">
                      About your company
                    </label>
                    <textarea
                      value={form.companyDesc}
                      onChange={(e) => set("companyDesc", e.target.value)}
                      placeholder="Tell us what your company does, your mission, and what kind of talent you're looking for..."
                      rows={3}
                      className="w-full rounded-xl border border-gray-200 p-4 text-sm font-medium outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-50"
                    />
                  </div>

                  {/* Website & Location */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2 block">
                        Website
                      </label>
                      <div className="relative">
                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          value={form.website}
                          onChange={(e) => set("website", e.target.value)}
                          placeholder="yourcompany.com"
                          className="w-full h-12 pl-11 pr-4 rounded-xl border border-gray-200 text-sm font-semibold outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-50"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2 block">
                        Location
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          value={form.location}
                          onChange={(e) => set("location", e.target.value)}
                          placeholder="Mumbai, India"
                          className="w-full h-12 pl-11 pr-4 rounded-xl border border-gray-200 text-sm font-semibold outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-50"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="h-12 flex-1 rounded-xl border-2 border-gray-200 font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={nextStep}
                    disabled={!step2Valid}
                    className="h-12 flex-[2] rounded-xl bg-gradient-to-r from-teal-500 to-teal-700 text-white font-black text-base shadow-xl shadow-teal-500/20 hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
                  >
                    Continue <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ────────── STEP 3: Review ────────── */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-7"
              >
                <div>
                  <h1 className="text-3xl font-black font-josefin text-[#0f172a]">Review & Submit</h1>
                  <p className="text-gray-500 font-medium mt-1">
                    Confirm your details before submitting for approval
                  </p>
                </div>

                {/* Admin Notice */}
                <div className="rounded-2xl bg-amber-50 border border-amber-200 p-5">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                      <Clock className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-bold text-amber-900 text-sm">Admin Approval Required</p>
                      <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
                        Your business account will be reviewed by our team before activation. This usually takes{" "}
                        <strong>less than 24 hours</strong>. You&apos;ll receive an email once approved.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Summary Cards */}
                <div className="space-y-4">
                  {/* Account */}
                  <div className="rounded-2xl border border-gray-100 p-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Account Details</h3>
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="text-teal-600 text-xs font-bold hover:underline"
                      >
                        Edit
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <SummaryItem icon={<User className="w-4 h-4" />} label="Name" value={form.name} />
                      <SummaryItem icon={<Mail className="w-4 h-4" />} label="Email" value={form.email} />
                      {form.phone && (
                        <SummaryItem icon={<Phone className="w-4 h-4" />} label="Phone" value={`+91 ${form.phone}`} />
                      )}
                    </div>
                  </div>

                  {/* Company */}
                  <div className="rounded-2xl border border-gray-100 p-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Company Details</h3>
                      <button
                        type="button"
                        onClick={() => setStep(2)}
                        className="text-teal-600 text-xs font-bold hover:underline"
                      >
                        Edit
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <SummaryItem
                        icon={<Building2 className="w-4 h-4" />}
                        label="Company"
                        value={form.companyName}
                      />
                      <SummaryItem
                        icon={<Briefcase className="w-4 h-4" />}
                        label="Industry"
                        value={form.industry}
                      />
                      <SummaryItem icon={<Users className="w-4 h-4" />} label="Size" value={form.companySize} />
                      {form.website && (
                        <SummaryItem icon={<Globe className="w-4 h-4" />} label="Website" value={form.website} />
                      )}
                      {form.location && (
                        <SummaryItem icon={<MapPin className="w-4 h-4" />} label="Location" value={form.location} />
                      )}
                    </div>
                    {form.companyDesc && (
                      <p className="text-xs text-gray-500 mt-2 leading-relaxed border-t border-gray-50 pt-3">
                        {form.companyDesc}
                      </p>
                    )}
                  </div>
                </div>

                {/* Terms */}
                <label className="flex items-start gap-3 cursor-pointer p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={form.agreeToTerms}
                    onChange={(e) => set("agreeToTerms", e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 text-teal-600 focus:ring-teal-500 mt-0.5 accent-teal-500"
                  />
                  <span className="text-sm text-gray-600 leading-relaxed">
                    I agree to the{" "}
                    <Link href="/terms" className="text-teal-600 font-bold hover:underline">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="text-teal-600 font-bold hover:underline">
                      Privacy Policy
                    </Link>
                    . I understand my account will be reviewed by an admin before activation.
                  </span>
                </label>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="h-12 flex-1 rounded-xl border-2 border-gray-200 font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting || !form.agreeToTerms}
                    className="h-12 flex-[2] rounded-xl bg-gradient-to-r from-[#0f172a] to-[#1e3a5f] text-white font-black text-base shadow-xl shadow-gray-900/20 hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <FileText className="w-5 h-5" />
                        Submit for Approval
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

/* ─────────── Helper Components ─────────── */

function SummaryItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold text-gray-400 uppercase">{label}</p>
        <p className="text-sm font-semibold text-[#0f172a] truncate">{value}</p>
      </div>
    </div>
  )
}
