/**
 * @module xeljslib/xelapp
 */

import Export from '../utility/exporter';
import * as XelTypedef from './service/typedefs';

/**
 * Script application.
 *
 * @class XelApp
 */
class XelApp
{
    /**
     * @constructor
     *
     * @param {?XelTypedef.XelAppInformation} [data={}]
     *        Application information ({@link XelTypedef.XelAppInformation}).
     * @param {?XelTypedef.XelAppConfig}      [config={}]
     *        Application configuraion ({@link XelTypedef.XelAppConfig}).
     * @memberof XelApp
     */
    constructor(data = {}, config = {})
    {
        const defaultConfig = {
            // default config:
            logHeaderColor: 'c5c',
            logTextColor:   'ddd',
            noConsole:      false
        };

        const conf = config ? Object.assign(defaultConfig, config) : defaultConfig;

        this.__name__ = data.name || 'Script';
        this.__version__ = data.version || '0.0.1';
        this.__author__ = data.author || null;
        this.__description__ = data.description || null;
        this.__url__ = data.homepage || null;
        this.__license__ = data.license || 'MIT';
        this.__namespace__ = data.namespace || (this.__author__ ? `${ this.__author__.replace(/[^.\-\w]+/g, '') }.` : '') + this.__name__.replace(/[^.\-\w]+/g, '');
        this.__unique_id__ = this.__namespace__.replace(/[.\-\s]+/g, '_').replace(/[^\w]+/g, '').toLowerCase();

        this.__config__ =
        {
            colors:
            {
                header: `color:#${ conf.logHeaderColor };font-weight:bold;`,
                text:   `color:#${ conf.logTextColor };font-weight:normal;`
            },
            no_console: conf.noConsole
        };
    }

    /* ===================== CLASS PROPERTIES ===================== */

    /**
     * Application name.
     *
     * @type {string}
     * @public
     * @readonly
     * @memberof XelApp
     */
    get name(){ return this.__name__; }

    /**
     * Application name (alias of {@link XelApp.name}).
     *
     * @type {string}
     * @public
     * @readonly
     * @memberof XelApp
     */
    get appName(){ return this.__name__; }

    /**
     * Application version.
     *
     * @type {string}
     * @public
     * @readonly
     * @memberof XelApp
     */
    get version(){ return this.__version__; }

    /**
     * Application version (alias of {@link XelApp.version}).
     *
     * @type {string}
     * @public
     * @readonly
     * @memberof XelApp
     */
    get ver(){ return this.__version__; }

    /**
     * Author name.
     *
     * @type {string}
     * @public
     * @readonly
     * @memberof XelApp
     */
    get author(){ return this.__author__; }

    /**
     * Application description.
     *
     * @type {string}
     * @public
     * @readonly
     * @memberof XelApp
     */
    get description(){ return this.__description__; }

    /**
     * Application homepage.
     *
     * @type {string}
     * @public
     * @readonly
     * @memberof XelApp
     */
    get homepage(){ return this.__url__; }

    /**
     * Application homepage (alias of {@link XelApp.homepage}).
     *
     * @type {string}
     * @public
     * @readonly
     * @memberof XelApp
     */
    get url(){ return this.__url__; }

    /**
     * Namespace.
     *
     * @type {string}
     * @public
     * @readonly
     * @memberof XelApp
     */
    get namespace(){ return this.__namespace__; }

    /**
     * Namespace (alias of {@link XelApp.namespace}).
     *
     * @type {string}
     * @public
     * @readonly
     * @memberof XelApp
     */
    get ns(){ return this.__namespace__; }

    /**
     * Unique prefix (can be used as prefix to generate unique IDs).
     *
     * @type {string}
     * @public
     * @readonly
     * @memberof XelApp
     */
    get prefix(){ return this.__unique_id__; }

    /**
     * Unique prefix (alias of {@link XelApp.prefix}).
     *
     * @type {string}
     * @public
     * @readonly
     * @memberof XelApp
     */
    get unique(){ return this.__unique_id__; }

    /* ===================== PUBLIC METHODS ===================== */

    /* eslint-disable no-console */

    /**
     * Log to console.
     *
     * @public
     * @param  {string} message - Log message.
     * @return {void}
     * @memberof XelApp
     */
    log(message)
    {
        if(this.__config__.no_console) return;
        console.log(`%c[${ this.name }]%c ${ message }`, this.__config__.colors.header, this.__config__.colors.text);
    }

    /**
     * Dump variable to console.
     *
     * @public
     * @param  {any}    value          - Variable to dump.
     * @param  {string} [comment=null] - Optional comment.
     * @return {void}
     * @memberof XelApp
     */
    dump(value, comment = null)
    {
        if(this.__config__.no_console) return;
        if(comment) this.log(comment);
        console.log(value);
    }

    /**
     * Log info to console.
     *
     * @public
     * @param  {string} message - Information message.
     * @return {void}
     * @memberof XelApp
     */
    logInfo(message)
    {
        if(this.__config__.no_console) return;
        console.info(`%c[${ this.name }]%c ${ message }`, this.__config__.colors.header, `${ this.__config__.colors.text }font-style:italic;`);
    }

    /**
     * Log warning to console.
     *
     * @public
     * @param  {string} message - Warning message.
     * @return {void}
     * @memberof XelApp
     */
    logWarn(message)
    {
        if(this.__config__.no_console) return;
        console.warn(`%c[${ this.name }]%c ${ message }`, this.__config__.colors.header, this.__config__.colors.text);
    }

    /**
     * Log error to console.
     *
     * @public
     * @param  {string} message - Error message.
     * @return {void}
     * @memberof XelApp
     */
    logError(message)
    {
        if(this.__config__.no_console) return;
        console.error(`%c[${ this.name }]%c ${ message }`, this.__config__.colors.header, this.__config__.colors.text);
    }

    /**
     * Write application loading message to console.
     *
     * @public
     * @return {void}
     * @memberof XelApp
     */
    logInit()
    {
        this.logInfo(`App loaded (version: ${ this.version })`);
    }

    /* eslint-enable no-console */
}

Export.toBrowser({ XelApp: XelApp });
export default XelApp;
