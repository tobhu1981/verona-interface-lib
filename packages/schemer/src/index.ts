// ============================================================================
// @verona/interfaces
// TypeScript Library für Verona Player
// ============================================================================

// Constants (not exported by default, use specific imports if needed)
export { DEFAULT_TARGET_ORIGIN, PACKAGE_VERSION, VERONA_SPEC_VERSION} from './constants';

// Re-export shared utilities
export { encodeBase64, decodeBase64, isVeronaMessage } from '@verona/shared';

// Types
export * from './types';

// Services
export { VeronaSchemerApiService } from './services/VeronaSchemerApiService';

export type {
  VeronaSchemerOptions,
  ReadyNotificationData,
  StartCommandData,
  SchemeChangedNotificationData  
} from './services/VeronaSchemerApiService';

// ============================================================================
// CONVENIENCE TYPE EXPORTS
// ============================================================================

// Direct exports from MainSchema
export type SessionIdString = MainSchema.SessionIdString;
export type SharedParameter = MainSchema.SharedParameter;
export type Dependency = MainSchema.Dependency;
export type SchemerConfig = MainSchema.SchemerConfig;
export type VariableInfo = MainSchema.VariableInfo;
export type VariableType = AllowedPropertiesValues.VariableType;
export type VariableFormat = AllowedPropertiesValues.VariableFormat;
export type VariableValue = SubSchema.VariableValue;

// Direct exports from PayloadInterfacesProperties.SchemerReceive
export type StartCommand = PayloadInterfacesProperties.SchemerReceive.StartCommand;

// Direct exports from PayloadInterfacesProperties.SchemerSend
export type ReadyNotification = PayloadInterfacesProperties.SchemerSend.ReadyNotification;
export type SchemeChangedNotification = PayloadInterfacesProperties.SchemerSend.SchemeChangedNotification;

import { MainSchema, PayloadInterfacesProperties } from './types';import { SubSchema } from './types/schemas';
import { AllowedPropertiesValues } from './types/values';

