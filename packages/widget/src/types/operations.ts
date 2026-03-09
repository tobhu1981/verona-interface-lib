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
  
  /** Editor announces it is ready to receive commands */
  READY_NOTIFICATION: 'voeReadyNotification',
  /** Player reports state changes (responses, navigation, etc.) */
  STATE_CHANGED_NOTIFICATION: 'voeDefinitionChangedNotification',
  

  /** Host commands editor to start with given configuration */
  START_COMMAND: 'voeStartCommand',
} as const;

/**
 * Union type of all valid Verona operation IDs.
 * Used for type-safe message type checking.
 * @public
 */
export type VeronaOperationId = typeof VeronaOperations[keyof typeof VeronaOperations];