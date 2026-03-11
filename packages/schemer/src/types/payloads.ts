// ============================================================================
// VERONA PAYLOAD INTERFACES
// ============================================================================

import { MainSchema } from './schemas';

/**
 * Namespace containing all message payload interfaces.
 * These define the structure of data sent in Verona Schemer messages.
 * @public
 */
export namespace PayloadInterfacesProperties {

  /** Namespace containing all schemer receive payloads @public */
  export namespace SchemerReceive {

    /**
     * vosStartCommand - Host->Schemer: Host sends variables and optional coding scheme.
     *
     * The `variables` list is the foundation of all coding – the schemer cannot
     * function without it. `sessionId` is required and must be echoed back in
     * every subsequent `vosSchemeChangedNotification`.
     * @public
     */
    export interface StartCommand {
      /** Required. Used to associate all subsequent messages with this unit. */
      sessionId: MainSchema.SessionIdString;
      /**
       * The coding scheme to be edited (if any).
       * Passed as a serialised string (format: byte).
       */
      codingScheme?: string;
      /**
       * Identifies the format/version of the coding scheme.
       * Helps the schemer avoid UI issues when loading older schemes.
       */
      codingSchemeType?: string;
      /**
       * Variables from the unit definition.
       * These represent control states during assessment and are the basis for coding.
       */
      variables?: MainSchema.VariableInfo[];
      /** Schemer-specific configuration */
      schemerConfig?: MainSchema.SchemerConfig;
    }

  }

  /** Namespace containing all schemer send payloads @public */
  export namespace SchemerSend {

    /**
     * vosReadyNotification - Schemer->Host: Schemer announces readiness.
     * Sent as the last step of the schemer's own initialisation.
     * @public
     */
    export interface ReadyNotification {
      /** Stringified JSON-LD metadata object from the schemer's html header. */
      metadata: string;
    }

    /**
     * vosSchemeChangedNotification - Schemer->Host: Coding scheme has changed.
     *
     * Sent whenever the user makes a change to the coding scheme.
     * The host uses `timeStamp` to ensure correct ordering of asynchronous messages.
     * @public
     */
    export interface SchemeChangedNotification {
      /** Session ID from the start command. Required for correct unit association. */
      sessionId: MainSchema.SessionIdString;
      /** ISO 8601 date-time string. Used to order asynchronously arriving messages. */
      timeStamp: string;
      /**
       * The complete, updated coding scheme serialised as a string.
       * The host stores this for later use by a coder.
       */
      codingScheme?: string;
      /**
       * Identifies the format/version of the coding scheme.
       * Helps the host (and future coders) interpret the scheme correctly.
       */
      codingSchemeType?: string;
      /**
       * External files or services that must be available when coding responses.
       * The host must ensure these dependencies are accessible during coding.
       */
      dependenciesToCode?: MainSchema.Dependency[];
      /** Shared parameters for cross-module data exchange. */
      sharedParameters?: MainSchema.SharedParameter[];
    }

  }

}