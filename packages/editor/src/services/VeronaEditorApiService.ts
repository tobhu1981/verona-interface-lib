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
 *   if (cmd.unitDefinition) loadDefinition(cmd.unitDefinition, cmd.unitDefinitionType);
 *   if (cmd.editorConfig?.role) applyRole(cmd.editorConfig.role);
 *   if (cmd.editorConfig?.directDownloadUrl) configureDownloadUrl(cmd.editorConfig.directDownloadUrl);
 * });
 *
 * // 3. Announce readiness
 * editor.sendReady({ metadata: JSON.stringify(meta) });
 *
 * // 4. Send definition changes whenever the user edits the unit
 * editor.sendDefinitionChanged(definition, definitionType, variables, dependenciesToPlay, dependenciesToEdit);
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
   * Call this **after** registering `onStartCommand`, as the host will respond
   * with a `voeStartCommand` immediately upon receiving this notification.
   *
   * @param data - Notification payload (stringified metadata JSON-LD required by spec)
   * @public
   */
  sendReady(data: ReadyNotificationData): void {
    this.postMessage(VeronaOperations.READY_NOTIFICATION, data);
  }

  /**
   * Send `voeDefinitionChangedNotification` to the host whenever the user edits the unit.
   *
   * The full, updated definition is always sent — not a diff. The host stores it
   * for later use by a player. The `variables` list must always be current and is
   * sent alongside the definition so the schemer can prepare the coding scheme.
   *
   * `dependenciesToPlay` and `dependenciesToEdit` should list all external files or
   * services required at runtime. The host can warn if a dependency is unavailable.
   *
   * Requires an active session (i.e. `onStartCommand` must have fired first).
   *
   * @param unitDefinition      - The complete, updated unit definition serialised as a string
   * @param unitDefinitionType  - Optional format/version identifier for the definition
   * @param variables           - Current list of all variables in the unit
   * @param dependenciesToPlay  - Optional dependencies needed during playback (e.g. GeoGebra)
   * @param dependenciesToEdit  - Optional dependencies needed during editing (e.g. GeoGebra)
   * @param sharedParameters    - Optional shared parameters for cross-module data exchange
   * @public
   */
  sendDefinitionChanged(
    unitDefinition?: string,
    unitDefinitionType?: string,
    variables?: MainSchema.VariableInfo[],
    dependenciesToPlay?: MainSchema.Dependency[],
    dependenciesToEdit?: MainSchema.Dependency[],
    sharedParameters?: MainSchema.SharedParameter[]
  ): void {
    if (!this.sessionId) {
      console.warn('[VeronaEditor] Cannot send voeDefinitionChangedNotification: no active session. Did the host send voeStartCommand?');
      return;
    }

    const data: DefinitionChangedNotificationData = {
      sessionId: this.sessionId,
      timeStamp: new Date().toISOString(),
      unitDefinition,
      unitDefinitionType,
      variables,
      dependenciesToPlay,
      dependenciesToEdit,
      sharedParameters
    };

    this.postMessage(VeronaOperations.DEFINITION_CHANGED_NOTIFICATION, data);
  }

  // ============================================================================
  // PUBLIC API – RECEIVING
  // ============================================================================

  /**
   * Register a handler for `voeStartCommand`.
   *
   * The StartCommand is **mandatory** for the Editor – it carries the unit
   * definition and configuration the editor needs to initialise its UI.
   * Per spec, messages without a `sessionId` are silently discarded.
   * The session ID is stored automatically before your callback is called.
   *
   * Register this handler **before** calling `sendReady()`.
   *
   * Typical usage in the callback:
   * - Load `unitDefinition` into the editor UI (if provided)
   * - Apply `editorConfig.role` to restrict/expand available features
   * - Set `editorConfig.directDownloadUrl` for lazy-loaded resources (e.g. GeoGebra)
   * - Apply `editorConfig.sharedParameters` for cross-module coordination
   *
   * @param callback - Called with the full start-command payload
   * @public
   */
  onStartCommand(callback: (data: StartCommandData) => void): void {
    this.on(VeronaOperations.START_COMMAND, (data: StartCommandData) => {
      // Per spec: "If a message has no or empty session id, it's not processed."
      if (!data.sessionId) {
        console.warn('[VeronaEditor] Received voeStartCommand without sessionId – ignoring.');
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
   * Central message handler – validates origin and structure,
   * then dispatches to registered callbacks.
   * @internal
   */
  private handleMessage(event: MessageEvent): void {
    if (this.allowedOrigin !== '*' && event.origin !== this.allowedOrigin) {
      if (this.debug) {
        console.warn(`[VeronaEditor] Message from disallowed origin "${event.origin}" – ignored.`);
      }
      return;
    }

    if (!isVeronaMessage(event.data)) {
      return;
    }

    const data = event.data;

    if (this.debug) {
      console.log('[VeronaEditor] Received:', data);
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
}