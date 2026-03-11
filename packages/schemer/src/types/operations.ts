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

  /** Schemer announces it is ready to receive commands */
  READY_NOTIFICATION: 'vosReadyNotification',
  /** Schemer sends updated coding scheme data to the host */
  SCHEME_CHANGED_NOTIFICATION: 'vosSchemeChangedNotification',

  /** Host sends execution parameters and variables to the schemer */
  START_COMMAND: 'vosStartCommand',

} as const;

/**
 * Union type of all valid Verona Schemer operation IDs.
 * Used for type-safe message type checking.
 * @public
 */
export type VeronaOperationId = typeof VeronaOperations[keyof typeof VeronaOperations];