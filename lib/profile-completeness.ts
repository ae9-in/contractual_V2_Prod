import type { Portfolio, Skill, User } from "@prisma/client"

type UserProfileSlice = Pick<
  User,
  "image" | "headline" | "bio" | "hourlyRate" | "location"
> & {
  skills?: Pick<Skill, "id">[]
  portfolio?: Pick<Portfolio, "id">[]
}

/** Weights sum to 100. */
export function computeProfileCompleteness(u: UserProfileSlice): number {
  let score = 0
  if (u.image) score += 10
  if (u.headline && u.headline.trim().length > 0) score += 10
  if (u.bio && u.bio.trim().length >= 20) score += 20
  const skillCount = u.skills?.length ?? 0
  if (skillCount >= 3) score += 20
  else if (skillCount > 0) score += Math.round((20 * skillCount) / 3)
  if (u.hourlyRate != null && u.hourlyRate > 0) score += 15
  if (u.location && u.location.trim().length > 0) score += 10
  const portCount = u.portfolio?.length ?? 0
  if (portCount >= 1) score += 15
  return Math.min(100, score)
}
