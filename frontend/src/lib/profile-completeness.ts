import type { User, Skill, Portfolio, Education, Language } from "@prisma/client"

type UserProfileSlice = User & {
  skills?: Pick<Skill, "id">[]
  portfolio?: Pick<Portfolio, "id">[]
  education?: Pick<Education, "id">[]
  languages?: Pick<Language, "id">[]
}

/** 
 * Calculate as a real-time percentage stored in user.profileComplete:
 * avatar: +15%
 * headline: +10%
 * bio (50 chars): +15%
 * skills (3+): +15%
 * hourlyRate: +10%
 * portfolio (1+): +15%
 * education: +10%
 * languages: +5%
 * phone present: +5%
 */
export function computeProfileCompleteness(u: UserProfileSlice): number {
  let score = 0
  if (u.image) score += 15
  if (u.headline && u.headline.trim().length > 0) score += 10
  if (u.bio && u.bio.trim().length >= 50) score += 15
  if ((u.skills?.length ?? 0) >= 3) score += 15
  if (u.hourlyRate && u.hourlyRate > 0) score += 10
  if ((u.portfolio?.length ?? 0) >= 1) score += 15
  if ((u.education?.length ?? 0) >= 1) score += 10
  if ((u.languages?.length ?? 0) >= 1) score += 5
  if (u.phone && u.phone.trim().length > 0) score += 5
  
  return Math.min(100, score)
}
