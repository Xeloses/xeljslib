/**
 * @module xeljslib/xelwebapp
 */

import XelApp from './xelapp';
import XelWebAppStorage from './xelwebappstorage';
import XelWebAppError from './service/exceptions';
import Export from '../utility/exporter';
import * as XelTypedef from './service/typedefs';

/**
 * Web-application.
 *
 * @class   XelWebApp
 * @extends {XelApp}
 */
class XelWebApp extends XelApp
{
    /**
     * @constructor
     *
     * @param {?XelTypedef.XelAppInformation} [data={}]
     *        Web-application information ({@link XelTypedef.XelAppInformation});
     *        pass `GM_info.script` to use info from userscript' header.
     * @param {?XelTypedef.XelWebAppConfig} [config={}]
     *        Web-application configuraion ({@link XelTypedef.XelWebAppConfig}).
     * @param {?XelTypedef.XelWebAppStorageUpgradeCallback} [storageUpgradeCallback=null]
     *        Storage upgrade/update function ({@link XelTypedef.XelWebAppStorageUpgradeCallback}),
     *        executed if version of data in storage is older than version passed to constructor.
     * @memberof XelWebApp
     */
    constructor(data = {}, config = {}, storageUpgradeCallback = null)
    {
        const defaultConfig = {
            // default config:
            logHeaderColor:       'c5c',
            logTextColor:         'ddd',
            noConsole:            false,
            useUserscriptStorage: true
        };

        const conf = config ? Object.assign(defaultConfig, config) : defaultConfig;

        super(data, conf);

        this.__is_userscript__ = data && 'run-at' in data && ('matches' in data || 'includes' in data);
        this.__is_mobile_device__ = this.__isMobile();
        this.__config__.use_userscript_storage = conf.useUserscriptStorage;

        if(storageUpgradeCallback && storageUpgradeCallback instanceof Function)
            this.__onStorageUpgrade__ = storageUpgradeCallback;
    }

    /* ===================== PRIVATE METHODS ===================== */

    /**
     * Check if script running on mobile device.
     *
     * @private
     * @return {boolean} - `true` if running in mobile browser, `false` otherwise.
     * @memberof XelWebApp
     */
    __isMobile()
    {
        if('maxTouchPoints' in navigator)
            return navigator.maxTouchPoints > 0;
        else if('msMaxTouchPoints' in navigator)
            return navigator.msMaxTouchPoints > 0;
        else
        {
            let mQ = window.matchMedia && matchMedia('(pointer:coarse)');
            if(mQ && mQ.media === '(pointer:coarse)')
                return !!mQ.matches;
            else if('orientation' in window) // deprecated, uses as fallback
                return true;
            else if('userAgent' in navigator && navigator.userAgent) // fallback to user agent sniffing
                return /\b(Android|Windows Phone|iPhone|iPad|iPod|webOS|BlackBerry|Opera Mini|IEMobile)\b/i.test(navigator.userAgent);
        }
    }

    /* ==================== PROTECTED METHODS ==================== */

    /**
     * Initialize app storage.
     *
     * @protected
     * @return {XelWebAppStorage} - {@link XelWebAppStorage} instance.
     * @throws {XelWebAppError} if {@link XelWebAppStorage} throws an exception on init.
     * @memberof XelWebApp
     */
    __initStorage()
    {
        try
        {
            const conf = {
                isUserscript:         this.__is_userscript__,
                useUserscriptStorage: this.__config__.use_userscript_storage
            };

            this.__storage__ = new XelWebAppStorage(this.__version__, conf, this.__onStorageUpgrade__);
            return this.__storage_;
        }
        catch(e)
        {
            const err = `Unable to initialize app storage: ${ e.message }`;
            this.logError(err);
            throw new XelWebAppError(err);
        }
    }

    /* ===================== CLASS PROPERTIES ===================== */

    /**
     * Indicates if Web-application is running as userscript.
     *
     * @type {string}
     * @public
     * @readonly
     * @memberof XelWebApp
     */
    get isUserscript(){ return this.__is_userscript__; }

