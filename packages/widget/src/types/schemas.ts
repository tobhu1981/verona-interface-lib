// ============================================================================
// VERONA SCHEMAS
// ============================================================================

/** Namespace containing main-schemas. @public */
export namespace MainSchema {

  /** Session ID string type. Unique identifier for the current widget session. @public */
  export type SessionIdString = string;

  /**
   * Shared parameter for cross-instance communication.
   * The host may collect all shared data sent by modules and provide it to every module.
   * @public
   */
  export interface SharedParameter {
    key: string;   // >= 2 characters
    value: string;
  }

  /**
   * Widget configuration key-value pair sent by the host via StartCommand.
   * @public
   */
  export interface WidgetConfig {
    key: string;
    value: string;
  }

}