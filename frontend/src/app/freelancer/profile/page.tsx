import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Role } from "@prisma/client"
import { notFound, redirect } from "next/navigation"
import { FreelancerProfilePremium } from "@/components/freelancer/pages/freelancer-profile-premium"

export default async function FreelancerProfilePage() {
  const session = await auth()
  if (!session?.user?.id) return redirect("/login")
  if (session.user.role !== Role.FREELANCER) return redirect("/")

  const [user, completed, active, ratings] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        skills: true,
        portfolio: true,
        education: true,
        experience: { orderBy: { startYear: "desc" } },
        certifications: true,
        languages: true,
        reviewsReceived: {
          take: 20,
          orderBy: { createdAt: "desc" },
          include: { reviewer: { select: { id: true, name: true, image: true } } },
        },
        _count: {
          select: {
            contractsAsFreelancer: true,
            applications: true,
          },
        },
      },
    }),
    prisma.contract.count({
      where: { freelancerId: session.user.id, status: "COMPLETED" },
    }),
    prisma.contract.count({
      where: { freelancerId: session.user.id, status: "IN_PROGRESS" },
    }),
    prisma.review.aggregate({
      where: { revieweeId: session.user.id },
      _avg: { rating: true },
      _count: { _all: true },
    }),
  ])

  if (!user) return notFound()

  // Serialize and prepare initial data for the client component
  const initialData = JSON.parse(JSON.stringify({
    ...user,
    completedContracts: completed,
    activeContracts: active,
    avgRating: ratings._avg.rating,
    reviewCount: ratings._count._all,
  }))

  return <FreelancerProfilePremium initialData={initialData} />
}
