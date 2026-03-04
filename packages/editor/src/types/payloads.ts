// ============================================================================
// VERONA PAYLOAD INTERFACES
// ============================================================================

import { MainSchema } from './schemas';

/**
 * Namespace containing all message payload interfaces.
 * These define the structure of data sent in Verona messages.
 * @public
 */
export namespace PayloadInterfacesProperties {

  /** Namespace containing all editor receives payloads @public*/
  export namespace EditorReceive {

    /** voeStartCommand - Host-> Editor @public*/
    export interface StartCommand {
      sessionId: MainSchema.SessionIdString;
      unitDefinition?: string; // format:byte
      unitDefinitionType?: string;
      editorConfig?: MainSchema.EditorConfig[];
    }
  
  }
  
  /** Namespace containing all editor send payloads @public*/
  export namespace EditorSend {
 
     /** voeReadyNotification - Editor->Host @public*/
    export interface ReadyNotificationData {
      metadata: string; // Stringified JSON-LD metadata
    }
    
    /** voeDefinitionChangedNotification - Editor->Host @public*/
    export interface DefinitionChangedNotification {
      sessionId: MainSchema.SessionIdString;
      timeStamp: string; // format: ISO 8601 date-time
      unitDefinition?: string; // format: byte
      unitDefinitionType?: string;
      variables?: MainSchema.VariableInfo[];
      dependenciesToPlay?: MainSchema.Dependency[];
      dependenciesToEdit?: MainSchema.Dependency[];
      sharedParameters?: MainSchema.SharedParameter[];
      }

  }

}