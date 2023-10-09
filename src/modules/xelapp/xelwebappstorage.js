/**
 * Class module.
 * @module xeljslib/xelapp/xelwebappstorage
 */

import XelWebAppStorageError from '../../classes/exceptions';
import * as XelTypedef from '../../classes/typedefs';

/**
 * Script storage.
 *
 * @class     XelWebAppStorage
 * @classdesc Implements script storage (using browser' local storage or userscripts storage)
 */
class XelWebAppStorage
{
    /**
     * @constructor
     *
     * @param {?number} [version=1]
     *        Version of data in storage (used to determine if storage needs upgrade).
     * @param {?XelTypedef.XelWebAppStorageConfig} [config={}]
     *        Storage configuration options ({@linkcode XelTypedef.XelWebAppStorageConfig}).
     * @param {?XelTypedef.XelWebAppStorageUpgradeCallback} [upgradeCallback=null]
     *        Storage upgrade/update function ({@linkcode XelTypedef.XelWebAppStorageUpgradeCallback}),
     *        executed if version of data in storage is older than version passed to constructor.
     * @throws {XelWebAppStorageError}
     * @memberof XelWebAppStorage
     */
    constructor(version = 1, config = {}, upgradeCallback = null)
    {
        const defaultConfig = {
            // Default config:
            isUserscript:         false,
            useUserscriptStorage: true
        };

        const conf = config ? Object.assign(defaultConfig, config) : defaultConfig;

        if(conf.isUserscript && conf.useUserscriptStorage)
        {
            if(!this.__isUserscriptStorageAvailable())
                throw new XelWebAppStorageError('Userscript storage is disabled or unavailable.');
        }
        else if(!this.__isLocalStorageAvailable())
            throw new XelWebAppStorageError('Storage is unavailable.');

        this.__version__ = this.__n(version);
        this.__cache__ = new Map();

        // update storage if new version:
        if(this.__version__ > Number.parseFloat(this.__storageAPI__.get('_v', 0)))
        {
            this.__storageAPI__.set('_v', this.__version__);
            if(upgradeCallback) upgradeCallback(this);
        }
    }

    /* ===================== PRIVATE METHODS ===================== */

    /**
     * Convert string representation of the version to the numeric (float) value.
     *
     * Numeric version format:
     *   MNNNPPP.BBBB
     * where
     *   M    - Major version
     *   NNN  - Minor version
     *   PPP  - Patch version
     *   BBBB - Build number
     *
     * @example
     *   storage = new XelWebAppStorage();
     *   storage.__n("0.1.3");      // ->    1003
     *   storage.__n("2.4.17");     // -> 2004017
     *   storage.__n("1.7.12.206"); // -> 1007012.206
     *
     * @private
     * @param  {string} value
     * @return {number}
     * @memberof XelWebAppStorage
     */
    __n(value)
    {
        if(typeof value === 'number') return value;
        if(value === null || Number.isNaN(value)) return 0;

        const x = /(\d+)\.(\d+)(\.\d+)?(\.\d+)?/.exec(value);
        if(!x) return 0;

        return Number.parseFloat(x[ 1 ]) * 1000000 +
            (typeof x[ 2 ] !== 'undefined' ? Number.parseInt(x[ 2 ]) * 1000 : 0) +
            (typeof x[ 3 ] !== 'undefined' ? Number.parseInt(x[ 3 ].slice(1)) : 0) +
            (typeof x[ 4 ] !== 'undefined' ? Number.parseFloat(x[ 4 ]) : 0);
    }

    /**
     * Trigger event.
     *
     * @private
     * @param  {string}            name    Event name.
     * @param  {?*}                [data]  Data to be passed to event listener.
     * @return {XelWebAppStorage}
     * @memberof XelWebAppStorage
     */
    __emit(name, data)
    {
        if(!this.__e__[ name ] || !this.__e__[ name ].length) return;
        this.__e__[ name ].forEach(callback => callback(data));
        return this;
    }

    /* ==================== PROTECTED METHODS ==================== */

    /**
     * Check if Userscript Storage is available.
     *
     * @protected
     * @return {boolean}
     * @memberof XelWebAppStorage
     */
    __isUserscriptStorageAvailable()
    {
        this.__storageAPI__.get = (typeof GM_getValue !== 'undefined') ? GM_getValue : (GM && typeof GM.getValue !== 'undefined') ? GM.getValue : null;
        this.__storageAPI__.set = (typeof GM_setValue !== 'undefined') ? GM_setValue : (GM && typeof GM.setValue !== 'undefined') ? GM.setValue : null;
        this.__storageAPI__.remove = (typeof GM_deleteValue !== 'undefined') ? GM_deleteValue : GM && typeof GM.deleteValue !== 'undefined' ? GM.deleteValue : null;
        this.__storageAPI__.clear = () =>
        {
            const keys = (typeof GM_listValues !== 'undefined') ? GM_listValues() : GM && typeof GM.listValues !== 'undefined' ? GM.listValues() : null;
            if(keys)
                for(const val of keys)
                    this.__storageAPI__.remove(val);
        };

        return (
            this.__storageAPI__.get !== null &&
            this.__storageAPI__.set !== null &&
            this.__storageAPI__.remove !== null
        );
    }

