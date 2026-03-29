"use client"

import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { useSession } from "next-auth/react"
import { User, Bell, Shield, CreditCard, LogOut, Building2 } from "lucide-react"
import { signOut } from "next-auth/react"

export default function BusinessSettingsPage() {
  const { data: session } = useSession()

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-black font-bricolage text-[#0f172a]">Settings</h1>
        <p className="text-[#64748b] font-medium mt-1">Manage your business account and team preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-8">
        {/* Sidebar Nav */}
        <aside className="space-y-1">
          <SettingsNavButton icon={<Building2 size={16} />} label="Company Details" active />
          <SettingsNavButton icon={<User size={16} />} label="Team Members" />
          <SettingsNavButton icon={<Bell size={16} />} label="Notifications" />
          <SettingsNavButton icon={<Shield size={16} />} label="Security" />
          <SettingsNavButton icon={<CreditCard size={16} />} label="Billing" />
          <div className="h-4" />
          <button 
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50 transition-all font-bricolage"
          >
            <LogOut size={16} /> 
            Sign Out
          </button>
        </aside>

        {/* Content */}
        <div className="space-y-6">
          <div className="rounded-[24px] border border-[#e2e8f0] bg-white p-8 shadow-sm">
            <h2 className="text-lg font-bold text-[#0f172a] mb-6 font-bricolage">Business Information</h2>
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label className="text-[11px] font-black uppercase text-[#94a3b8] tracking-widest">Company Name</Label>
                <input 
                  className="h-11 w-full rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-4 text-sm font-bold focus:border-[#6d9c9f] focus:outline-none transition-all"
                  defaultValue={session?.user?.name || ""}
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-[11px] font-black uppercase text-[#94a3b8] tracking-widest">Contact Email</Label>
                <input 
                  className="h-11 w-full rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-4 text-sm font-bold text-[#94a3b8] cursor-not-allowed"
                  defaultValue={session?.user?.email || ""}
                  disabled
                />
              </div>
            </div>
          </div>

          <div className="rounded-[24px] border border-[#e2e8f0] bg-white p-8 shadow-sm">
            <h2 className="text-lg font-bold text-[#0f172a] mb-6 font-bricolage">Preferences</h2>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-[#0f172a]">New Application Alerts</p>
                  <p className="text-xs text-[#64748b] font-medium">Get notified immediately when someone applies</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="h-px bg-[#f8fafc]" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-[#0f172a]">Public Company Page</p>
                  <p className="text-xs text-[#64748b] font-medium">Allow freelancers to view your company history</p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" className="h-11 rounded-xl px-6 font-bold text-[13px]">Discard</Button>
            <Button className="h-11 rounded-xl px-8 bg-[#0f172a] hover:bg-[#1e293b] font-bold text-[13px] text-white">Save Changes</Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function SettingsNavButton({ icon, label, active }: { icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <button className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all font-bricolage ${active ? 'bg-[#e8f4f5] text-[#2d7a7e]' : 'text-[#64748b] hover:bg-[#f8fafc] hover:text-[#0f172a]'}`}>
      {icon}
      {label}
    </button>
  )
}
