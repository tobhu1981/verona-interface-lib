// ============================================================================
// VERONA SCHEMAS
// ============================================================================

import { AllowedPropertiesValues } from './values';

/** Namespace containing sub-schemas. @public*/
export namespace SubSchema {

  /**  @public*/
  export interface sharedParameters {
    key: string; // >= 2 characters
    value?: string;
  }

   /**  @public*/
  export interface values {
    value: string | number | boolean;
    label?: string;
  }

   /**  @public*/
  export interface valuePositionLabels {
    Items: string[];
  }
}

/** Namespace containing main-schemas. @public*/
export namespace MainSchema {
 
   /** Session ID string type. Unique identifier for the current editor session. @public*/
  export type SessionIdString = string;

   /** Shared parameter for cross-instance communication @public */
  export interface SharedParameter {
    key: string; // >= 2 characters
    value?: string;
  }

  /** Editor automatically fetches additional resources by appending the resource ID to the directDownloadUrl @public*/
  export interface EditorConfig {
    directDownloadUrl?: string; // ISO 8601 date-time
    role?: AllowedPropertiesValues.Role;
    sharedParameters?: SubSchema.sharedParameters[];
  }
   
  /** @public*/
  export interface Dependency {
    id: string;
    type: AllowedPropertiesValues.DependencyType;
  }
 
 /** Variable data help to prepare the processing of answers (coding scheme). @public*/
  export interface VariableInfo {
    id: string; //must match: ^[0-9a-zA-Z_]+$
    alias?: string; //must match: ^[0-9a-zA-Z_]+$
    type: AllowedPropertiesValues.VariableInfoType;
    format?: AllowedPropertiesValues.Format;
    multiple?: boolean; // Default: false
    nullable?: boolean; // Default: false
    values?: SubSchema.values[];
    valuePositionLabels?: SubSchema.valuePositionLabels;
    valuesComplete?: boolean; // Default: false
    page?: string; // Page of the unit, on which the variable is located.
  }
}