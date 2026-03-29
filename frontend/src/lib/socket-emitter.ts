import type { Server } from "socket.io"

declare global {
  var __contractual_io: Server | undefined
}

export function setIo(io: Server) {
  globalThis.__contractual_io = io
}

export function getIo(): Server | undefined {
  return globalThis.__contractual_io
}

/** Emit to a user's personal room (`user:{id}`). */
export function emitToUser(userId: string, event: string, data: unknown) {
  getIo()?.to(`user:${userId}`).emit(event, data)
}

/** Emit to everyone in a contract room (`contract:{id}`). */
export function emitToContractRoom(contractId: string, event: string, data: unknown) {
  getIo()?.to(`contract:${contractId}`).emit(event, data)
}

export function emitToUsers(userIds: string[], event: string, data: unknown) {
  const io = getIo()
  if (!io) return
  for (const id of userIds) {
    io.to(`user:${id}`).emit(event, data)
  }
}
