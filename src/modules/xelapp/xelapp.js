import XelAppStorage from './xelappstorage';
import { exportToBrowser } from '../../helpers/export-helper';

/**
 * An object containing information about application.
 *
 * @typedef  {Object} XelAppInformation
 * @property {string} [name]        - Application name.
 * @property {string} [version]     - Application version.
 * @property {string} [description] - Description.
 * @property {string} [author]      - Author name.
 * @property {string} [url]         - Application homepage URL.
 * @property {string} [namespace]   - Application namespace.
 */

/**
 * An object containing application configuration options.
 *
 * @typedef  {Object}  XelAppConfig
 * @property {string}  [logHeaderColor=c5c]       - Log messages header color (3-letters HEX).
 * @property {string}  [logTextColor=ddd]         - Log messages text color (3-letters HEX).
 * @property {boolean} [noConsole=false]          - Disable console output.
 * @property {boolean} [preferLocalStorage=false] - prefer to use browser' local storage (usable for userscripts).
 */

/**
 * Upgrade/update storage function.
 *
 * @callback StorageUpgradeCallback
 * @param    {XelAppStorage} Application storage instance.
 * @return   {void}
 */

/**
 * Script application.
 *
 * @class     XelApp
 * @classdesc Implements script application.
 */
class XelApp
{
    /**
     * @constructor
     *
     * @param {XelAppInformation}       [data={}]                      Application information (typedef: {@linkcode XelAppInformation}); pass GM_info to use info from userscript' header.
     * @param {XelAppConfig}            [config={}]                    Application configuraion (typedef: {@linkcode XelAppConfig}).
     * @param {?StorageUpgradeCallback} [storageUpgradeCallback=null]  Storage upgrade/update function (typedef: {@linkcode StorageUpgradeCallback}), executed if version of data in storage is older than version passed to constructor.
     * @memberof XelApp
     */
    constructor( data = {}, config = {}, storageUpgradeCallback = null )
    {
        const conf = Object.assign(
            {
                // Default config:
                logHeaderColor: 'c5c',
                logTextColor: 'ddd',
                noConsole: false,
                preferLocalStorage: false
            },
            config );

        const UserscriptInfo = ( typeof GM_info !== 'undefined' && 'script' in GM_info ) ? GM_info : ( ( data && 'script' in data ) ? data : null );

        this.__is_userscript__ = !!UserscriptInfo;

        this.__name__ = data.name || ( this.__is_userscript__ ? UserscriptInfo.script.name : 'Script' );
        this.__version__ = data.version || ( this.__is_userscript__ ? UserscriptInfo.script.version : '0.0.1' );
        this.__author__ = data.author || ( this.__is_userscript__ ? UserscriptInfo.script.author : null );
        this.__description__ = data.description || ( this.__is_userscript__ ? UserscriptInfo.script.description : null );
        this.__url__ = data.url || ( this.__is_userscript__ ? UserscriptInfo.script.homepage : null );
        this.__namespace__ = data.namespace || ( this.__is_userscript__ ? UserscriptInfo.script.namespace : ( this.__author__ ? `${ this.__author__.replace( /[^.\-\w]+/g, '' ) }.` : '' ) + this.__name__.replace( /[^.\-\w]+/g, '' ) );
        this.__unique_id__ = this.__namespace__.replace( /[.\-\s]+/g, '_' ).replace( /[^\w]+/g, '' ).toLowerCase();

        this.__is_mobile_device__ = this.__isMobile();

        this.__style__ = {
            header: `color:#${ conf.logHeaderColor };font-weight:bold;`,
            text: `color:#${ conf.logTextColor };font-weight:normal;`
        }

        this.__no_console__ = conf.noConsole;

        this.__prefer_local_storage__ = conf.preferLocalStorage;

        if( storageUpgradeCallback )
            this.__onStorageUpgrade__ = storageUpgradeCallback;
    }

    /* ===================== PRIVATE METHODS ===================== */

    /**
     * Initialize app storage.
     *
     * @return {XelAppStorage}
     * @memberof XelApp
     */
    __initStorage()
    {
        try
        {
            this.__storage__ = new XelAppStorage( this.__version__, { preferLocalStorage: this.__prefer_local_storage__ }, this.__onStorageUpgrade__ );
            return this.__storage_;
        }
        catch( e )
        {
            const err = `Unable to initialize app storage: ${ e.message }`;
            this.logError( err );
            throw new Error( err );
        }
    }

    /**
     * Check if script running on mobile device.
     *
     * @return {boolean}
     * @memberof XelApp
     */
    __isMobile()
    {
        if( 'maxTouchPoints' in navigator )
            return ( navigator.maxTouchPoints > 0 );
        else if( 'msMaxTouchPoints' in navigator )
            return ( navigator.msMaxTouchPoints > 0 );
        else
        {
            let mQ = window.matchMedia && matchMedia( '(pointer:coarse)' );
            if( mQ && mQ.media === '(pointer:coarse)' )
                return !!mQ.matches;
            else if( 'orientation' in window ) // deprecated, uses as fallback
                return true;
            else if( 'userAgent' in navigator && navigator.userAgent ) // fallback to user agent sniffing
                return /\b(Android|Windows Phone|iPhone|iPad|iPod|webOS|BlackBerry|Opera Mini|IEMobile)\b/i.test( navigator.userAgent );
        }
    }

    /* ===================== CLASS PROPERTIES ===================== */

    get name() { return this.__name__; }
    get appName() { return this.__name__; }
    get version() { return this.__version__; }
    get ver() { return this.__version__; }
    get author() { return this.__author__; }
    get description() { return this.__description__; }
    get url() { return this.__url__; }
    get homepage() { return this.__url__; }
    get namespace() { return this.__namespace__; }
    get ns() { return this.__namespace__; }
    get prefix() { return this.__unique_id__; }
    get unique() { return this.__unique_id__; }

