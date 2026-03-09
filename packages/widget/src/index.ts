// ============================================================================
// @verona/widget
// // TypeScript Library für Verona Widget
// ============================================================================

// Constants
export {
  PACKAGE_VERSION,
  VERONA_SPEC_VERSION,
  DEFAULT_TARGET_ORIGIN
} from './constants';

// Re-export shared utilities
export {
  encodeBase64,
  decodeBase64,
  isVeronaMessage
} from '@verona/shared';

// Types
export * from './types';

// Services
export { VeronaWidgetApiService } from './services/VeronaWidgetApiService';

export type {
  VeronaWidgetOptions,
  ReadyNotificationData,
  StartCommandData,
  StateChangedNotificationData,
  ReturnRequestedData
} from './services/VeronaWidgetApiService';

// ============================================================================
// CONVENIENCE TYPE EXPORTS
// ============================================================================

// Direct exports from MainSchema
export type SessionIdString = MainSchema.SessionIdString;
export type SharedParameter = MainSchema.SharedParameter;
export type WidgetConfig = MainSchema.WidgetConfig;

// Direct exports from PayloadInterfacesProperties.WidgetReceive
export type StartCommand = PayloadInterfacesProperties.WidgetReceive.StartCommand;

// Direct exports from PayloadInterfacesProperties.WidgetSend
export type ReadyNotification = PayloadInterfacesProperties.WidgetSend.ReadyNotification;
export type StateChangedNotification = PayloadInterfacesProperties.WidgetSend.StateChangedNotification;
export type ReturnRequested = PayloadInterfacesProperties.WidgetSend.ReturnRequested;

import { MainSchema, PayloadInterfacesProperties } from './types';