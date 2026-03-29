"use client"

import { Suspense, useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn } from "next-auth/react"
import { toast } from "sonner"
import { Eye, EyeOff, Building2, Briefcase, Check, ArrowLeft, Users, Shield } from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"

type AccountType = "business" | "freelancer" | null
type Step = 1 | 2

import { FreelancerRegisterWizard } from "@/components/auth/register-wizard"
import { BusinessRegisterWizard } from "@/components/auth/business-register-wizard"

function RegisterPageInner() {
  const [accountType, setAccountType] = useState<AccountType>(null)
  const searchParams = useSearchParams()
  
  useEffect(() => {
    const r = searchParams.get("role")
    if (r === "business" || r === "freelancer") {
      setAccountType(r)
    }
  }, [searchParams])

  if (accountType === "freelancer") {
    return <FreelancerRegisterWizard />
  }

  if (accountType === "business") {
    return <BusinessRegisterWizard />
  }

  return (
    <main className="min-h-screen flex bg-white">
      {/* Left panel - Branding (40%) */}
      <div className="hidden lg:flex lg:w-[40%] relative bg-gradient-to-br from-[#0f172a] via-[#0f3460] to-[#1e4e5e] p-12 flex-col justify-between overflow-hidden text-white">
        <div className="absolute inset-0 opacity-10 pointer-events-none" 
          style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} 
        />
        
        <Link href="/" className="relative z-10 flex items-center gap-2">
          <Shield className="w-8 h-8 text-white" />
          <span className="text-2xl font-black text-white font-josefin tracking-tight">Contractual</span>
        </Link>

        {/* Center quote */}
        <div className="relative z-10 flex-1 flex items-center justify-center">
          <div className="max-w-[320px] text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center mx-auto mb-6 transform -rotate-6">
              <Users className="w-8 h-8 text-teal-400" />
            </div>
            <h2 className="text-3xl font-black font-josefin leading-tight mb-4">Start your journey with the best.</h2>
            <p className="text-white/60 font-medium">Join 20k+ businesses and 50k+ experts building the future of work.</p>
          </div>
        </div>

        <div className="relative z-10 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-8 shadow-2xl">
          <h2 className="text-2xl font-black text-white font-josefin mb-3">The platform for serious professionals.</h2>
          <p className="text-white/70 font-medium leading-relaxed">Secure contracts, verified payments, and elite gigs from verified global partners.</p>
          <div className="flex items-center gap-4 mt-6 pt-6 border-t border-white/10">
            <div className="flex -space-x-3">
              {[
                "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&q=80",
                "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&q=80",
                "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&q=80"
              ].map((url, i) => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-[#0f172a] overflow-hidden relative">
                  <Image src={url} alt="Expert" fill className="object-cover" />
                </div>
              ))}
            </div>
            <span className="text-sm font-bold text-white/80 tracking-wide uppercase italic">Trusted by experts</span>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-[60%] flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-[420px]">
          {!accountType ? (
            <div className="space-y-8">
              <div className="text-center">
                <h1 className="text-3xl font-black font-josefin text-[#0f172a]">Join Contractual</h1>
                <p className="text-gray-500 font-medium mt-1">Choose your path to get started</p>
              </div>

              <div className="grid gap-4">
                <button
                  onClick={() => setAccountType("business")}
                  className="p-6 rounded-2xl border-2 border-gray-100 hover:border-teal-500 hover:bg-teal-50 transition-all text-left flex items-start gap-4"
                >
                  <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center shrink-0">
                    <Building2 size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#0f172a]">I'm a Business</h3>
                    <p className="text-sm text-gray-500 font-medium">Post gigs and hire talent</p>
                  </div>
                </button>

                <button
                  onClick={() => setAccountType("freelancer")}
                  className="p-6 rounded-2xl border-2 border-gray-100 hover:border-teal-500 hover:bg-teal-50 transition-all text-left flex items-start gap-4"
                >
                  <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center shrink-0">
                    <Briefcase size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#0f172a]">I'm a Freelancer</h3>
                    <p className="text-sm text-gray-500 font-medium">Find work and earn ₹</p>
                  </div>
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </main>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading…</div>}>
      <RegisterPageInner />
    </Suspense>
  )
}
