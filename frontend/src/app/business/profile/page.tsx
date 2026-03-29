"use client"

import { type ReactNode, useEffect, useState } from "react"
import { Building2, Save } from "lucide-react"
import { toast } from "sonner"

type BusinessProfile = {
  id: string
  email: string
  name: string
  phone: string | null
  companyName: string | null
  companyDesc: string | null
  industry: string | null
  companySize: string | null
  website: string | null
  location: string | null
  address: string | null
  city: string | null
  state: string | null
  country: string | null
  pinCode: string | null
  approvalStatus: string
}

type FormState = {
  name: string
  phone: string
  companyName: string
  companyDesc: string
  industry: string
  companySize: string
  website: string
  location: string
  address: string
  city: string
  state: string
  country: string
  pinCode: string
}

function toForm(p: BusinessProfile): FormState {
  return {
    name: p.name || "",
    phone: p.phone || "",
    companyName: p.companyName || "",
    companyDesc: p.companyDesc || "",
    industry: p.industry || "",
    companySize: p.companySize || "",
    website: p.website || "",
    location: p.location || "",
    address: p.address || "",
    city: p.city || "",
    state: p.state || "",
    country: p.country || "",
    pinCode: p.pinCode || "",
  }
}

export default function BusinessProfilePage() {
  const [profile, setProfile] = useState<BusinessProfile | null>(null)
  const [form, setForm] = useState<FormState | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const res = await fetch("/api/business/profile", { cache: "no-store" })
        const j = (await res.json()) as { data?: BusinessProfile; error?: string }
        if (!res.ok) throw new Error(j.error ?? "Failed to load profile")
        if (!active || !j.data) return
        setProfile(j.data)
        setForm(toForm(j.data))
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to load profile")
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [])

  const onChange = (key: keyof FormState, value: string) => {
    if (!form) return
    setForm({ ...form, [key]: value })
  }

  const onSave = async () => {
    if (!form) return
    setSaving(true)
    try {
      const res = await fetch("/api/business/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const j = (await res.json()) as { data?: BusinessProfile; error?: string }
      if (!res.ok) throw new Error(j.error ?? "Failed to save profile")
      if (j.data) {
        setProfile(j.data)
        setForm(toForm(j.data))
      }
      toast.success("Business profile updated")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save profile")
    } finally {
      setSaving(false)
    }
  }

  if (loading || !form) {
    return <div className="rounded-xl border border-[#e2e8f0] bg-white p-6 text-sm text-[#64748b]">Loading profile...</div>
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="rounded-xl border border-[#e2e8f0] bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#e8f4f5]">
            <Building2 className="h-5 w-5 text-[#2d7a7e]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#0f172a]">Business Profile</h1>
            <p className="text-sm text-[#64748b]">Update your business account details and contact info.</p>
          </div>
          <span className="ml-auto rounded-full bg-[#f1f5f9] px-3 py-1 text-xs font-semibold text-[#475569]">
            {profile?.approvalStatus}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-[#e2e8f0] bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-[#64748b]">Primary Contact</h2>
          <div className="space-y-4">
            <Field label="Name">
              <input className="input" value={form.name} onChange={(e) => onChange("name", e.target.value)} />
            </Field>
            <Field label="Email">
              <input className="input cursor-not-allowed bg-[#f8fafc] text-[#94a3b8]" value={profile?.email || ""} disabled />
            </Field>
            <Field label="Phone">
              <input className="input" value={form.phone} onChange={(e) => onChange("phone", e.target.value)} />
            </Field>
            <Field label="Website">
              <input className="input" value={form.website} onChange={(e) => onChange("website", e.target.value)} />
            </Field>
          </div>
        </div>

        <div className="rounded-xl border border-[#e2e8f0] bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-[#64748b]">Company Details</h2>
          <div className="space-y-4">
            <Field label="Company Name">
              <input className="input" value={form.companyName} onChange={(e) => onChange("companyName", e.target.value)} />
            </Field>
            <Field label="Industry">
              <input className="input" value={form.industry} onChange={(e) => onChange("industry", e.target.value)} />
            </Field>
            <Field label="Company Size">
              <input className="input" value={form.companySize} onChange={(e) => onChange("companySize", e.target.value)} />
            </Field>
            <Field label="Location">
              <input className="input" value={form.location} onChange={(e) => onChange("location", e.target.value)} />
            </Field>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-[#e2e8f0] bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-[#64748b]">Address & Description</h2>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Field label="Address">
            <input className="input" value={form.address} onChange={(e) => onChange("address", e.target.value)} />
          </Field>
          <Field label="City">
            <input className="input" value={form.city} onChange={(e) => onChange("city", e.target.value)} />
          </Field>
          <Field label="State">
            <input className="input" value={form.state} onChange={(e) => onChange("state", e.target.value)} />
          </Field>
          <Field label="Country">
            <input className="input" value={form.country} onChange={(e) => onChange("country", e.target.value)} />
          </Field>
          <Field label="PIN Code">
            <input className="input" value={form.pinCode} onChange={(e) => onChange("pinCode", e.target.value)} />
          </Field>
        </div>
        <Field label="Company Description">
          <textarea
            className="input min-h-[120px] py-3"
            value={form.companyDesc}
            onChange={(e) => onChange("companyDesc", e.target.value)}
          />
        </Field>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => void onSave()}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-[#0f172a] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1e293b] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Save className="h-4 w-4" />
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <style jsx>{`
        .input {
          width: 100%;
          height: 44px;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          background: #ffffff;
          padding: 0 12px;
          font-size: 14px;
          color: #0f172a;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .input:focus {
          border-color: #6d9c9f;
          box-shadow: 0 0 0 2px rgba(109, 156, 159, 0.15);
        }
      `}</style>
    </div>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#64748b]">{label}</span>
      {children}
    </label>
  )
}
