/**
 * Main entry module.
 * @module xeljslib
 */

import XelApp from './modules/xelapp/xelapp';
import XelWebApp from './modules/xelapp/xelwebapp';
import Export from './helpers/helper-export';

/**
 * Xeloses' JS library.
 *
 * @class     XelJSlib
 * @classdesc Javascript library.
 */
const XelJSlib = {
    XelApp:    XelApp,
    XelWebApp: XelWebApp
}

Export.toBrowser({ XelJSlib: XelJSlib });
export default XelJSlib;
