import { Loader2 } from "lucide-react"

export default function BusinessLoading() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-8">
      <div className="flex flex-col items-center gap-4 text-slate-400">
        <Loader2 className="h-8 w-8 animate-spin text-[#6d9c9f]" />
        <p className="text-sm font-medium animate-pulse text-[#6d9c9f]">Loading workspace...</p>
      </div>
    </div>
  )
}
