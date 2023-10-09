/**
 * Type definitions.
 * @module xeljslib/classes/typedefs
 */

/**
 * An object containing information about application.
 *
 * @typedef  {Object} XelAppInformation
 * @property {string} [name]        - Application name.
 * @property {string} [version]     - Application version.
 * @property {string} [description] - Description of the Application.
 * @property {string} [author]      - Author name.
 * @property {string} [homepage]    - Application homepage URL.
 * @property {string} [license]     - Application license.
 * @property {string} [namespace]   - Application namespace.
 */

/**
 * An object containing application configuration options.
 *
 * @typedef  {Object}  XelAppConfig
 * @property {string}  [logHeaderColor=c5c]       - Log messages header color *(3-letters HEX)*.
 * @property {string}  [logTextColor=ddd]         - Log messages text color *(3-letters HEX)*.
 * @property {boolean} [noConsole=false]          - Disable console output.
 */

/**
 * An object containing application configuration options.
 *
 * @typedef  {Object}  XelWebAppConfig
 * @property {string}  [logHeaderColor=c5c]        - Log messages header color *(3-letters HEX)*.
 * @property {string}  [logTextColor=ddd]          - Log messages text color *(3-letters HEX)*.
 * @property {boolean} [noConsole=false]           - Disable console output.
 * @property {boolean} [useUserscriptStorage=true] - Use userscript storage provided by userscript addon
 *                                                   *(ignored if script is not running as userscripts)*.
 */

/**
 * An object containing storage configuration options.
 *
 * @typedef  {Object}  XelWebAppStorageConfig
 * @property {boolean} [isUserscript=false]        - Script running as Userscript.
 * @property {boolean} [useUserscriptStorage=true] - Use userscript storage provided by userscript addon
 *                                                   *(ignored if script is not running as userscript)*.
 */

/**
 * Single storage entry.
 *
 * @typedef  {Object}  XelWebAppStorageEntry
 * @property {string}  name    - Entry name.
 * @property {*}       [value] - Entry value.
 */

/**
 * Upgrade/update storage function.
 *
 * @callback XelWebAppStorageUpgradeCallback
 * @param  {XelWebAppStorage} Application - Storage instance.
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
