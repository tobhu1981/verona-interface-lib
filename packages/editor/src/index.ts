// ============================================================================
// @verona/editor
// Verona Editor Interface (Spec 4.6.0)
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
export { VeronaEditorApiService } from './services/VeronaEditorApiService';

export type {
  VeronaEditorOptions,
  ReadyNotificationData,
  StartCommandData,
  DefinitionChangedNotificationData
} from './services/VeronaEditorApiService';

// ============================================================================
// CONVENIENCE TYPE EXPORTS - Direct access to commonly used types
// ============================================================================

// Direct exports from MainSchema
export type VariableInfo = MainSchema.VariableInfo;
export type Dependency = MainSchema.Dependency;
export type EditorConfig = MainSchema.EditorConfig;
export type SessionIdString = MainSchema.SessionIdString;
export type SharedParameter = MainSchema.SharedParameter;

// Direct exports from PayloadInterfacesProperties.EditorReceive
export type StartCommand = PayloadInterfacesProperties.EditorReceive.StartCommand;

// Direct exports from PayloadInterfacesProperties.EditorSend
export type ReadyNotification = PayloadInterfacesProperties.EditorSend.ReadyNotificationData;
export type DefinitionChangedNotification = PayloadInterfacesProperties.EditorSend.DefinitionChangedNotification;

// Direct exports from AllowedPropertiesValues
export type Role = AllowedPropertiesValues.Role;
export type DependencyType = AllowedPropertiesValues.DependencyType;
export type VariableInfoType = AllowedPropertiesValues.VariableInfoType;
export type Format = AllowedPropertiesValues.Format;

import { MainSchema, PayloadInterfacesProperties, AllowedPropertiesValues } from './types';

