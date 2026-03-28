export function parsePagination(searchParams: URLSearchParams) {
  const page = Math.max(1, Number(searchParams.get("page") ?? 1) || 1)
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? 20) || 20))
  return { page, limit, skip: (page - 1) * limit }
}
