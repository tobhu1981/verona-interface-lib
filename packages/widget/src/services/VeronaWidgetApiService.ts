// ============================================================================
// VERONA WIDGET API SERVICE
// ============================================================================

import { isVeronaMessage, VeronaMessage } from '@verona/shared';
import { DEFAULT_TARGET_ORIGIN } from '../constants';
import {
  VeronaOperations,
  PayloadInterfacesProperties,
  MainSchema
} from '../types';

// ============================================================================
// OPTIONS & DATA INTERFACES
// ============================================================================

/**
 * Widget configuration options
 * @public
 */
export interface VeronaWidgetOptions {
  /** Enable debug logging */
  debug?: boolean;
  /** Allowed origin for postMessage security */
  allowedOrigin?: string;
}

/**
 * Data for the ready notification sent to host
 * @public
 */
export interface ReadyNotificationData
  extends PayloadInterfacesProperties.WidgetSend.ReadyNotification {}

/**
 * Data received from host via start command
 * @public
 */
export interface StartCommandData
  extends PayloadInterfacesProperties.WidgetReceive.StartCommand {
  type: typeof VeronaOperations.START_COMMAND;
}

/**
 * Data for the state-changed notification sent to host
 * @public
 */
export interface StateChangedNotificationData
  extends PayloadInterfacesProperties.WidgetSend.StateChangedNotification {}

/**
 * Data for the return-requested notification sent to host
 * @public
 */
export interface ReturnRequestedData
  extends PayloadInterfacesProperties.WidgetSend.ReturnRequested {}

// ============================================================================
// SERVICE CLASS
// ============================================================================

/**
 * Verona Widget Interface
 * Handles communication between widget and host application.
 *
 * ### Lifecycle
 * ```typescript
 * // 1. Instantiate
 * const widget = new VeronaWidgetApiService({ debug: true });
 *
 * // 2. Register handler BEFORE sendReady()
 * widget.onStartCommand((cmd) => {
 *   restoreState(cmd.state);
 * });
 *
 * // 3. Announce readiness
 * widget.sendReady({ metadata: JSON.stringify(meta) });
 *
 * // 4. Send state changes
 * widget.sendStateChanged(state, sharedParameters);
 *
 * // 5. Request closing the widget dialog
 * widget.sendReturnRequested(state, sharedParameters, saveState);
 *
 * // 6. Cleanup (e.g. in ngOnDestroy)
 * widget.destroy();
 * ```
 *
 * @public
 */
export class VeronaWidgetApiService {
  private readonly messageHandlers: Map<string, Set<Function>> = new Map();
  private sessionId: string | null = null;
  private readonly debug: boolean;
  private readonly allowedOrigin: string;
  private readonly targetWindow: Window;
  private readonly messageListener: (event: MessageEvent) => void;

  constructor(options: VeronaWidgetOptions = {}) {
    this.debug = options.debug ?? false;
    this.allowedOrigin = options.allowedOrigin ?? DEFAULT_TARGET_ORIGIN;
    this.targetWindow = window.parent;

    this.messageListener = (event: MessageEvent) => {
      this.handleMessage(event);
    };

    window.addEventListener('message', this.messageListener);
  }

  // ============================================================================
  // PUBLIC API – SENDING
  // ============================================================================

  /**
   * Send `vowReadyNotification` to the host.
   * Call this **after** registering all handlers (especially `onStartCommand`).
   *
   * @param data - Notification payload (metadata string required by spec)
   * @public
   */
  sendReady(data: ReadyNotificationData): void {
    this.postMessage(VeronaOperations.READY_NOTIFICATION, data);
  }

  /**
   * Send `vowStateChangedNotification` to the host whenever the widget state changes.
   *
   * Requires an active session (i.e. `onStartCommand` must have fired first).
   *
   * @param state            - Serialised widget state (base64)
   * @param sharedParameters - Optional shared parameters
   * @public
   */
  sendStateChanged(
    state?: string,
    sharedParameters?: MainSchema.SharedParameter[]
  ): void {
    if (!this.sessionId) {
      this.warn('Cannot send vowStateChangedNotification: no active session. Did the host send vowStartCommand?');
      return;
    }

    const data: StateChangedNotificationData = {
      sessionId: this.sessionId,
      timeStamp: new Date().toISOString(),
      state,
      sharedParameters
    };

    this.postMessage(VeronaOperations.STATE_CHANGED_NOTIFICATION, data);
  }

