import { NextResponse } from "next/server"
import { ZodError } from "zod"

export type ApiMeta = { total?: number; page?: number; limit?: number; unread?: number }

export type ApiJson<T> = {
  data: T
  error?: undefined
  meta?: ApiMeta
}

export type ApiJsonErr = {
  data: null
  error: string
  details?: unknown
}

export function jsonOk<T>(data: T, meta?: ApiMeta, status = 200) {
  return NextResponse.json({ data, meta } satisfies ApiJson<T>, { status })
}

export function jsonErr(message: string, status: number, details?: unknown) {
  return NextResponse.json({ data: null, error: message, details } satisfies ApiJsonErr, { status })
}

export function zodErrorResponse(err: ZodError) {
  return jsonErr("Validation failed", 400, err.flatten())
}
