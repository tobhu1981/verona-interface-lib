// ============================================================================
// VERONA OPERATION IDS
// ============================================================================

/**
 * Verona operation IDs for all message types.
 *
 * Use these constants instead of hardcoded strings to ensure type safety
 * and prevent typos in message handling.
 *
 * @public
 */
export const VeronaOperations = {

  /** Widget announces it is ready to receive commands */
  READY_NOTIFICATION: 'vowReadyNotification',
  /** Widget sends state data to the host */
  STATE_CHANGED_NOTIFICATION: 'vowStateChangedNotification',
  /** Widget calls for closing the widget dialog */
  RETURN_REQUESTED: 'vowReturnRequested',

  /** Host sends execution parameters to the widget */
  START_COMMAND: 'vowStartCommand',

} as const;

/**
 * Union type of all valid Verona Widget operation IDs.
 * Used for type-safe message type checking.
 * @public
 */
export type VeronaOperationId = typeof VeronaOperations[keyof typeof VeronaOperations];