"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useSession } from "next-auth/react"
import { format } from "date-fns"
import {
  MessageSquare,
  MoreHorizontal,
  Paperclip,
  Phone,
  Search,
  Send,
  Video,
} from "lucide-react"
import { useCallback, useEffect, useMemo, useState } from "react"
import { qk } from "@/lib/realtime/query-keys"
import { cn } from "@/lib/utils"
import { useSocket } from "@/hooks/useSocket"

const BORDER = "#e8ecf0"

type ContractListItem = {
  id: string
  status: string
  gig: { title: string }
  freelancer: { id: string; name: string; image: string | null }
  business: { id: string; name: string; image: string | null; companyName: string | null }
  messages: Array<{
    id: string
    content: string
    createdAt: string
    senderId: string
    isRead: boolean
  }>
}

type InboxRow = {
  contractId: string
  status: string
  gigTitle: string
  peer: { id: string; name: string; image: string | null }
  lastMessage: {
    id: string
    body: string
    createdAt: string
    senderId: string
  } | null
}

type Msg = {
  id: string
  content: string
  createdAt: string
  isRead: boolean
  senderId: string
  sender: { id: string; name: string; image: string | null }
}

function initials(name: string) {
  const p = name.trim().split(/\s+/)
  if (p.length >= 2) return (p[0]![0] + p[1]![0]).toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

async function parseJson<T>(res: Response): Promise<T> {
  const j = (await res.json()) as { data?: T; error?: string }
  if (!res.ok) throw new Error(j.error ?? res.statusText)
  if (j.data === undefined) throw new Error("Invalid response")
  return j.data
}

export function FreelancerMessages() {
  const { data: session } = useSession()
  const queryClient = useQueryClient()
  const { socket, connected } = useSocket()
  const [activeId, setActiveId] = useState<string | null>(null)
  const [draft, setDraft] = useState("")

  const inboxQuery = useQuery({
    queryKey: qk.contracts(),
    queryFn: async () => {
      const res = await fetch("/api/contracts")
      const rows = await parseJson<ContractListItem[]>(res)
      const uid = session?.user?.id
      return rows.map((c): InboxRow => {
        const peer =
          uid === c.freelancer.id
            ? {
                id: c.business.id,
                name: c.business.companyName || c.business.name,
                image: c.business.image,
              }
            : {
                id: c.freelancer.id,
                name: c.freelancer.name,
                image: c.freelancer.image,
              }
        const last = c.messages[0]
        return {
          contractId: c.id,
          status: c.status,
          gigTitle: c.gig.title,
          peer,
          lastMessage: last
            ? {
                id: last.id,
                body: last.content,
                createdAt: last.createdAt,
                senderId: last.senderId,
              }
            : null,
        }
      })
    },
    enabled: !!session?.user?.id,
  })

  const inbox = useMemo(
    () => inboxQuery.data ?? [],
    [inboxQuery.data]
  )

  useEffect(() => {
    if (!activeId && inbox.length > 0) {
      setActiveId(inbox[0]!.contractId)
    }
  }, [activeId, inbox])

  const messagesQuery = useQuery({
    queryKey: activeId ? qk.messages(activeId) : ["messages", "none"],
    queryFn: async () => {
      if (!activeId) return [] as Msg[]
      const res = await fetch(
        `/api/contracts/${encodeURIComponent(activeId)}/messages?limit=100`
      )
      return parseJson<Msg[]>(res)
    },
    enabled: !!activeId,
  })

  const messages = messagesQuery.data ?? []
  const active = inbox.find((r) => r.contractId === activeId)

  useEffect(() => {
    if (!socket || !activeId) return
    socket.emit("join:contract", activeId)
    return () => {
      socket.emit("leave:contract", activeId)
    }
  }, [socket, activeId])

  const sendMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await fetch(`/api/contracts/${encodeURIComponent(activeId!)}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      })
      return parseJson<Msg>(res)
    },
    onSuccess: () => {
      if (activeId) {
        queryClient.invalidateQueries({ queryKey: qk.messages(activeId) })
        queryClient.invalidateQueries({ queryKey: qk.contracts() })
      }
    },
  })

  const send = useCallback(() => {
    const text = draft.trim()
    if (!text || !activeId) return
    sendMutation.mutate(text)
    setDraft("")
  }, [draft, activeId, sendMutation])

  const statusLine = useMemo(() => {
    if (!connected) return "Connecting…"
    return "Live"
  }, [connected])

  return (
    <div
      className="flex overflow-hidden rounded-[14px] border bg-white"
      style={{ borderColor: BORDER, height: "calc(100vh - 76px)", maxHeight: "720px" }}
    >
      <div className="flex w-[320px] shrink-0 flex-col border-r border-[#f1f5f9]">
        <div className="border-b border-[#f1f5f9] px-4 py-3.5">
          <p className="text-[15px] font-bold text-[#0f172a]">Messages</p>
          <div className="relative mt-2">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-[13px] w-[13px] -translate-y-1/2 text-[#94a3b8]" />
            <input
              type="search"
              placeholder="Search…"
              className="h-8 w-full rounded-lg bg-[#f4f6f9] pl-8 pr-3 text-[12px] text-[#0f172a] placeholder:text-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#6d9c9f]/30"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {inboxQuery.isLoading && (
            <p className="px-4 py-6 text-[13px] text-[#94a3b8]">Loading conversations…</p>
          )}
          {inboxQuery.isError && (
            <p className="px-4 py-6 text-[13px] text-red-600">Could not load inbox.</p>
          )}
          {!inboxQuery.isLoading && inbox.length === 0 && (
            <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
              <MessageSquare className="h-8 w-8 text-[#cbd5e1]" />
              <p className="text-[13px] text-[#64748b]">No contracts yet.</p>
              <p className="text-[12px] text-[#94a3b8]">
                When you have an active contract, conversations appear here.
              </p>
            </div>
          )}
          {inbox.map((x) => (
            <button
              key={x.contractId}
              type="button"
              onClick={() => setActiveId(x.contractId)}
              className={cn(
                "flex w-full gap-2.5 border-b border-[#f8fafc] px-4 py-3 text-left hover:bg-[#f8fafc]",
                activeId === x.contractId && "border-l-[3px] border-l-[#6d9c9f] bg-[#e8f4f5]"
              )}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#6d9c9f] to-[#2d7a7e] text-[13px] font-bold text-white">
                {initials(x.peer.name)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate text-[13px] font-semibold text-[#0f172a]">{x.peer.name}</span>
                  <span className="ml-auto shrink-0 text-[11px] text-[#94a3b8]">
                    {x.lastMessage
                      ? format(new Date(x.lastMessage.createdAt), "MMM d")
                      : "—"}
                  </span>
                </div>
                <p className="truncate text-[12px] text-[#94a3b8]">
                  {x.lastMessage?.body ?? x.gigTitle}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        {!activeId || !active ? (
          <div className="flex flex-1 items-center justify-center text-[13px] text-[#94a3b8]">
            Select a conversation
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 border-b border-[#f1f5f9] px-5 py-3.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#6d9c9f] to-[#2d7a7e] text-xs font-bold text-white">
                {initials(active.peer.name)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-semibold text-[#0f172a]">{active.peer.name}</p>
                <p className="flex items-center gap-1.5 text-[12px] text-[#94a3b8]">
                  <span
                    className={cn(
                      "h-2 w-2 rounded-full",
                      connected ? "bg-[#22c55e]" : "bg-amber-400"
                    )}
                  />
                  {statusLine}
                </p>
              </div>
              <button type="button" className="flex h-8 w-8 items-center justify-center rounded-lg text-[#64748b] hover:bg-[#f4f6f9]">
                <Phone className="h-4 w-4" />
              </button>
              <button type="button" className="flex h-8 w-8 items-center justify-center rounded-lg text-[#64748b] hover:bg-[#f4f6f9]">
                <Video className="h-4 w-4" />
              </button>
              <button type="button" className="flex h-8 w-8 items-center justify-center rounded-lg text-[#64748b] hover:bg-[#f4f6f9]">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
              {messagesQuery.isLoading && (
                <p className="text-center text-[12px] text-[#94a3b8]">Loading messages…</p>
              )}
              {messages.map((m) => {
                const mine = m.senderId === session?.user?.id
                return (
                  <div
                    key={m.id}
                    className={cn("flex items-end gap-2", mine && "flex-row-reverse")}
                  >
                    {!mine && (
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#6d9c9f] to-[#2d7a7e] text-[10px] font-bold text-white">
                        {initials(m.sender.name)}
                      </div>
                    )}
                    <div>
                      <div
                        className={cn(
                          "max-w-[min(420px,65vw)] rounded-[12px] px-3.5 py-2.5 text-[13px] leading-relaxed",
                          mine
                            ? "rounded-br-[4px] bg-gradient-to-br from-[#6d9c9f] to-[#2d7a7e] text-white"
                            : "rounded-bl-[4px] bg-[#f4f6f9] text-[#0f172a]"
                        )}
                      >
                        {m.content}
                      </div>
                      <p
                        className={cn(
                          "mt-1 text-[10px] text-[#94a3b8]",
                          mine && "text-right text-black/40"
                        )}
                      >
                        {format(new Date(m.createdAt), "p")}
                        {mine && m.isRead && (
                          <span className="ml-1 text-[9px] uppercase tracking-wide">Read</span>
                        )}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="flex items-center gap-2 border-t border-[#f1f5f9] px-4 py-3">
              <button type="button" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#64748b] hover:bg-[#f4f6f9]">
                <Paperclip className="h-4 w-4" />
              </button>
              <input
                type="text"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    send()
                  }
                }}
                placeholder="Type a message…"
                className="h-10 flex-1 rounded-[10px] bg-[#f4f6f9] px-3.5 text-[13px] text-[#0f172a] placeholder:text-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#6d9c9f]"
              />
              <button
                type="button"
                onClick={send}
                disabled={sendMutation.isPending || !draft.trim()}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-[#6d9c9f] text-white hover:bg-[#2d7a7e] disabled:opacity-40"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
