import { createUploadthing, type FileRouter } from "uploadthing/server"

const f = createUploadthing()

export const uploadRouter = {
  gigAttachments: f({
    pdf: { maxFileSize: "16MB", maxFileCount: 10 },
    image: { maxFileSize: "16MB", maxFileCount: 10 },
    blob: { maxFileSize: "16MB", maxFileCount: 10 },
  })
    .middleware(() => ({ ok: true as const }))
    .onUploadComplete(() => {}),

  submissionFiles: f({
    blob: { maxFileSize: "32MB", maxFileCount: 20 },
  })
    .middleware(() => ({ ok: true as const }))
    .onUploadComplete(() => {}),

  avatars: f({
    image: { maxFileSize: "4MB", maxFileCount: 1 },
  })
    .middleware(() => ({ ok: true as const }))
    .onUploadComplete(() => {}),

  portfolioFiles: f({
    image: { maxFileSize: "8MB", maxFileCount: 12 },
  })
    .middleware(() => ({ ok: true as const }))
    .onUploadComplete(() => {}),
} satisfies FileRouter

export type OurFileRouter = typeof uploadRouter
