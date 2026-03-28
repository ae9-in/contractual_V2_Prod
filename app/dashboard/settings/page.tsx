"use client"

import { DashboardLayout } from "@/components/dashboard/layout"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"

export default function DashboardSettingsPage() {
  return (
    <DashboardLayout userType="business" userName="Alex Rivera">
      <div className="mx-auto max-w-xl space-y-6 rounded-2xl border border-[var(--border)] bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Settings</h1>
        <p className="text-sm text-[var(--text-secondary)]">Account preferences shared across business and freelancer workspaces.</p>
        <div className="space-y-4 border-t border-[var(--border)] pt-6">
          <div className="flex items-center justify-between">
            <Label htmlFor="2fa">Two-factor authentication</Label>
            <Switch id="2fa" />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="team">Team invitations</Label>
            <Switch id="team" defaultChecked />
          </div>
        </div>
        <Button className="rounded-xl bg-[var(--primary)]">Save changes</Button>
      </div>
    </DashboardLayout>
  )
}
