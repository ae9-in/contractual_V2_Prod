import { NextResponse } from "next/server"

/** Mock realtime channel — returns canned events (replace with Pusher/Socket.io) */
export async function GET() {
  const events = [
    { id: "1", type: "message", room: "contract-ct-2847", preview: "Uploaded v2 for review.", at: new Date().toISOString() },
    { id: "2", type: "typing", room: "contract-ct-2847", user: "Alex Rivera" },
  ]
  return NextResponse.json({ events, mock: true })
}
