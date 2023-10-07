import XelApp from './modules/xelapp/xelapp';
import { exportToBrowser } from './helpers/export-helper';

/**
 * Xeloses' JS library.
 *
 * @class     XelJSlib
 * @classdesc Javascript library.
 */
const XelJSlib = {
    XelApp: XelApp
}

exportToBrowser( { 'XelJSlib': XelJSlib } );

export default XelJSlib;
