import { ContractStatus } from "@prisma/client"

/** Heuristic progress % for freelancer dashboard UI. */
export function contractProgressPercent(
  status: ContractStatus,
  submissionCount: number
): number {
  switch (status) {
    case ContractStatus.COMPLETED:
      return 100
    case ContractStatus.CANCELLED:
    case ContractStatus.DISPUTED:
      return 0
    case ContractStatus.REVISION_REQUESTED:
      return 55
    case ContractStatus.SUBMITTED:
    case ContractStatus.UNDER_REVIEW:
      return 78
    case ContractStatus.IN_PROGRESS:
      return Math.min(88, 28 + submissionCount * 18)
    case ContractStatus.PENDING:
    default:
      return 20
  }
}

export function contractStatusLabel(status: ContractStatus): string {
  const map: Record<ContractStatus, string> = {
    [ContractStatus.PENDING]: "Pending",
    [ContractStatus.IN_PROGRESS]: "In Progress",
    [ContractStatus.SUBMITTED]: "Submitted",
    [ContractStatus.UNDER_REVIEW]: "Under Review",
    [ContractStatus.REVISION_REQUESTED]: "Revision",
    [ContractStatus.COMPLETED]: "Completed",
    [ContractStatus.CANCELLED]: "Cancelled",
    [ContractStatus.DISPUTED]: "Disputed",
  }
  return map[status] ?? status
}
