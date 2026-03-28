import "dotenv/config"
import { createServer } from "node:http"
import { parse } from "node:url"
import next from "next"
import jwt from "jsonwebtoken"
import { Server as SocketServer } from "socket.io"
import { setIo } from "./lib/socket-emitter"
// @ts-ignore
const compression = require("compression")

const dev = process.env.NODE_ENV !== "production"
const hostname = process.env.HOSTNAME ?? "localhost"
const port = Number(process.env.PORT ?? 3000)

const app = next({ dev })
const handle = app.getRequestHandler()
// @ts-ignore
const compress = compression()

void app.prepare().then(() => {
  const server = createServer((req, res) => {
    try {
      // @ts-ignore
      compress(req, res, () => {
        const parsedUrl = parse(req.url ?? "/", true)
        void handle(req, res, parsedUrl)
      })
    } catch (e) {
      console.error("Error handling request", e)
      res.statusCode = 500
      res.end("internal server error")
    }
  })

  const io = new SocketServer(server, {
    path: "/socket.io",
    cors: { origin: true, credentials: true },
  })

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token as string | undefined
    if (!token) {
      next(new Error("Unauthorized"))
      return
    }
    const secret = process.env.NEXTAUTH_SECRET
    if (!secret) {
      next(new Error("Server misconfiguration"))
      return
    }
    try {
      const payload = jwt.verify(token, secret) as { sub?: string; id?: string }
      const uid = payload.sub ?? payload.id
      if (!uid) {
        next(new Error("Unauthorized"))
        return
      }
      socket.data.userId = uid
      next()
    } catch {
      next(new Error("Unauthorized"))
    }
  })

  io.on("connection", (socket) => {
    const userId = socket.data.userId as string
    void socket.join(`user:${userId}`)

    socket.on("join:contract", (contractId: string) => {
      if (typeof contractId === "string") void socket.join(`contract:${contractId}`)
    })

    socket.on("leave:contract", (contractId: string) => {
      if (typeof contractId === "string") void socket.leave(`contract:${contractId}`)
    })
  })

  setIo(io)

  server.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`)
  })
})