    /**
     * Indicates if Web-application is running on mobile device.
     *
     * @type {string}
     * @public
     * @readonly
     * @memberof XelWebApp
     */
    get isMobile(){ return this.__is_mobile_device__; }

    /**
     * Storage (instance of {@link XelWebAppStorage}).
     *
     * @type {XelWebAppStorage}
     * @public
     * @readonly
     * @memberof XelWebApp
     */
    get storage(){ return ('__storage__' in this) ? this.__storage__ : this.__initStorage(); }

    /* ===================== PUBLIC METHODS ===================== */

    /**
     * Wait for DOM (or part of DOM) loading/processing.
     *
     * @public
     * @param  {string}            sel - CSS selector of element to wait for.
     * @param  {CallableFunction}  cb  - Xallback function.
     * @return {void}
     * @memberof XelWebApp
     */
    waitDOMLoading(sel, cb)
    {
        document.querySelector(sel) ? cb() : setTimeout(this.waitPageLoading(sel, cb), 330);
    }

    /**
     * Create new DOM Node.
     *
     * @public
     * @param {?string} [node="DIV"]
     *        Node type (use "`text`" to create TextNode; default: "`DIV`").
     * @param {?(string|string[]|Node|Node[])} [content=null]
     *        Optional content to insert into created Node.
     *        Can be a Node or a Text or an Array of elements
     *        (default: no content, creates empty node).
     * @param {?object} [attributes=null]
     *        Optional list of node attributes (default: no attributes).
     * @param {?string} [namespace=null]
     *        Optional Node namespace (usable only for `<svg>` nodes; default: no namespace).
     * @return {Node}
     * @memberof XelWebApp
     */
    createNode(node = 'DIV', content = null, attributes = null, namespace = null)
    {
        if(node === null || node.toUpperCase() === 'TEXT')
            return document.createTextNode(content ? content : '');
        else
        {
            const el = namespace ? document.createElementNS(namespace, node) : document.createElement(node);

            // add "xmlns:xlink" to <SVG> node:
            if(namespace && node.toUpperCase() == 'SVG')
                el.setAttributeNS('http://www.w3.org/2000/xmlns/', 'xmlns:xlink', 'http://www.w3.org/1999/xlink');

            if(attributes)
                for(const [ name, value ] of Object.entries(attributes))
                {
                    if(name == 'data')
                    {
                        for(const [ dname, dvalue ] of Object.entries(value))
                            el.dataset[ dname ] = dvalue;
                    }
                    else
                        el.setAttribute(name, value);
                }

            if(content)
            {
                if(Array.isArray(content))
                    content.forEach((item) => { el.appendChild((typeof item === 'string') ? document.createTextNode(item) : item) });
                else
                    el.appendChild((typeof content === 'string') ? document.createTextNode(content) : content);
            }

            return el;
        }
    }

    /**
     * Inject CSS into page (creates `<style>` node with CSS code).
     *
     * @public
     * @param  {string}  css                        - CSS code to inject.
     * @param  {?string} [id=null]                  - Optional ID (`id` attribute of `<style>` tag).
     * @param  {?string} [media=null]               - Optional Media type of injecting CSS
     *                                                (`media` attribute of `<style>` tag; default: `screen`).
     * @param  {?boolean} [preserve_comments=false] - Preserve or remove comments from CSS code before inject
     *                                                (default: remove comments).
     * @return {Node} - created `<style>` Node.
     * @memberof XelWebApp
     */
    injectCSS(css, id = null, media = null, preserve_comments = false)
    {
        if(document.querySelector(id)) return;

        // replace tabulators and new lines with space, remove comments and double spaces:
        css = (preserve_comments ? css : css.replace(/\/\*[^*]*\*+([^/*][^*]*\*+)*\//g, ''))
            .replace(/[\t\n]/g, ' ')
            .replace(/[\s]{2,}/g, ' ');

        let el = this.createNode('STYLE', css, { type: 'text/css' });
        if(id) el.id = id;
        if(media) el.media = media;
        document.head.appendChild(el);
        return el;
    }
}

Export.toBrowser({ XelWebApp: XelWebApp });
export default XelWebApp;
