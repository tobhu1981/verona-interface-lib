// ============================================================================
// VERONA PAYLOAD INTERFACES
// ============================================================================

import { MainSchema } from './schemas';

/**
 * Namespace containing all message payload interfaces.
 * These define the structure of data sent in Verona Widget messages.
 * @public
 */
export namespace PayloadInterfacesProperties {

  /** Namespace containing all widget receive payloads @public */
  export namespace WidgetReceive {

    /**
     * vowStartCommand - Host->Widget: Host sends execution parameters.
     * @public
     */
    export interface StartCommand {
      sessionId: MainSchema.SessionIdString;
      widgetConfig?: MainSchema.WidgetConfig[];
      sharedParameters?: MainSchema.SharedParameter[];
      state?: string; // format: byte
    }

  }

  /** Namespace containing all widget send payloads @public */
  export namespace WidgetSend {

    /**
     * vowReadyNotification - Widget->Host: Widget announces readiness.
     * @public
     */
    export interface ReadyNotification {
      metadata: string; // Stringified JSON-LD metadata
    }

    /**
     * vowStateChangedNotification - Widget->Host: Widget sends state data.
     * @public
     */
    export interface StateChangedNotification {
      sessionId: MainSchema.SessionIdString;
      timeStamp: string; // format: ISO 8601 date-time
      sharedParameters?: MainSchema.SharedParameter[];
      state?: string; // format: byte
    }

    /**
     * vowReturnRequested - Widget->Host: Widget calls for closing the widget dialog.
     * @public
     */
    export interface ReturnRequested {
      sessionId: MainSchema.SessionIdString;
      timeStamp: string; // format: ISO 8601 date-time
      sharedParameters?: MainSchema.SharedParameter[];
      state?: string; // format: byte
      /** If true, the host is requested to send the final state to the player. Default: true */
      saveState?: boolean; // default: true
    }

  }

}