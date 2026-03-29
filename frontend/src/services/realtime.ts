import type { QueryClient } from "@tanstack/react-query"
import { SOCKET_EVENTS } from "@/lib/realtime/socket-events"
import { qk } from "@/lib/realtime/query-keys"

function invalidateContractQueries(
  queryClient: QueryClient,
  payload: unknown
) {
  queryClient.invalidateQueries({ queryKey: qk.contracts() })
  queryClient.invalidateQueries({ queryKey: ["freelancer", "contracts"] })
  const p = payload as { contractId?: string; contract?: { id?: string } }
  const id = p?.contractId ?? p?.contract?.id
  if (id) {
    queryClient.invalidateQueries({ queryKey: qk.contract(id) })
  }
}

/**
 * Maps Socket.IO events (emitted by API after DB writes) to TanStack Query invalidation.
 */
export function invalidateQueriesForSocketEvent(
  queryClient: QueryClient,
  event: string,
  payload: unknown
) {
  switch (event) {
    case SOCKET_EVENTS.NOTIFICATION_NEW:
      queryClient.invalidateQueries({ queryKey: qk.notifications() })
      queryClient.invalidateQueries({ queryKey: qk.businessDashboard() })
      queryClient.invalidateQueries({ queryKey: qk.businessMyGigs() })
      queryClient.invalidateQueries({ queryKey: qk.businessNav() })
      queryClient.invalidateQueries({ queryKey: qk.businessApplications() })
      break
    case SOCKET_EVENTS.APPLICATION_NEW:
      queryClient.invalidateQueries({ queryKey: qk.businessApplications() })
      queryClient.invalidateQueries({ queryKey: qk.businessDashboard() })
      queryClient.invalidateQueries({ queryKey: qk.businessNav() })
      queryClient.invalidateQueries({ queryKey: qk.gigs() })
      queryClient.invalidateQueries({ queryKey: qk.applications() })
      break
    case SOCKET_EVENTS.MESSAGE_NEW:
      queryClient.invalidateQueries({ queryKey: qk.messages() })
      queryClient.invalidateQueries({ queryKey: qk.businessNav() })
      queryClient.invalidateQueries({ queryKey: qk.messagesUnread() })
      invalidateContractQueries(queryClient, payload)
      break
    case SOCKET_EVENTS.APPLICATION_ACCEPTED:
    case SOCKET_EVENTS.APPLICATION_REJECTED:
      queryClient.invalidateQueries({ queryKey: qk.applications() })
      queryClient.invalidateQueries({ queryKey: qk.proposals() })
      queryClient.invalidateQueries({ queryKey: qk.gigs() })
      queryClient.invalidateQueries({ queryKey: qk.businessDashboard() })
      queryClient.invalidateQueries({ queryKey: qk.businessMyGigs() })
      queryClient.invalidateQueries({ queryKey: qk.businessNav() })
      invalidateContractQueries(queryClient, payload)
      break
    case SOCKET_EVENTS.CONTRACT_NEW:
      queryClient.invalidateQueries({ queryKey: qk.contracts() })
      queryClient.invalidateQueries({ queryKey: qk.gigs() })
      queryClient.invalidateQueries({ queryKey: qk.businessDashboard() })
      queryClient.invalidateQueries({ queryKey: qk.businessMyGigs() })
      invalidateContractQueries(queryClient, payload)
      queryClient.invalidateQueries({ queryKey: qk.dashboard() })
      break
    case SOCKET_EVENTS.CONTRACT_STATUS:
    case SOCKET_EVENTS.CONTRACT_COMPLETED:
      invalidateContractQueries(queryClient, payload)
      queryClient.invalidateQueries({ queryKey: qk.dashboard() })
      queryClient.invalidateQueries({ queryKey: qk.businessDashboard() })
      queryClient.invalidateQueries({ queryKey: qk.businessMyGigs() })
      queryClient.invalidateQueries({ queryKey: qk.notifications() })
      break
    case SOCKET_EVENTS.SUBMISSION_NEW:
      invalidateContractQueries(queryClient, payload)
      queryClient.invalidateQueries({ queryKey: qk.dashboard() })
      queryClient.invalidateQueries({ queryKey: qk.businessDashboard() })
      queryClient.invalidateQueries({ queryKey: qk.businessMyGigs() })
      break
    case SOCKET_EVENTS.REVISION_REQUESTED:
      invalidateContractQueries(queryClient, payload)
      queryClient.invalidateQueries({ queryKey: qk.notifications() })
      break
    case SOCKET_EVENTS.DASHBOARD_UPDATE:
      queryClient.invalidateQueries({ queryKey: qk.dashboardStats() })
      queryClient.invalidateQueries({ queryKey: qk.dashboard() })
      queryClient.invalidateQueries({ queryKey: qk.freelancerActiveContracts() })
      queryClient.invalidateQueries({ queryKey: qk.recentProposals() })
      queryClient.invalidateQueries({ queryKey: qk.proposals() })
      break
    default:
      queryClient.invalidateQueries({ queryKey: qk.dashboard() })
      break
  }
}
