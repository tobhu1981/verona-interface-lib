// ============================================================================
// CONSTANTS
// ============================================================================

import pkg from '../package.json';

/** @internal Default target origin for postMessage */
export const DEFAULT_TARGET_ORIGIN = '*';

/**
 * NPM package version of @verona/player library
 * @public
 */
export const PACKAGE_VERSION = pkg.version;

/**
 * Verona Editor Specification version
 * @public
 */
export const VERONA_SPEC_VERSION = pkg.version;