    /**
     * Check if localStorage is supported in the browser and available.
     *
     * @protected
     * @return {boolean}
     * @throws {XelWebAppStorageError}
     * @memberof XelWebAppStorage
     */
    __isLocalStorageAvailable()
    {
        if(typeof localStorage !== 'undefined')
        {
            try
            {
                let test = `test_${ location.hostname.replace('.', '-') }_${ Date.now() }`;
                localStorage.setItem(test, '_OK_');
                if(localStorage.getItem(test) === '_OK_')
                {
                    localStorage.removeItem(test);
                    this.__storageAPI__.get = localStorage.getItem;
                    this.__storageAPI__.set = localStorage.setItem;
                    this.__storageAPI__.remove = localStorage.removeItem;
                    this.__storageAPI__.clear = localStorage.clear;
                    return true;
                }

                return false;
            }
            catch(e)
            {
                throw new XelWebAppStorageError('Storage API is unsupported, or blocked by browser privacy settings.');
            }
        }
        throw new XelWebAppStorageError('Storage API is unsupported.');
    }

    /* ===================== CLASS PROPERTIES ===================== */

    /**
     * Version of the storage data.
     *
     * @type {string}
     * @public
     * @readonly
     * @memberof XelWebAppStorage
     */
    get version(){ return this.__version__; }

    /* ===================== PUBLIC METHODS ===================== */

    /**
     * Check if value is exists in storage.
     *
     * @public
     * @param  {string} name
     * @return {boolean}
     * @memberof XelWebAppStorage
     */
    has(name)
    {
        if(this.__cache__.has(name)) return true;

        try
        {
            const value = this.get(name);
            return typeof value !== 'undefined';
        }
        catch(e)
        {
            return false;
        }
    }

    /**
     * Read value from storage.
     *
     * @public
     * @param  {string} name
     * @return {*}
     * @fires  XelWebAppStorage#read
     * @throws {XelWebAppStorageError}
     * @memberof XelWebAppStorage
     */
    get(name)
    {
        try
        {
            const data = {
                name:  name,
                value: this.__cache__.has(name) ?
                       this.__cache__.get(name) :
                       JSON.parse(this.__storageAPI__.get(name))
            };

            /**
             * Read from storage event.
             *
             * @event XelWebAppStorage#read
             * @type {XelTypedef.XelWebAppStorageEntry}
             */
            this.__emit('read', data);

            if(typeof data.value !== 'undefined')
                this.__cache__.set(name, data.value); // update cache

            return data.value;
        }
        catch(e)
        {
            throw new XelWebAppStorageError(`Error reading data from Storage: {$e.message}`);
        }
    }

    /**
     * Store value into storage.
     *
     * @public
     * @param  {string} name
     * @param  {*}      value
     * @return {Self}
     * @fires  XelWebAppStorage#write
     * @throws {XelWebAppStorageError}
     * @memberof XelWebAppStorage
     */
    set(name, value)
    {
        try
        {
            const data = {
                name:  name,
                value: value
            };

            /**
             * Write to storage event.
             *
             * @event XelWebAppStorage#write
             * @type {XelTypedef.XelWebAppStorageEntry}
             */
            this.__emit('write', data);

            if(typeof data.value !== 'undefined')
            {
                this.__cache__.set(name, data.value); // update cache
                this.__storageAPI__.set(name, JSON.stringify(data.value));
            }
            else
                this.__storageAPI__.remove(name);

            return this;
        }
        catch(e)
        {
            throw new XelWebAppStorageError(`Error writing data to Storage: {$e.message}`);
        }
    }

    /**
     * Remove value from storage (alias of {@linkcode XelWebAppStorage.delete()}).
     *
     * @public
     * @param  {string}  name
     * @return {XelWebAppStorage}
     * @fires  XelWebAppStorage#remove
     * @memberof XelWebAppStorage
     */
    remove(name)
    {
        const data = {
            name:    name,
            process: true
        };

        /**
         * Remove from storage event.
         *
         * @event XelWebAppStorage#remove
         * @type  {Object}
         * @param {string}  name    - Storage data entry name.
         * @param {boolean} process - Set to `false` to prevent removing data entry from storage.
         */
        this.__emit('remove', data);

        if(data.process)
        {
            this.__cache__.delete(name); // update cache
            this.__storageAPI__.remove(name);
        }

        return this;
    }

    /**
     * Clear storage.
     *
     * @public
     * @return {XelWebAppStorage}
     * @fires  XelWebAppStorage#clear
     * @memberof XelWebAppStorage
     */
    clear()
    {
        const data = { process: true };

        /**
         * Clear storage event.
         *
         * @event XelWebAppStorage#clear
         * @type  {Object}
         * @param {boolean} process - Set to `false` to prevent clearing (removing all data) storage.
         */
        this.__emit('clear', data);

        if(data.process)
        {
            this.__cache__.clear(); // update cache
            this.__storageAPI__.clear();
            this.__storageAPI__.set('_v', this.__version__);
        }

        return this;
    }

    /**
     * Add event listener.
     *
     * @public
     * @param  {string}           name      Event name.
     * @param  {XelEventCallback} callback  Callback function ({@linkcode XelTypedef.XelEventCallback}).
     * @return {XelWebAppStorage}
     * @memberof XelWebAppStorage
     */
    addEventListener(name, callback)
    {
        if(!this.__e__[ name ]) this.__e__[ name ] = [];
        this.__e__[ name ].push(callback);
        return this;
    }

    /**
     * Add event listener (alias of {@linkcode XelWebAppStorage.addEventListener()}).
     *
     * @public
     * @param  {string}           name      Event name.
     * @param  {XelEventCallback} callback  Callback function ({@linkcode XelTypedef.XelEventCallback}).
     * @return {XelWebAppStorage}
     * @memberof XelWebAppStorage
     */
    on(name, callback){ this.addEventListener(name, callback); }
}

export default XelWebAppStorage;
