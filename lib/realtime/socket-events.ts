/** Socket.IO event names used by API + client (contract with spec). */

export const SOCKET_EVENTS = {
  NOTIFICATION_NEW: "notification:new",
  /** New proposal on a business's gig — invalidates applications list */
  APPLICATION_NEW: "application:new",
  MESSAGE_NEW: "message:new",
  APPLICATION_ACCEPTED: "application:accepted",
  APPLICATION_REJECTED: "application:rejected",
  CONTRACT_NEW: "contract:new",
  CONTRACT_STATUS: "contract:status",
  SUBMISSION_NEW: "submission:new",
  REVISION_REQUESTED: "revision:requested",
  CONTRACT_COMPLETED: "contract:completed",
  DASHBOARD_UPDATE: "dashboard:update",
} as const