  /**
   * Send `vowReturnRequested` to the host to request closing the widget dialog.
   *
   * Requires an active session (i.e. `onStartCommand` must have fired first).
   *
   * @param state            - Serialised widget state (base64)
   * @param sharedParameters - Optional shared parameters
   * @param saveState        - If true, host is requested to send final state to player. Default: true
   * @public
   */
  sendReturnRequested(
    state?: string,
    sharedParameters?: MainSchema.SharedParameter[],
    saveState: boolean = true
  ): void {
    if (!this.sessionId) {
      this.warn('Cannot send vowReturnRequested: no active session. Did the host send vowStartCommand?');
      return;
    }

    const data: ReturnRequestedData = {
      sessionId: this.sessionId,
      timeStamp: new Date().toISOString(),
      state,
      sharedParameters,
      saveState
    };

    this.postMessage(VeronaOperations.RETURN_REQUESTED, data);
  }

  // ============================================================================
  // PUBLIC API – RECEIVING
  // ============================================================================

  /**
   * Register a handler for `vowStartCommand`.
   *
   * The session ID is stored automatically before your callback is called.
   * Register this handler **before** calling `sendReady()`.
   *
   * @param callback - Called with the full start-command payload
   * @public
   */
  onStartCommand(callback: (data: StartCommandData) => void): void {
    this.on(VeronaOperations.START_COMMAND, (data: StartCommandData) => {
      if (data.sessionId) {
        this.sessionId = data.sessionId;
        callback(data);
      } else {
        this.warn('Received vowStartCommand without sessionId – ignoring.');
      }
    });
  }

  // ============================================================================
  // CLEANUP
  // ============================================================================

  /**
   * Remove the global `message` event listener and clear all handlers.
   * Call this when the widget component is destroyed (e.g. `ngOnDestroy`).
   * @public
   */
  public destroy(): void {
    window.removeEventListener('message', this.messageListener);
    this.messageHandlers.clear();
    this.sessionId = null;

    if (this.debug) {
      console.log('[VeronaWidget] Destroyed');
    }
  }

  // ============================================================================
  // INTERNAL HELPERS
  // ============================================================================

  /**
   * Dispatch a postMessage to the host window.
   * @internal
   */
  private postMessage(type: string, data: object): void {
    const message: VeronaMessage = { type: type as any, ...data };
    this.targetWindow.postMessage(message, this.allowedOrigin);

    if (this.debug) {
      console.log('[VeronaWidget] Sent:', message);
    }
  }

  /**
   * Central message handler – validates origin, structure and session ID,
   * then dispatches to registered callbacks.
   * @internal
   */
  private handleMessage(event: MessageEvent): void {
    if (this.allowedOrigin !== '*' && event.origin !== this.allowedOrigin) {
      this.warn(`Message from disallowed origin "${event.origin}" – ignored.`);
      return;
    }

    if (!isVeronaMessage(event.data)) {
      return;
    }

    const data = event.data;

    if (this.debug) {
      console.log('[VeronaWidget] Received:', data);
    }

    if (this.sessionId && data.sessionId && data.sessionId !== this.sessionId) {
      this.warn(`SessionId mismatch: expected "${this.sessionId}", got "${data.sessionId}" – ignored.`);
      return;
    }

    const handlers = this.messageHandlers.get(data.type);
    if (handlers) {
      handlers.forEach(handler => handler(data));
    }
  }

  /**
   * Register an internal message handler (supports multiple callbacks per type).
   * @internal
   */
  private on(type: string, callback: Function): void {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, new Set());
    }
    this.messageHandlers.get(type)!.add(callback);
  }

  /**
   * Emit a console warning when debug mode is active.
   * @internal
   */
  private warn(message: string): void {
    if (this.debug) {
      console.warn('[VeronaWidget]', message);
    }
  }
}