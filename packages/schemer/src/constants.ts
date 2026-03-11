// ============================================================================
// CONSTANTS
// ============================================================================

import pkg from '../package.json';

/** @internal Default target origin for postMessage */
export const DEFAULT_TARGET_ORIGIN = '*';

/** @internal Minimum length for SharedParameter keys */
export const MIN_SHARED_PARAMETER_KEY_LENGTH = 2;

/**
 * NPM package version of @verona/player library
 * @public
 */
export const PACKAGE_VERSION = pkg.version;

/**
 * Verona Player Specification version implemented by this library
 * @public
 */
export const VERONA_SPEC_VERSION = pkg.veronaSpec;