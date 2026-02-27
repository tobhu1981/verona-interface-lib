// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

/**
 * Validate ISO 8601 date-time string
 * 
 * @param value - String to validate
 * @returns True if valid ISO date-time
 */
export function isValidISODateTime(value: string): boolean {
  const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/;
  if (!isoRegex.test(value)) return false;
  
  const date = new Date(value);
  return !isNaN(date.getTime());
}

/**
 * Validate operation ID format
 * 
 * @param value - String to validate
 * @returns True if valid operation ID
 */
export function isValidOperationId(value: string): boolean {
  return /^vo[pews][A-Z][a-zA-Z]*$/.test(value);
}

export interface VeronaMessage {
  type: string;
  sessionId?: string;
  [key: string]: any;  // Alle anderen Properties erlaubt
}

/**
 * Check if object is a valid Verona message
 * 
 * @param obj - Object to check
 * @returns True if valid message structure
 */
export function isVeronaMessage(obj: any): obj is VeronaMessage {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'type' in obj &&
    typeof obj.type === 'string' &&
    isValidOperationId(obj.type)
  );
}