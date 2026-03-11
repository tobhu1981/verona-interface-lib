// ============================================================================
// ALLOWED PROPERTY VALUES
// ============================================================================

/**
 * Namespace containing data type definitions used in payloads.
 * These are enums and union types for specific fields.
 * @public
 */
export namespace AllowedPropertiesValues {

  /** Progress indicator for presentation and responses */
  export type DependencyType = 'file' | 'service';

   /** Allowed data types for a variable value */
  export type VariableType = 'string' | 'integer' | 'number' | 'boolean' | 'attachment' | 'json' | 'no-value'| 'coded';

  /**  Allowed data type formats for a variable value.*/
  export type VariableFormat = 'text-selection' | 'image' | 'capture-image' | 'audio' | 'ggb-file' | 'non-negative' | 'latex' | 'math-ml' | 'math-table' | 'math-text-mix' | 'ggb-variable' | '';
}