/**
 * An object containing storage configuration options.
 *
 * @typedef  {Object}  XelStorageConfig
 * @property {boolean} [preferLocalStorage=false] - prefer to use browser' local storage (usable for userscripts).
 */

/**
 * Upgrade/update storage function.
 *
 * @callback StorageUpgradeCallback
 * @param  {XelAppStorage} Application storage instance
 * @return {void}
 */

/**
 * Upgrade/update storage function.
 *
 * @callback XelEventCallback
 * @param  {*}
 * @return {void}
 */

/**
 * Script storage.
 *
 * @class     XelAppStorage
 * @classdesc Implements script storage (using browser' local storage or userscripts storage)
 */
class XelAppStorage
{
    /**
     * @constructor
     *
     * @param {?number}                 [version=1]             Version of data in storage (used to determine if storage needs upgrade).
     * @param {XelStorageConfig}        [config={}]             Storage configuration options (typedef: {@linkcode XelStorageConfig}).
     * @param {?StorageUpgradeCallback} [upgradeCallback=null]  Storage upgrade/update function (typedef: {@linkcode StorageUpgradeCallback}), executed if version of data in storage is older than version passed to constructor.
     * @memberof XelAppStorage
     */
    constructor( version = 1, config = {}, upgradeCallback = null )
    {
        const isUserscript = ( typeof GM_info !== 'undefined' ) && ( 'script' in GM_info ),
            conf = Object.assign(
                {
                    // Default config:
                    preferLocalStorage: false
                },
                config );

        if( ( conf.preferLocalStorage || !isUserscript ) && this.__isLocalStorageAvailable() )
        {
            this.removeValue = localStorage.removeItem;
            this.clearStorage = localStorage.clear;
        }
        else if( isUserscript && this.__isUserscriptStorageAvailable() )
        {
            this.removeValue = ( typeof GM_deleteValue !== 'undefined' ) ? GM_deleteValue : ( GM && typeof GM.deleteValue !== 'undefined' ? GM.deleteValue : null );
            this.clearStorage = () =>
            {
                const keys = ( typeof GM_listValues !== 'undefined' ) ? GM_listValues() : ( GM && typeof GM.listValues !== 'undefined' ? GM.listValues() : null );
                if( keys )
                    for( const val of this._getKeys() )
                        this.removeValue( val );
            };
        }
        else
            throw new Error( 'Storage is unavailable.' );

        this.__version__ = this.__n( version );
        this.__cache__ = new Map();

        // update storage if new version:
        if( this.__version__ > Number.parseFloat( this.getValue( '_v', 0 ) ) )
        {
            this.setValue( '_v', this.__version__ );
            if( upgradeCallback ) upgradeCallback( this );
        }
    }

    /* ===================== PRIVATE METHODS ===================== */

    /**
     * Check if Userscript Storage is available.
     *
     * @return {boolean}
     * @memberof XelAppStorage
     */
    __isUserscriptStorageAvailable()
    {
        this.getValue = ( typeof GM_getValue !== 'undefined' ) ? GM_getValue : ( ( GM && typeof GM.getValue !== 'undefined' ) ? GM.getValue : null );
        this.setValue = ( typeof GM_setValue !== 'undefined' ) ? GM_setValue : ( ( GM && typeof GM.setValue !== 'undefined' ) ? GM.setValue : null );
        return ( this.getValue !== null && this.setValue !== null );
    }

    /**
     * Check if localStorage is supported in the browser and available.
     *
     * @return {boolean}
     * @memberof XelAppStorage
     */
    __isLocalStorageAvailable()
    {
        if( typeof localStorage !== 'undefined' )
        {
            try
            {
                let test = `test_${ location.hostname.replace( '.', '-' ) }_${ Date.now() }`;
                localStorage.setItem( test, '_OK_' );
                if( localStorage.getItem( test ) === '_OK_' )
                {
                    localStorage.removeItem( test );
                    this.getValue = localStorage.getItem;
                    this.setValue = localStorage.setItem;
                    return true;
                }
            }
            catch( e )
            {
                throw new Error( 'Storage API is unsupported, or blocked by browser privacy settings.' );
            }
        }
        throw new Error( 'Storage API is unsupported.' );
    }

