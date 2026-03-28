/** TanStack Query keys used with real-time invalidation */

export const qk = {
  gigs: () => ["gigs"] as const,
  gig: (id: string) => ["gig", id] as const,
  notifications: () => ["notifications"] as const,
  messages: (contractId?: string) =>
    contractId ? (["messages", contractId] as const) : (["messages"] as const),
  contracts: () => ["contracts"] as const,
  freelancerContracts: (tab?: string) =>
    ["freelancer", "contracts", tab ?? "active"] as const,
  contract: (id: string) => ["contract", id] as const,
  proposals: () => ["proposals"] as const,
  applications: () => ["applications"] as const,
  dashboard: () => ["dashboard"] as const,
  dashboardStats: () => ["dashboard-stats"] as const,
  freelancerActiveContracts: () => ["freelancer", "active-contracts"] as const,
  recentProposals: () => ["freelancer", "recent-proposals"] as const,
  freelancerProfile: () => ["freelancer", "profile"] as const,
  messagesUnread: () => ["messages-unread"] as const,
  businessDashboard: () => ["business", "dashboard"] as const,
  businessMyGigs: () => ["business", "my-gigs"] as const,
  businessNav: () => ["business", "nav-counts"] as const,
  businessApplications: () => ["business", "applications"] as const,
  inbox: () => ["inbox"] as const,
}
