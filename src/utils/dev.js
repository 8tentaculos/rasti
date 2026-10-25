/**
 * Development mode flag.
 * This will be replaced during build:
 * - `dist/esm` (per-module ESM tree): replaced with process.env.NODE_ENV !== 'production'
 * - Single-file `dist` bundles (ESM/UMD): replaced with true in the development build, false in the minified one
 * @type {boolean}
 * @module
 * @private
 */
const __DEV__ = true;

export default __DEV__;
