import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ArrowLeft, Mail } from "lucide-react"

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a0b] p-4 text-white">
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute -left-20 top-20 h-64 w-64 rounded-full bg-blue-500 blur-[100px]" />
        <div className="absolute -right-20 bottom-20 h-64 w-64 rounded-full bg-purple-500 blur-[100px]" />
      </div>

      <Card className="relative w-full max-w-md border-white/10 bg-white/5 backdrop-blur-3xl shadow-2xl">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 border border-white/10">
            <Mail className="h-8 w-8 text-blue-400" />
          </div>
          <div>
            <CardTitle className="text-3xl font-black tracking-tighter text-white">Reset Access</CardTitle>
            <CardDescription className="text-white/40 text-sm font-medium">Verify your email to recover your account.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-4">
          <div className="space-y-3">
            <label className="text-xs font-black uppercase tracking-widest text-white/40">Email Address</label>
            <Input 
               placeholder="name@company.com" 
               type="email" 
               className="h-12 border-white/5 bg-white/5 text-sm font-medium placeholder:text-white/20 focus:border-blue-500/50 transition-all rounded-xl"
            />
          </div>
          <Button className="h-12 w-full bg-blue-600 font-black hover:bg-blue-500 rounded-xl transition-all shadow-lg shadow-blue-500/20">
            Send Recovery Link
          </Button>
          <div className="flex flex-col items-center gap-4 border-t border-white/5 pt-6">
            <Link href="/auth/signin" className="flex items-center gap-2 text-xs font-bold text-white/60 hover:text-white transition-colors">
              <ArrowLeft className="h-3 w-3" /> Back to Authorization
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
