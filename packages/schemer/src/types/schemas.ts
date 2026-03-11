// ============================================================================
// VERONA SCHEMAS
// ============================================================================

import { AllowedPropertiesValues } from './values';

/** Namespace containing sub-schemas. @public*/
export namespace SubSchema {

  /**
   * A possible value of a variable.
   * @public
   */
  export interface VariableValue {
    value: string | number | boolean;
    label?: string;
  }

   /**  @public*/
  export interface valuePositionLabels {
    Items: string[];
  }
}

/** Namespace containing main schemas. @public */
export namespace MainSchema {

  /** Session ID string type. Unique identifier for the current schemer session. @public */
  export type SessionIdString = string;

  /**
   * Shared parameter for cross-instance communication.
   * The host may collect all shared data sent by modules and provide it to every module.
   * @public
   */
  export interface SharedParameter {
    /** Identifier to find or set the shared parameter. Minimum 2 characters. */
    key: string;
    value?: string;
    [key: string]: any; // Additional properties are allowed
  }

  /**
   * Dependency on an external file or service required during coding of responses.
   * @public
   */
  export interface Dependency {
    /** Resource identifier (e.g. URL or filename) */
    id: string;
    /** Whether the dependency is a downloadable file or an online service */
    type: AllowedPropertiesValues.DependencyType;
    [key: string]: any; // Additional properties are allowed
  }

  /**
   * Configuration options passed to the schemer via StartCommand.
   * @public
   */
  export interface SchemerConfig {
    /**
     * Base URL for downloading additional resources at runtime.
     * The schemer appends "/" + uri-encoded resource ID to this URL.
     */
    directDownloadUrl?: string;
    /**
     * Shared parameters for cross-module data exchange.
     */
    sharedParameters?: MainSchema.SharedParameter[];
    [key: string]: any; // Additional properties are allowed
  }

  /**
   * Variable info as provided by the editor.
   * Represents the state of a control during assessment and forms the basis of coding.
   * These are referred to as "base variables" in the Verona spec.
   * @public
   */
  export interface VariableInfo {
    /** Identifier for the variable. Must match ^[0-9a-zA-Z_]+$ */
    id: string;
    /** Alternative identifier. Must match ^[0-9a-zA-Z_]+$ */
    alias?: string;
    /** Data type of the variable value */
    type: AllowedPropertiesValues.VariableType;
    /** Data type format */
    format?: AllowedPropertiesValues.VariableFormat;
    /** Can the value be of type Array? Default: false */
    multiple?: boolean;
    /** Can the value be null? Default: false */
    nullable?: boolean;
    /** List of possible values */
    values?: SubSchema.VariableValue[];
    /** Labels of the positions if the value is of type array */
    valuePositionLabels?: SubSchema.valuePositionLabels[];
    /** Are the given values all possible values? Default: false */
    valuesComplete?: boolean;
    /** Page of the unit on which the variable is located */
    page?: string;
  }

}