    get isUserscript() { return this.__is_userscript__; }
    get isMobile() { return this.__is_mobile_device__; }

    get storage() { return ( '__storage__' in this ) ? this.__storage__ : this.__initStorage(); }

    /* ===================== PUBLIC METHODS ===================== */

    /**
     * Wait for page loading/processing.
     *
     * @param  {string}            sel  CSS selector of element to wait for.
     * @param  {CallableFunction}  cb   Callback function.
     * @return {void}
     * @memberof XelApp
     */
    waitPageLoading( sel, cb )
    {
        document.querySelector( sel ) ? cb() : setTimeout( this.waitPageLoading( sel, cb ), 330 );
    }

    /**
     * Create new Node.
     *
     * @param {?string}                        [node='DIV']       Node type (use "text" to create TextNode; default: "DIV").
     * @param {?(string|Node|string[]|Node[])} [content=null]     Node or Text or Array of elements (Nodes and/or Text) to insert into created Node (default: no content, creates empty node).
     * @param {?object}                        [attributes=null]  Optional list of node attributes (default: no attributes).
     * @param {?string}                        [namespace=null]   Optional Node namespace (usable only for <svg> nodes; default: no namespace).
     * @return {Node}
     * @memberof XelApp
     */
    createNode( node = 'DIV', content = null, attributes = null, namespace = null )
    {
        if( node === null || node.toUpperCase() === 'TEXT' )
            return document.createTextNode( content ? content : '' );
        else
        {
            const el = namespace ? document.createElementNS( namespace, node ) : document.createElement( node );

            // add "xmlns:xlink" to <SVG> node:
            if( namespace && node.toUpperCase() == 'SVG' )
                el.setAttributeNS( 'http://www.w3.org/2000/xmlns/', 'xmlns:xlink', 'http://www.w3.org/1999/xlink' );

            if( attributes )
                for( const [ name, value ] of Object.entries( attributes ) )
                {
                    if( name == 'data' )
                    {
                        for( const [ dname, dvalue ] of Object.entries( value ) )
                            el.dataset[ dname ] = dvalue;
                    }
                    else
                        el.setAttribute( name, value );
                }

            if( content )
            {
                if( Array.isArray( content ) )
                    content.forEach( ( item ) => { el.appendChild( ( typeof item === 'string' ) ? document.createTextNode( item ) : item ) } );
                else
                    el.appendChild( ( typeof content === 'string' ) ? document.createTextNode( content ) : content );
            }

            return el;
        }
    }

    /**
     * Inject CSS into page (create <style> element with CSS).
     *
     * @param  {string}   css                        CSS code to inject.
     * @param  {?string}  [id=null]                  Optional ID for injected CSS ("id" attribute of <style> tag).
     * @param  {?string}  [media=null]               Optional Media type of injecting CSS ("media" attribute of <style> tag; default: "screen").
     * @param  {boolean}  [preserve_comments=false]  Preserve or remove comments from CSS code before inject (default: remove comments).
     * @return {Node}
     * @memberof XelApp
     */
    injectCSS( css, id = null, media = null, preserve_comments = false )
    {
        if( document.querySelector( id ) ) return;

        // replace tabulators and new lines with space, remove comments and double spaces:
        css = ( preserve_comments ? css : css.replace( /\/\*[^*]*\*+([^/*][^*]*\*+)*\//g, '' ) )
            .replace( /[\t\n]/g, ' ' )
            .replace( /[\s]{2,}/g, ' ' );

        let el = this.createNode( 'STYLE', css, { type: 'text/css' } );
        if( id ) el.id = id;
        if( media ) el.media = media;
        document.head.appendChild( el );
        return el;
    }

    /* eslint-disable no-console */

    /**
     * Log to console.
     *
     * @param  {string} message
     * @return {void}
     * @memberof XelApp
     */
    log( message )
    {
        if( this.__no_console__ ) return;
        console.log( `%c[${ this.name }]%c ${ message }`, this.__style__.header, this.__style__.text );
    }

    /**
     * Dump variable to console.
     *
     * @param  {any}     value           Variable to dump.
     * @param  {?string} [comment=null]  Optional comment.
     * @return {void}
     * @memberof XelApp
     */
    dump( value, comment = null )
    {
        if( this.__no_console__ ) return;
        if( comment ) this.log( comment );
        console.log( value );
    }

    /**
     * Log info to console.
     *
     * @param  {string} message
     * @return {void}
     * @memberof XelApp
     */
    logInfo( message )
    {
        if( this.__no_console__ ) return;
        console.info( `%c[${ this.name }]%c ${ message }`, this.__style__.header, `${ this.__style__.text }font-style:italic;` );
    }

    /**
     * Log warning to console.
     *
     * @param  {string} message
     * @return {void}
     * @memberof XelApp
     */
    logWarn( message )
    {
        if( this.__no_console__ ) return;
        console.warn( `%c[${ this.name }]%c ${ message }`, this.__style__.header, this.__style__.text );
    }

    /**
     * Log error to console.
     *
     * @param  {string} message
     * @return {void}
     * @memberof XelApp
     */
    logError( message )
    {
        if( this.__no_console__ ) return;
        console.error( `%c[${ this.name }]%c ${ message }`, this.__style__.header, this.__style__.text );
    }

    /**
     * Write application loading message to console.
     *
     * @return {void}
     * @memberof XelApp
     */
    logInit()
    {
        this.logInfo( `App loaded (version: ${ this.version })` );
    }

    /* eslint-enable no-console */
}

exportToBrowser( { 'XelApp': XelApp } );

export default XelApp;
