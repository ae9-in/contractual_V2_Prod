"use client"

import { useState } from "react"
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { IndianRupee, TrendingUp, Wallet, PiggyBank } from "lucide-react"
import { useCountUp } from "@/lib/hooks/use-count-up"

const BORDER = "#e8ecf0"

const chartData = [
  { m: "Jan", bar: 1200, line: 1100 },
  { m: "Feb", bar: 980, line: 1050 },
  { m: "Mar", bar: 840, line: 1000 },
  { m: "Apr", bar: 1100, line: 1020 },
  { m: "May", bar: 1320, line: 1080 },
  { m: "Jun", bar: 1240, line: 1150 },
]

const tx = [
  { date: "Mar 26, 2026", contract: "CT-2847", client: "TechCorp", amount: "₹400", fee: "₹40", net: "₹360", status: "Cleared" as const },
  { date: "Mar 20, 2026", contract: "CT-2801", client: "DesignHive", amount: "₹600", fee: "₹60", net: "₹540", status: "Pending" as const },
  { date: "Mar 15, 2026", contract: "CT-2750", client: "DataSync", amount: "₹250", fee: "₹25", net: "₹225", status: "Cleared" as const },
  { date: "Mar 10, 2026", contract: "CT-2700", client: "CloudNine", amount: "₹800", fee: "₹80", net: "₹720", status: "Cleared" as const },
  { date: "Mar 5, 2026", contract: "CT-2650", client: "PixelLab", amount: "₹300", fee: "₹30", net: "₹270", status: "Pending" as const },
  { date: "Feb 28, 2026", contract: "CT-2600", client: "TechCorp", amount: "₹500", fee: "₹50", net: "₹450", status: "Cleared" as const },
  { date: "Feb 22, 2026", contract: "CT-2550", client: "NovaSoft", amount: "₹420", fee: "₹42", net: "₹378", status: "Cleared" as const },
  { date: "Feb 15, 2026", contract: "CT-2500", client: "DesignHive", amount: "₹350", fee: "₹35", net: "₹315", status: "Cleared" as const },
]

function Kpi({
  label,
  raw,
  icon: Icon,
  iconBg,
  iconColor,
  prefix = "$",
}: {
  label: string
  raw: number
  icon: typeof IndianRupee
  iconBg: string
  iconColor: string
  prefix?: string
}) {
  const n = useCountUp(raw, 1500)
  return (
    <div className="rounded-[14px] border bg-white px-5 py-[18px]" style={{ borderColor: BORDER }}>
      <div className="flex justify-between">
        <div>
          <p className="text-[12px] font-medium tracking-[0.02em] text-[#94a3b8]">{label}</p>
          <p className="mt-1.5 font-mono text-[28px] font-extrabold text-[#0f172a]">
            {prefix}
            {n.toLocaleString()}
          </p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: iconBg }}>
          <Icon className="h-[18px] w-[18px]" style={{ color: iconColor }} />
        </div>
      </div>
    </div>
  )
}

export function FreelancerEarnings() {
  const [period, setPeriod] = useState<"week" | "month" | "quarter" | "year">("month")

  return (
    <div className="space-y-5">
      <h1 className="font-bricolage text-[22px] font-extrabold text-[#0f172a]">Earnings</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Total Earned" raw={8240} icon={IndianRupee} iconBg="#f0fdf4" iconColor="#22c55e" />
        <Kpi label="This Month" raw={840} icon={TrendingUp} iconBg="#e8f4f5" iconColor="#2d7a7e" />
        <Kpi label="Pending" raw={1200} icon={Wallet} iconBg="#fffbeb" iconColor="#f59e0b" />
        <Kpi label="Available" raw={6420} icon={PiggyBank} iconBg="#eff6ff" iconColor="#3b82f6" />
      </div>

      <div className="rounded-[14px] border bg-white p-6" style={{ borderColor: BORDER }}>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-[15px] font-bold text-[#0f172a]">Earnings Overview</h2>
          <div className="flex gap-1 rounded-full border border-[#e8ecf0] bg-[#f4f6f9] p-1">
            {(["week", "month", "quarter", "year"] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPeriod(p)}
                className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                  period === p ? "bg-white text-[#0f172a] shadow-sm" : "text-[#64748b]"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="4 4" stroke="#f8fafc" vertical={false} />
              <XAxis dataKey="m" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                content={({ active, payload }) =>
                  active && payload?.length ? (
                    <div className="rounded-lg border border-[#e8ecf0] bg-white px-3 py-2 text-xs shadow-lg">
                      <p className="font-mono font-bold text-[#0f172a]">${payload[0]?.value}</p>
                    </div>
                  ) : null
                }
              />
              <Bar dataKey="bar" fill="#6d9c9f" fillOpacity={0.9} radius={[4, 4, 0, 0]} />
              <Line type="monotone" dataKey="line" stroke="#f59e0b" strokeWidth={2} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-[14px] border bg-white" style={{ borderColor: BORDER }}>
        <div className="flex items-center justify-between border-b border-[#f8fafc] px-5 py-4">
          <h2 className="text-[15px] font-bold text-[#0f172a]">Transaction History</h2>
          <button type="button" className="rounded-lg border border-[#e8ecf0] px-3 py-1.5 text-xs font-semibold text-[#64748b] hover:border-[#6d9c9f]">
            Export CSV
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead className="bg-[#f8fafc]">
              <tr>
                {["Date", "Contract", "Client", "Amount", "Fee", "Net", "Status"].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-[#94a3b8]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tx.map((t) => (
                <tr key={t.date + t.contract} className="border-b border-[#f8fafc] hover:bg-[#f8fafc]">
                  <td className="px-5 py-3 text-[13px] text-[#0f172a]">{t.date}</td>
                  <td className="px-5 py-3 font-mono text-[13px] text-[#0f172a]">{t.contract}</td>
                  <td className="px-5 py-3 text-[13px] text-[#0f172a]">{t.client}</td>
                  <td className="px-5 py-3 font-mono text-[13px] font-semibold text-[#0f172a]">{t.amount}</td>
                  <td className="px-5 py-3 font-mono text-[13px] text-[#64748b]">{t.fee}</td>
                  <td className="px-5 py-3 font-mono text-[13px] font-semibold text-[#0f172a]">{t.net}</td>
                  <td className="px-5 py-3">
                    <span
                      className={
                        t.status === "Cleared"
                          ? "rounded-full border border-[#bbf7d0] bg-[#f0fdf4] px-2 py-0.5 text-xs font-semibold text-[#16a34a]"
                          : "rounded-full border border-[#fde68a] bg-[#fffbeb] px-2 py-0.5 text-xs font-semibold text-[#d97706]"
                      }
                    >
                      {t.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
