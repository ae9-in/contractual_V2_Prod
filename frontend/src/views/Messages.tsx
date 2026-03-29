"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Search,
  Phone,
  Video,
  MoreVertical,
  Paperclip,
  Smile,
  Send,
  ArrowDown,
  FileText,
  Download,
  Check,
  CheckCheck,
} from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

const convos = [
  { id: "1", name: "Maya Dev", preview: "Uploaded the latest build — ready for review.", time: "2m", unread: 2, online: true, role: "Freelancer" },
  { id: "2", name: "Northwind Labs", preview: "Can we extend milestone 2 by 3 days?", time: "1h", unread: 0, online: false, role: "Business" },
  { id: "3", name: "Design Collective", preview: "Amazing work on the hero section!", time: "Wed", unread: 0, online: true, role: "Freelancer" },
]

const messages = [
  { id: "m1", from: "them", text: "Hey! Shared the Figma link in drive.", time: "10:42 AM" },
  { id: "m2", from: "me", text: "Perfect — reviewing now. Will leave comments today.", time: "10:44 AM", read: true },
  { id: "m3", from: "them", text: "Also attached the export package.", time: "10:45 AM", file: { name: "exports.zip", size: "4.2 MB" } },
  { id: "m4", from: "system", text: "🎉 Milestone approved — ₹420 released", variant: "milestone" as const },
]

