// ============================================================================
// VERONA EDITOR API SERVICE
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
 * Editor configuration options
 * @public
 */
export interface VeronaEditorOptions {
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
  extends PayloadInterfacesProperties.EditorSend.ReadyNotificationData {}

/**
 * Data received from host via start command
 * @public
 */
export interface StartCommandData
  extends PayloadInterfacesProperties.EditorReceive.StartCommand {
  type: typeof VeronaOperations.START_COMMAND;
}

/**
 * Data for the definition-changed notification sent to host
 * @public
 */
export interface DefinitionChangedNotificationData
  extends PayloadInterfacesProperties.EditorSend.DefinitionChangedNotification {}

// ============================================================================
// SERVICE CLASS
// ============================================================================

/**
 * Verona Editor Interface
 * Handles communication between editor and host application.
 *
 * ### Lifecycle
 * ```typescript
 * // 1. Instantiate
 * const editor = new VeronaEditorApiService({ debug: true });
 *
 * // 2. Register handler BEFORE sendReady()
 * editor.onStartCommand((cmd) => {
 *   loadUnit(cmd.unitDefinition);
 * });
 *
 * // 3. Announce readiness
 * editor.sendReady({ metadata: JSON.stringify(meta) });
 *
 * // 4. Send changes whenever the unit definition changes
 * editor.sendDefinitionChanged(unitDefString, 'my-editor@1.0', variables);
 *
 * // 5. Cleanup (e.g. in ngOnDestroy)
 * editor.destroy();
 * ```
 *
 * @public
 */
export class VeronaEditorApiService {
  private readonly messageHandlers: Map<string, Set<Function>> = new Map();
  private sessionId: string | null = null;
  private readonly debug: boolean;
  private readonly allowedOrigin: string;
  private readonly targetWindow: Window;
  private readonly messageListener: (event: MessageEvent) => void;

  constructor(options: VeronaEditorOptions = {}) {
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
   * Send `voeReadyNotification` to the host.
   * Call this **after** registering all handlers (especially `onStartCommand`).
   *
   * @param data - Notification payload (metadata string required by spec)
   * @public
   */
  sendReady(data: ReadyNotificationData): void {
    this.postMessage(VeronaOperations.READY_NOTIFICATION, data);
  }

  /**
   * Send `voeDefinitionChangedNotification` to the host whenever the unit
   * definition has changed (e.g. after every editor action that modifies it).
   *
   * Requires an active session (i.e. `onStartCommand` must have fired first).
   *
   * @param unitDefinition    - Serialised unit definition (plain JSON string or base64)
   * @param unitDefinitionType - Optional MIME/type identifier
   * @param variables          - Optional variable metadata
   * @param dependencies       - Optional file/service dependencies
   * @param dependenciesToPlay - Optional subset of dependencies needed by the player
   * @public
   */
  sendDefinitionChanged(
  unitDefinition: string,
  unitDefinitionType?: string,
  variables?: MainSchema.VariableInfo[],
  dependenciesToPlay?: MainSchema.Dependency[],
  dependenciesToEdit?: MainSchema.Dependency[]
  ): void {
    if (!this.sessionId) {
      this.warn('Cannot send voeDefinitionChangedNotification: no active session (sessionId missing). Did the host send voeStartCommand?');
      return;
    }

    const data: DefinitionChangedNotificationData = {
    sessionId: this.sessionId,
    timeStamp: new Date().toISOString(),
    unitDefinition,
    unitDefinitionType,
    variables,
    dependenciesToPlay,
    dependenciesToEdit
  };

    this.postMessage(VeronaOperations.STATE_CHANGED_NOTIFICATION, data);
  }

  // ============================================================================
  // PUBLIC API – RECEIVING
  // ============================================================================

  /**
   * Register a handler for `voeStartCommand`.
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
        this.warn('Received voeStartCommand without sessionId – ignoring.');
      }
    });
  }

  // ============================================================================
  // CLEANUP
  // ============================================================================

  /**
   * Remove the global `message` event listener and clear all handlers.
   * Call this when the editor component is destroyed (e.g. `ngOnDestroy`).
   * @public
   */
  public destroy(): void {
    window.removeEventListener('message', this.messageListener);
    this.messageHandlers.clear();
    this.sessionId = null;

    if (this.debug) {
      console.log('[VeronaEditor] Destroyed');
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
      console.log('[VeronaEditor] Sent:', message);
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
      return; // silently ignore non-Verona messages (e.g. devtools, HMR, …)
    }

    const data = event.data;

    if (this.debug) {
      console.log('[VeronaEditor] Received:', data);
    }

    // Once a session is established, reject messages with a wrong sessionId
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
      console.warn('[VeronaEditor]', message);
    }
  }
}