    /**
     * Convert string representation of the version to the numeric (float) value.
     *
     * Numeric version format:
     *   MNNNAAA.BBBB
     * where
     *   M    - Major version
     *   NNN  - Minor version
     *   AAA  - Patch version
     *   BBBB - Build number
     *
     * Examples:
     *   "0.1.3"      ->    1003
     *   "2.4.17"     -> 2004017
     *   "1.7.12.206" -> 1007012.206
     *
     * @param  {string} value
     * @return {number}
     * @memberof XelAppStorage
     */
    __n( value )
    {
        if( typeof value === 'number' ) return value;
        if( value === null || Number.isNaN( value ) ) return 0;

        const x = /(\d+)\.(\d+)(\.\d+)?(\.\d+)?/.exec( value );
        if( !x ) return 0;

        return Number.parseFloat( x[ 1 ] ) * 1000000 +
            ( typeof x[ 2 ] !== 'undefined' ? Number.parseInt( x[ 2 ] ) * 1000 : 0 ) +
            ( typeof x[ 3 ] !== 'undefined' ? Number.parseInt( x[ 3 ].slice( 1 ) ) : 0 ) +
            ( typeof x[ 4 ] !== 'undefined' ? Number.parseFloat( x[ 4 ] ) : 0 );
    }

    /**
     * Trigger event.
     *
     * @param  {string}        name  Event name.
     * @param  {*}             data  Param to be passed to event listener.
     * @return {XelAppStorage}
     * @memberof XelAppStorage
     */
    __t( name, data )
    {
        if( !this.__e__[ name ] || !this.__e__[ name ].length ) return;
        this.__e__[ name ].forEach( callback => callback( data ) );
        return this;
    }

    /* ===================== CLASS PROPERTIES ===================== */

    get version() { return this.__version__; }

    /* ===================== PUBLIC METHODS ===================== */

    /**
     * Check if value is exists in storage.
     *
     * @param  {string} name
     * @return {boolean}
     * @memberof XelAppStorage
     */
    has( name )
    {
        if( this.__cache__.has( name ) ) return true;

        try
        {
            const value = this.get( name );
            return ( value !== null && typeof value !== 'undefined' );
        }
        catch( e )
        {
            return false;
        }
    }

    /**
     * Read value from storage.
     *
     * @param  {string} name
     * @return {*}
     * @memberof XelAppStorage
     */
    get( name )
    {
        try
        {
            const a = { name: name, value: ( this.__cache__.has( name ) ) ? this.__cache__.get( name ) : JSON.parse( this.getValue( name, null ) ) };

            this.__t( 'read', a ); // trigger "onread" event

            if( a.value !== null && typeof a.value !== 'undefined' )
                this.__cache__.set( name, a.value ); // update cache

            return a.value;
        }
        catch( e )
        {
            throw new Error( `Error reading data from Storage: {$e.message}` );
        }
    }

    /**
     * Store value into storage.
     *
     * @param  {string} name
     * @param  {*}      value
     * @return {Self}
     * @memberof XelAppStorage
     */
    set( name, value )
    {
        try
        {
            const a = { name: name, value: value };

            this.__t( 'write', a ); // trigger "onwrite" event

            if( a.value !== null && typeof a.value !== 'undefined' )
            {
                this.__cache__.set( name, a.value ); // update cache
                this.setValue( name, JSON.stringify( a.value ) );
            }
            else
            {
                this.delete( name );
            }

            return this;
        }
        catch( e )
        {
            throw new Error( `Error writing data to Storage: {$e.message}` );
        }
    }

    /**
     * Remove value from storage.
     *
     * @param  {string}        name
     * @return {XelAppStorage}
     * @memberof XelAppStorage
     */
    delete( name )
    {
        const a = { name: name, process: true };

        this.__t( 'delete', a ); // trigger "ondelete" event

        if( a.process )
        {
            this.__cache__.delete( name ); // update cache
            this.removeValue( name );
        }

        return this;
    }

    /**
     * Remove value from storage (alias of {@linkcode XelAppStorage.delete()}).
     *
     * @param  {string}        name
     * @return {XelAppStorage}
     * @memberof XelAppStorage
     */
    remove( name )
    {
        return this.delete( name );
    }

    /**
     * Clear storage.
     *
     * @return {XelAppStorage}
     * @memberof XelAppStorage
     */
    clear()
    {
        const a = { process: true };

        this.__t( 'clear', a ); // trigger "onclear" event

        if( a.process )
        {
            this.__cache__.clear(); // update cache
            this.clearStorage();
        }

        return this;
    }

    /**
     * Add event listener.
     *
     * @param  {string}           name      Event name.
     * @param  {XelEventCallback} callback  Callback function (typedef: {@linkcode XelEventCallback}).
     * @return {XelAppStorage}
     * @memberof XelAppStorage
     */
    addEventListener( name, callback )
    {
        if( !this.__e__[ name ] ) this.__e__[ name ] = [];
        this.__e__[ name ].push( callback );
        return this;
    }

    /**
     * Add event listener (alias of {@linkcode XelAppStorage.addEventListener()}).
     *
     * @param  {string}           name      Event name.
     * @param  {XelEventCallback} callback  Callback function (typedef: {@linkcode XelEventCallback}).
     * @return {XelAppStorage}
     * @memberof XelAppStorage
     */
    on( name, callback ) { this.addEventListener( name, callback ); }
}

export default XelAppStorage;