export function MessagesPage({ userType: _userType }: { userType: "business" | "freelancer" | "admin" }) {
  const [activeId, setActiveId] = useState(convos[0].id)
  const [tab, setTab] = useState("all")
  const active = convos.find((c) => c.id === activeId)!

  return (
    <TooltipProvider>
      <div className="-m-6 flex h-[calc(100vh-4rem)] overflow-hidden rounded-2xl border border-[var(--border)] bg-white lg:-m-8">
        {/* Left */}
        <div className="flex w-full max-w-[320px] flex-col border-r border-[var(--border)] bg-[var(--bg-alt)]">
          <div className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-secondary)]" />
              <Input
                placeholder="Search messages..."
                className="h-11 rounded-full border-transparent bg-white pl-10 shadow-sm focus-visible:ring-[var(--primary)]"
              />
            </div>
            <Tabs value={tab} onValueChange={setTab} className="mt-4">
              <TabsList className="grid h-10 w-full grid-cols-3 rounded-full bg-white p-1 shadow-sm">
                <TabsTrigger value="all" className="rounded-full text-xs">
                  All
                </TabsTrigger>
                <TabsTrigger value="active" className="rounded-full text-xs">
                  Active
                </TabsTrigger>
                <TabsTrigger value="archived" className="rounded-full text-xs">
                  Archived
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <ScrollArea className="flex-1 px-2">
            {convos.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setActiveId(c.id)}
                className={cn(
                  "mb-1 flex w-full gap-3 rounded-xl p-3 text-left transition-colors hover:bg-white",
                  c.id === activeId && "border-l-[3px] border-[var(--primary)] bg-[var(--primary-light)]"
                )}
              >
                <div className="relative">
                  <Avatar className="h-11 w-11">
                    <AvatarFallback className="bg-[var(--primary)] text-sm font-bold text-white">{c.name[0]}</AvatarFallback>
                  </Avatar>
                  {c.online && (
                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-[var(--success)]" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate font-semibold text-[var(--text-primary)]">{c.name}</p>
                    <span className="shrink-0 text-[10px] text-[var(--text-secondary)]">{c.time}</span>
                  </div>
                  <p className="truncate text-xs text-[var(--text-secondary)]">{c.preview}</p>
                </div>
                {c.unread > 0 && (
                  <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-[var(--primary)] text-[11px] font-bold text-white">
                    {c.unread}
                  </span>
                )}
              </button>
            ))}
          </ScrollArea>
        </div>

        {/* Right */}
        <div className="flex min-w-0 flex-1 flex-col bg-white">
          <div className="border-b border-[var(--border)] px-6 py-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <Avatar className="h-11 w-11">
                  <AvatarFallback className="bg-[var(--primary)] font-bold text-white">{active.name[0]}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-semibold text-[var(--text-primary)]">{active.name}</h2>
                    <span className="flex items-center gap-1 text-[11px] font-medium text-[var(--success)]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[var(--success)]" />
                      Online
                    </span>
                    <Badge variant="outline" className="border-[var(--border)] text-[10px]">
                      {active.role}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button size="icon" variant="ghost" className="rounded-xl" aria-label="Call">
                  <Phone className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" className="rounded-xl" aria-label="Video">
                  <Video className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" className="rounded-xl" aria-label="More">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between gap-2 rounded-xl bg-gradient-to-r from-[var(--cta-amber)]/20 to-[var(--cta-amber)]/5 px-4 py-2 text-sm">
              <span className="font-medium text-[var(--text-primary)]">
                Active contract: <em>Logo Design Project</em>
              </span>
              <Link href="/contracts/demo-1042" className="font-semibold text-[var(--primary-dark)] hover:underline">
                View contract →
              </Link>
            </div>
          </div>

          <ScrollArea className="flex-1 px-6 py-4">
            <div className="mx-auto flex max-w-3xl flex-col gap-4">
              <div className="flex justify-center">
                <span className="rounded-full bg-[var(--bg-alt)] px-3 py-1 text-xs font-medium text-[var(--text-secondary)]">Today</span>
              </div>
              {messages.map((m) => {
                if (m.from === "system" && m.variant === "milestone") {
                  return (
                    <div
                      key={m.id}
                      className="rounded-2xl border border-[var(--primary)]/30 bg-[var(--primary-light)] px-4 py-3 text-center text-sm font-semibold text-[var(--cta-amber-dark)]"
                    >
                      {m.text}
                    </div>
                  )
                }
                if (m.file) {
                  return (
                    <div key={m.id} className="flex gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{active.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="rounded-2xl rounded-bl-md border border-[var(--border)] bg-white px-4 py-3 shadow-sm">
                        <div className="flex items-center gap-3">
                          <FileText className="h-8 w-8 text-[var(--primary)]" />
                          <div>
                            <p className="text-sm font-medium text-[var(--text-primary)]">{m.file.name}</p>
                            <p className="text-xs text-[var(--text-secondary)]">{m.file.size}</p>
                          </div>
                          <Button size="sm" variant="outline" className="ml-auto rounded-lg">
                            <Download className="mr-1 h-3.5 w-3.5" /> Download
                          </Button>
                        </div>
                        <p className="mt-2 text-[10px] text-[var(--text-secondary)]">{m.time}</p>
                      </div>
                    </div>
                  )
                }
                const mine = m.from === "me"
                return (
                  <div key={m.id} className={cn("flex", mine ? "justify-end" : "justify-start gap-2")}>
                    {!mine && (
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{active.name[0]}</AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={cn(
                        "max-w-[82%] px-4 py-2.5 shadow-sm",
                        mine
                          ? "rounded-2xl rounded-br-md bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] text-white"
                          : "rounded-2xl rounded-bl-md border border-[var(--border)] bg-white text-[var(--text-primary)]"
                      )}
                    >
                      <p className="text-sm leading-relaxed">{m.text}</p>
                      <div className={cn("mt-1 flex items-center justify-end gap-1 text-[10px]", mine ? "text-white/75" : "text-[var(--text-secondary)]")}>
                        <span>{m.time}</span>
                        {mine && ("read" in m && m.read ? <CheckCheck className="h-3.5 w-3.5 text-[var(--primary-light)]" /> : <Check className="h-3.5 w-3.5" />)}
                      </div>
                    </div>
                  </div>
                )
              })}
              <div className="flex gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{active.name[0]}</AvatarFallback>
                </Avatar>
                <div className="inline-flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-[var(--border)] bg-white px-4 py-3">
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                </div>
              </div>
            </div>
          </ScrollArea>

          <Separator />
          <div className="p-4">
            <div className="mx-auto flex max-w-3xl items-end gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="icon" variant="ghost" className="shrink-0 rounded-xl" aria-label="Attach">
                    <Paperclip className="h-5 w-5 text-[var(--text-secondary)]" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Attach file</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="icon" variant="ghost" className="shrink-0 rounded-xl" aria-label="Emoji">
                    <Smile className="h-5 w-5 text-[var(--text-secondary)]" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Emoji</TooltipContent>
              </Tooltip>
              <Input
                placeholder="Write a message..."
                className="min-h-[48px] flex-1 rounded-2xl border-[var(--border)] bg-[var(--bg-alt)] focus-visible:border-[var(--primary)] focus-visible:ring-[3px] focus-visible:ring-[var(--shadow-teal)]"
              />
              <Button size="icon" className="h-12 w-12 shrink-0 rounded-2xl bg-[var(--primary)] btn-premium">
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
