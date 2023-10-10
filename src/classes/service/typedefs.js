/**
 * Type definitions.
 *
 * @module xeljslib/typedefs
 */

/**
 * An object containing information about application.
 *
 * @typedef  {Object} XelAppInformation
 * @property {string} [name]        - application name.
 * @property {string} [version]     - application version.
 * @property {string} [description] - description of the application.
 * @property {string} [author]      - author name.
 * @property {string} [homepage]    - application homepage URL.
 * @property {string} [license]     - application license.
 * @property {string} [namespace]   - application namespace.
 */

/**
 * An object containing application configuration options.
 *
 * @typedef  {Object}  XelAppConfig
 * @property {string}  [logHeaderColor="c5c"] - log messages header color *(3-letters HEX)*.
 * @property {string}  [logTextColor="ddd"]   - log messages text color *(3-letters HEX)*.
 * @property {boolean} [noConsole=false]      - disable console output.
 */

/**
 * An object containing application configuration options.
 *
 * @typedef  {Object}  XelWebAppConfig
 * @property {string}  [logHeaderColor="c5c"]      - log messages header color *(3-letters HEX)*.
 * @property {string}  [logTextColor="ddd"]        - log messages text color *(3-letters HEX)*.
 * @property {boolean} [noConsole=false]           - disable console output.
 * @property {boolean} [useUserscriptStorage=true] - use userscript storage provided by userscript addon
 *                                                   *(ignored if script is not running as userscripts)*.
 */

/**
 * An object containing storage configuration options.
 *
 * @typedef  {Object}  XelWebAppStorageConfig
 * @property {boolean} [isUserscript=false]        - script running as Userscript.
 * @property {boolean} [useUserscriptStorage=true] - use userscript storage provided by userscript addon
 *                                                   *(ignored if script is not running as userscript)*.
 */

/**
 * Single storage entry.
 *
 * @typedef  {Object}  XelWebAppStorageEntry
 * @property {string}  name    - entry name.
 * @property {*}       [value] - entry value.
 */

/**
 * Upgrade/update storage function.
 *
 * @callback XelWebAppStorageUpgradeCallback
 * @param  {XelWebAppStorage} application - storage instance.
 * @return {void}
 */

/**
 * Event callback function.
 *
 * @callback XelEventCallback
 * @param  {*}    [data] - data passed from event initiator, depends on event type.
 * @return {void}
 */

export {};
