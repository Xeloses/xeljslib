/**
 * Main entry module.
 * @module xeljslib
 */

import XelApp from './classes/xelapp';
import XelWebApp from './classes/xelwebapp';
import Export from './utility/exporter';

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
