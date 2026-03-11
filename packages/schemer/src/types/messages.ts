// ============================================================================
// VERONA MESSAGE TYPES
// ============================================================================

import { VeronaOperationId } from './operations';

/**
 * Base structure for all Verona Schemer messages.
 * @public
 */
export interface VeronaMessage {
  type: VeronaOperationId;
  sessionId?: string;
  [key: string]: any;
}