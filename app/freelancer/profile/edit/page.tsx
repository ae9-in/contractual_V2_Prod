"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"

const BORDER = "#e8ecf0"

export default function FreelancerProfileEditPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <Link
        href="/freelancer/profile"
        className="inline-flex items-center gap-2 text-[13px] font-semibold text-[#6d9c9f] hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to profile
      </Link>
      <div>
        <h1 className="font-bricolage text-2xl font-bold text-[#0f172a]">Edit Profile</h1>
        <p className="mt-1 text-[13px] text-[#94a3b8]">Visibility and skills shown to businesses on Contractual.</p>
      </div>
      <div className="space-y-2 rounded-[14px] border bg-white p-6" style={{ borderColor: BORDER }}>
        <div className="mb-1 flex justify-between text-sm">
          <span className="text-[#64748b]">Profile strength</span>
          <span className="font-mono font-semibold text-[#6d9c9f]">82%</span>
        </div>
        <Progress value={82} className="h-2" />
      </div>
      <div className="space-y-4 rounded-[14px] border bg-white p-6" style={{ borderColor: BORDER }}>
        <div className="space-y-2">
          <Label htmlFor="headline" className="text-[#0f172a]">
            Headline
          </Label>
          <Input
            id="headline"
            defaultValue="Senior product builder · React & Node"
            className="border-[#e8ecf0] focus-visible:border-[#6d9c9f] focus-visible:ring-[#6d9c9f]/20"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="bio" className="text-[#0f172a]">
            Bio
          </Label>
          <Textarea
            id="bio"
            rows={5}
            defaultValue="I ship reliable web apps with clear communication and milestones."
            className="border-[#e8ecf0] focus-visible:border-[#6d9c9f] focus-visible:ring-[#6d9c9f]/20"
          />
        </div>
        <Button
          type="button"
          className="bg-gradient-to-r from-[#6d9c9f] to-[#2d7a7e] font-semibold text-white hover:opacity-95"
        >
          Save changes
        </Button>
      </div>
    </div>
  )
}
