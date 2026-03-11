// ============================================================================
// VERONA SCHEMER API SERVICE
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
 * Schemer configuration options
 * @public
 */
export interface VeronaSchemerOptions {
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
  extends PayloadInterfacesProperties.SchemerSend.ReadyNotification {}

/**
 * Data received from host via start command
 * @public
 */
export interface StartCommandData
  extends PayloadInterfacesProperties.SchemerReceive.StartCommand {
  type: typeof VeronaOperations.START_COMMAND;
}

/**
 * Data for the scheme-changed notification sent to host
 * @public
 */
export interface SchemeChangedNotificationData
  extends PayloadInterfacesProperties.SchemerSend.SchemeChangedNotification {}

// ============================================================================
// SERVICE CLASS
// ============================================================================

/**
 * Verona Schemer Interface
 * Handles communication between schemer and host application.
 *
 * ### Lifecycle
 * ```typescript
 * // 1. Instantiate
 * const schemer = new VeronaSchemeApiService({ debug: true });
 *
 * // 2. Register handler BEFORE sendReady()
 * schemer.onStartCommand((cmd) => {
 *   initUiFromVariables(cmd.variables);
 *   if (cmd.codingScheme) loadScheme(cmd.codingScheme, cmd.codingSchemeType);
 *   if (cmd.schemerConfig?.directDownloadUrl) configureDownloadUrl(cmd.schemerConfig.directDownloadUrl);
 * });
 *
 * // 3. Announce readiness
 * schemer.sendReady({ metadata: JSON.stringify(meta) });
 *
 * // 4. Send scheme changes whenever the user edits the coding scheme
 * schemer.sendSchemeChanged(scheme, schemeType, dependencies, sharedParameters);
 *
 * // 5. Cleanup (e.g. in ngOnDestroy)
 * schemer.destroy();
 * ```
 *
 * @public
 */
export class VeronaSchemerApiService {
  private readonly messageHandlers: Map<string, Set<Function>> = new Map();
  private sessionId: string | null = null;
  private readonly debug: boolean;
  private readonly allowedOrigin: string;
  private readonly targetWindow: Window;
  private readonly messageListener: (event: MessageEvent) => void;

  constructor(options: VeronaSchemerOptions = {}) {
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
   * Send `vosReadyNotification` to the host.
   * Call this **after** registering `onStartCommand`, as the host will respond
   * with a `vosStartCommand` immediately upon receiving this notification.
   *
   * @param data - Notification payload (stringified metadata JSON-LD required by spec)
   * @public
   */
  sendReady(data: ReadyNotificationData): void {
    this.postMessage(VeronaOperations.READY_NOTIFICATION, data);
  }

  /**
   * Send `vosSchemeChangedNotification` to the host whenever the user edits the coding scheme.
   *
   * The full, updated scheme is always sent — not a diff. The host stores it
   * for later use by a coder. `dependenciesToCode` must list all external files
   * or services required at coding time so the host can ensure they remain accessible.
   *
   * Requires an active session (i.e. `onStartCommand` must have fired first,
   * as `sessionId` is mandatory in this notification).
   *
   * @param codingScheme        - The complete, updated coding scheme serialised as a string
   * @param codingSchemeType    - Optional format/version identifier for the coding scheme
   * @param dependenciesToCode  - Optional external files or services needed during coding
   * @param sharedParameters    - Optional shared parameters for cross-module data exchange
   * @public
   */
  sendSchemeChanged(
    codingScheme?: string,
    codingSchemeType?: string,
    dependenciesToCode?: MainSchema.Dependency[],
    sharedParameters?: MainSchema.SharedParameter[]
  ): void {
    if (!this.sessionId) {
      this.warn('Cannot send vosSchemeChangedNotification: no active session. Did the host send vosStartCommand?');
      return;
    }

    const data: SchemeChangedNotificationData = {
      sessionId: this.sessionId,
      timeStamp: new Date().toISOString(),
      codingScheme,
      codingSchemeType,
      dependenciesToCode,
      sharedParameters
    };

    this.postMessage(VeronaOperations.SCHEME_CHANGED_NOTIFICATION, data);
  }

  // ============================================================================
  // PUBLIC API – RECEIVING
  // ============================================================================

  /**
   * Register a handler for `vosStartCommand`.
   *
   * Unlike the Widget, the StartCommand is **mandatory** for the Schemer –
   * the `variables` list is the foundation the schemer's UI is built upon.
   * The session ID is stored automatically before your callback is called.
   *
   * Register this handler **before** calling `sendReady()`.
   *
   * Typical usage in the callback:
   * - Initialise the UI from `variables`
   * - Load an existing `codingScheme` if provided
   * - Configure runtime behaviour from `schemerConfig`
   *   (e.g. set `directDownloadUrl` for lazy-loaded resources)
   *
   * @param callback - Called with the full start-command payload
   * @public
   */
  onStartCommand(callback: (data: StartCommandData) => void): void {
    this.on(VeronaOperations.START_COMMAND, (data: StartCommandData) => {
      // Per spec: "If a message has no or empty session id, it's not processed."
      if (!data.sessionId) {
        this.warn('Received vosStartCommand without sessionId – ignoring.');
        return;
      }
      this.sessionId = data.sessionId;
      callback(data);
    });
  }

  // ============================================================================
  // GETTERS
  // ============================================================================

  /**
   * Returns the current session ID, or `null` if no start command has been received yet.
   * @public
   */
  get currentSessionId(): string | null {
    return this.sessionId;
  }

  // ============================================================================
  // CLEANUP
  // ============================================================================

  /**
   * Remove the global `message` event listener and clear all handlers.
   * Call this when the schemer component is destroyed (e.g. `ngOnDestroy`).
   * @public
   */
  public destroy(): void {
    window.removeEventListener('message', this.messageListener);
    this.messageHandlers.clear();
    this.sessionId = null;

    if (this.debug) {
      console.log('[VeronaSchemer] Destroyed');
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
      console.log('[VeronaSchemer] Sent:', message);
    }
  }

  /**
   * Central message handler – validates origin and structure,
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
      console.log('[VeronaSchemer] Received:', data);
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
   * Emit a console warning (always, not only in debug mode) for spec violations,
   * and additionally log to console in debug mode.
   * @internal
   */
  private warn(message: string): void {
    console.warn('[VeronaSchemer]', message);
  }
}