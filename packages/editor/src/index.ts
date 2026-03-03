// ============================================================================
// @verona/editor
// Verona Editor Interface (Spec 3.5.0)
// ============================================================================

/**
 * Editor configuration options
 * @public
 */
export interface VeronaEditorOptions {
  debug?: boolean;
  allowedOrigin?: string;
}

/**
 * Verona Editor Interface (Placeholder)
 * @public
 */
export class VeronaEditorApiService {
  constructor(options: VeronaEditorOptions = {}) {
    console.log('VeronaEditor initialized (placeholder)', options);
  }
}

// Re-export shared utilities
export { encodeBase64, decodeBase64 } from '@verona/shared';