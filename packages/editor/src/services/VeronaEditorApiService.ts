// ============================================================================
// VERONA EDITOR API SERVICE
// ============================================================================

import { isVeronaMessage, VeronaMessage } from '@verona/shared';
import { DEFAULT_TARGET_ORIGIN } from '../constants';
import type {
  VeronaEditorOptions,
  StartCommandData,
  ReadyNotificationData,
  DefinitionChangedNotificationData,
  EditorConfig,
  VariableInfo,
  Dependency
} from '../types';

/**
 * Verona Editor Interface
 * Handles communication between editor and host application
 * 
 * @public
 */
export class VeronaEditorApiService {
  private messageHandlers: Map<string, Set<Function>> = new Map();
  private sessionId: string | null = null;
  private debug: boolean;
  private allowedOrigin: string;
  private targetWindow: Window;
  private messageListener: (event: MessageEvent) => void;

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
  // PUBLIC API - SENDING MESSAGES
  // ============================================================================

  /**
   * Send ready notification to host
   * @public
   * 
   */
  sendReady(data: Omit<ReadyNotificationData, 'type'>): void {
    this.postMessage('voeReadyNotification', data);
  }

  /**
   * Send definition changed notification to host
   * @public
   * 
   */
  sendDefinitionChanged(
    unitDefinition: string,
    unitDefinitionType?: string,
    variables?: VariableInfo[],
    dependencies?: Dependency[],
    dependenciesToPlay?: Dependency[]
  ): void {
    if (!this.sessionId) {
      this.warn('Cannot send definition changed without sessionId');
      return;
    }

    const data: Omit<DefinitionChangedNotificationData, 'type'> = {
      sessionId: this.sessionId,
      timeStamp: new Date().toISOString(),
      unitDefinition,
      unitDefinitionType,
      variables,
      dependencies,
      dependenciesToPlay
    };

    this.postMessage('voeDefinitionChangedNotification', data);
  }

  // ============================================================================
  // PUBLIC API - REGISTERING HANDLERS
  // ============================================================================

  /**
   * Register handler for start command
   * @public
   * 
   */
  onStartCommand(callback: (data: StartCommandData) => void): void {
    this.on('voeStartCommand', (data: StartCommandData) => {
      this.sessionId = data.sessionId;
      callback(data);
    });
  }

  // ============================================================================
  // CLEANUP
  // ============================================================================

  /**
   * Clean up resources and remove event listeners
   * Call this when the editor is no longer needed (e.g., in ngOnDestroy)
   * @public
   * 
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
  // INTERNAL METHODS
  // ============================================================================

  /**
   * Send a postMessage to the host window
   * @internal
   */
  private postMessage(type: string, data: any): void {
    const message: VeronaMessage = {
      type: type as any,
      ...data
    };

    this.targetWindow.postMessage(message, this.allowedOrigin);

    if (this.debug) {
      console.log('[VeronaEditor] Sent:', message);
    }
  }

  /**
   * Handle incoming postMessage
   * @internal
   */
  private handleMessage(event: MessageEvent): void {
    // Validate origin if specified
    if (this.allowedOrigin !== '*' && event.origin !== this.allowedOrigin) {
      this.warn(`Message from invalid origin: ${event.origin}`);
      return;
    }

    // Validate message structure
    if (!isVeronaMessage(event.data)) {
      return; // Silently ignore non-Verona messages
    }

    const data = event.data;

    if (this.debug) {
      console.log('[VeronaEditor] Received:', data);
    }

    // Validate sessionId for commands that require it
    if (this.sessionId && data.sessionId && data.sessionId !== this.sessionId) {
      this.warn(`SessionId mismatch: expected ${this.sessionId}, got ${data.sessionId}`);
      return;
    }

    // Trigger registered handlers
    const handlers = this.messageHandlers.get(data.type);
    if (handlers) {
      handlers.forEach(handler => handler(data));
    }
  }

  /**
   * Register a message handler
   * @internal
   */
  private on(type: string, callback: Function): void {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, new Set());
    }
    this.messageHandlers.get(type)!.add(callback);
  }

  /**
   * Log a warning message if debug is enabled
   * @internal
   */
  private warn(message: string): void {
    if (this.debug) {
      console.warn('[VeronaEditor]', message);
    }
  }
}