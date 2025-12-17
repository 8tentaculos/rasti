/**
 * Development mode flag.
 * This will be replaced during build:
 * - ESM/CJS: replaced with process.env.NODE_ENV !== 'production'
 * - UMD dev: replaced with true
 * - UMD prod: replaced with false
 * @type {boolean}
 * @module
 * @private
 */
const __DEV__ = true;

export default __DEV__;
