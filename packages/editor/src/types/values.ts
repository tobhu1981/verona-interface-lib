// ============================================================================
// ALLOWED PROPERTY VALUES
// ============================================================================

/**
 * Namespace containing data type definitions used in payloads.
 * These are enums and union types for specific fields.
 * @public
 */
export namespace AllowedPropertiesValues {

  /** Specifies the access level of the editing person ('super' = maximal) */
  export type Role = 'guest' | 'commentator' | 'developer' | 'maintainer' | 'super';

  /** Specifies type for dependency */
  export type DependencyType = 'file' | 'service';

  /** Specifies type for variable info */
  export type VariableInfoType = 'string' | 'integer' | 'number' | 'boolean' | 'attachment' | 'json' | 'no-value' | 'coded';

   /** Data type format */
  export type Format = 'text-selection' | 'image' | 'capture-image' | 'audio' | 'ggb-file' | 'non-negative' | 'latex' | 'math-ml' | 'math-table' | 'math-text-mix' | 'ggb-variable' | '';
}