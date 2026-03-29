/** Socket.IO event names — shared by client, server, and REST emit bridge */

export const CLIENT_EVENTS = {
  JOIN_ROOM: "join_room",
  LEAVE_ROOM: "leave_room",
  SEND_MESSAGE: "send_message",
  TYPING: "typing",
  STOP_TYPING: "stop_typing",
  MARK_READ: "mark_read",
  APPLY_TO_GIG: "apply_to_gig",
  UPDATE_CONTRACT_STATUS: "update_contract_status",
} as const

export const SERVER_EVENTS = {
  RECEIVE_MESSAGE: "receive_message",
  NEW_NOTIFICATION: "new_notification",
  APPLICATION_UPDATE: "application_update",
  CONTRACT_UPDATE: "contract_update",
  DASHBOARD_UPDATE: "dashboard_update",
  TYPING: "typing",
  STOP_TYPING: "stop_typing",
  MESSAGE_STATUS: "message_status",
} as const

export function roomContract(contractId: string) {
  return `contract:${contractId}`
}

export function roomUser(userId: string) {
  return `user:${userId}`
}

export function roomGig(gigId: string) {
  return `gig:${gigId}`
}
