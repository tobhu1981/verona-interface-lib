// ============================================================================
// ENCODING UTILITIES
// ============================================================================

/**
 * Encode data to Base64 (UTF-8 safe)
 * 
 * @param data - Object or string to encode
 * @returns Base64 encoded string
 * 
 * @example
 * ```typescript
 * const encoded = encodeBase64({ key: 'value' });
 * console.log(encoded); // "eyJrZXkiOiJ2YWx1ZSJ9"
 * ```
 */
export function encodeBase64(data: object | string): string {
  const json = typeof data === 'string' ? data : JSON.stringify(data);
  return btoa(unescape(encodeURIComponent(json)));
}

/**
 * Decode Base64 to data (UTF-8 safe)
 * 
 * @param base64 - Base64 encoded string
 * @returns Decoded data
 * 
 * @example
 * ```typescript
 * const decoded = decodeBase64<{ key: string }>('eyJrZXkiOiJ2YWx1ZSJ9');
 * console.log(decoded); // { key: 'value' }
 * ```
 */
export function decodeBase64<T = any>(base64: string): T {
  const json = decodeURIComponent(escape(atob(base64)));
  return JSON.parse(json) as T;
}