/**
 * @name         XelJSlib: XelApp
 * @description  Script application and storage implementation.
 * @author       Xeloses (https://github.com/Xeloses)
 * @version      0.1.1
 * @copyright    Xeloses 2023
 * @license      GNU GPL v3 (https://www.gnu.org/licenses/gpl-3.0.html)
 * @namespace    Xeloses.JSlib.XelApp
 */

/**
 * @class     XelAppStorage
 * @classdesc Storage API wrapper.
 *
 * @property {String} version
 *
 * @method get({String} name)
 * @method set({String} name, {Mixed} value)
 * @method delete({String} name)
 * @method remove({String} name)
 * @method clear()
 * @method on({String} name, {Callable} callback)
 * @method addEventListener({String} name, {Callable} callback)
 *
 * @event read
 * @event write
 * @event delete
 * @event clear
 */
class XelAppStorage
{
	/**
	 * @constructor
	 *
	 * @param {Number}   version
	 * @param {Object}   config
	 * @param {Callable} upgradeCallback
	 */
	constructor(version = 1, config = {}, upgradeCallback = null)
	{
		const isUserscript = (typeof GM_info !== 'undefined') && ('script' in GM_info),
			  conf = Object.assign(
					 {
						 // Default config:
						 preferLocalStorage: false
					 },
					 config);

		if( (conf.preferLocalStorage || !isUserscript) && this.__isLocalStorageAvailable() )
		{
			this.removeValue = localStorage.removeItem;
			this.clearStorage = localStorage.clear;
		}
		else if(isUserscript && this.__isUserscriptStorageAvailable() )
		{
			this.removeValue = (typeof GM_deleteValue !== 'undefined') ? GM_deleteValue : (GM && typeof GM.deleteValue !== 'undefined' ? GM.deleteValue : null);
			this.clearStorage = ()=> {
				const keys = (typeof GM_listValues !== 'undefined') ? GM_listValues() : (GM && typeof GM.listValues !== 'undefined' ? GM.listValues() : null);
				if(keys)
					for(const val of this._getKeys())
						this.removeValue(val);
			};
		}
		else
			throw new Error('Storage is unavailable.');

		this.__version__ = this.__n(version);
		this.__cache__ = new Map();

		// update storage if new version
		if(this.__version__ > Number.parseFloat(this.getValue('_v', 0)))
		{
			this.setValue('_v', this.__version__);
			if(upgradeCallback) upgradeCallback(this);
		}
	}

	/* ===================== PRIVATE METHODS ===================== */

	/**
	 * Check if Userscript Storage is available
	 *
	 * @return {Boolean}
	 */
	__isUserscriptStorageAvailable()
	{
		this.getValue = (typeof GM_getValue !== 'undefined') ? GM_getValue : ((GM && typeof GM.getValue !== 'undefined') ? GM.getValue : null);
		this.setValue = (typeof GM_setValue !== 'undefined') ? GM_setValue : ((GM && typeof GM.setValue !== 'undefined') ? GM.setValue : null);
		return (this.getValue != null && this.setValue != null);
	}

	/**
	 * Check if localStorage is supported in the browser and available
	 *
	 * @return {Boolean}
	 */
	__isLocalStorageAvailable()
	{
		if(typeof localStorage !== 'undefined')
		{
			try
			{
				let test = `test_${location.hostname.replace('.','-')}_${Date.now()}`;
				localStorage.setItem(test, '_OK_');
				if(localStorage.getItem(test) === '_OK_');
				{
					localStorage.removeItem(test);
					this.getValue = localStorage.getItem;
					this.setValue = localStorage.setItem;
					return true;
				}
			}
			catch(e){
				throw new Error('Storage API is unsupported, or blocked by browser privacy settings.');
			}
		}
		throw new Error('Storage API is unsupported.');
	}

	/**
	 * Convert string representation of the version to the numeric value
	 *
	 * @param  {String}  value
	 * @return {Boolean}
	 */
	__n(value)
	{
		if(typeof value === 'number') return value;
		if(value === null || Number.isNaN(value)) return 0;

		const x = /(\d+)\.(\d+)(\.\d+)?(\.\d+)?/.exec(value);
		if(!x) return 0;

		return Number.parseInt(x[1]) * 1000000 +
			   (typeof x[2] !== 'undefined' ? Number.parseInt(x[2]) * 1000 : 0) +
			   (typeof x[3] !== 'undefined' ? Number.parseInt(x[3].slice(1)) : 0) +
			   (typeof x[4] !== 'undefined' ? Number.parseFloat(x[4]) : 0);
	}

	/**
	 * Trigger event
	 *
	 * @param  {String} name
	 * @param  {Mixed}  data
	 * @return {Self}
	 */
	__t(name, data)
	{
		if(!this.__e__[name] || !this.__e__[name].length) return;
		this.__e__[name].forEach(callback => callback(data));
		return this;
	}

	/* ===================== CLASS PROPERTIES ===================== */

	get version() { return this.__version__; }

	/* ===================== PUBLIC METHODS ===================== */

	/**
	 * Check if value is exists in storage
	 *
	 * @param  {String}  name
	 * @return {Boolean}
	 */
	has(name)
	{
		if(this.__cache__.has(name)) return true;

		try
		{
			const value = this.get(name);
			return (value !== null && typeof value !== 'undefined');
		}
		catch(e)
		{
			return false;
		}
	}

	/**
	 * Read value from storage
	 *
	 * @param  {String} name
	 * @return {Mixed}
	 */
	get(name)
	{
		try
		{
			const a = { name: name, value: (this.__cache__.has(name)) ? this.__cache__.get(name) : JSON.parse(this.getValue(name, null)) };

			this.__t('read', a); // trigger "onread" event

			if(a.value !== null && typeof a.value !== 'undefined')
				this.__cache__.set(name, a.value); // update cache

			return a.value;
		}
		catch(e)
		{
			throw new Error(`Error reading data from Storage: {$e.message}`);
		}
	}

	/**
	 * Store value into storage
	 *
	 * @param  {String} name
	 * @param  {Mixed}  name
	 * @return {Self}
	 */
	set(name, value)
	{
		try
		{
			const a = { name: name, value: value };

			this.__t('write', a); // trigger "onwrite" event

			if(a.value !== null && typeof a.value !== 'undefined')
			{
				this.__cache__.set(name, a.value); // update cache
				this.setValue(name, JSON.stringify(a.value));
			}
			else
			{
				this.delete(name);
			}

			return this;
		}
		catch(e)
		{
			throw new Error(`Error writing data to Storage: {$e.message}`);
		}
	}

	/**
	 * Remove value from storage
	 *
	 * @param  {String} name
	 * @return {Self}
	 */
	delete(name)
	{
		const a = { name: name, process: true };

		this.__t('delete', a); // trigger "ondelete" event

		if(a.process)
		{
			this.__cache__.delete(name); // update cache
			this.removeValue(name);
		}

		return this;
	}

	remove(name)
	{
		return this.delete(name);
	}

	/**
	 * Clear storage
	 *
	 * @param  {String} name
	 * @return {Self}
	 */
	clear()
	{
		const a = { process: true };

		this.__t('clear', a); // trigger "onclear" event

		if(a.process)
		{
			this.__cache__.clear(); // update cache
			this.clearStorage();
		}

		return this;
	}

	/**
	 * Add event listener (events model support)
	 *
	 * @param  {String}   name
	 * @param  {Callable} callback
	 * @return {Self}
	 */
	addEventListener(name, callback)
	{
		if(!this.__e__[name]) this.__e__[name] = [];
		this.__e__[name].push(callback);
		return this;
	}

	on(name, callback){ this.addEventListener(name, callback); }
}

/**
 * @class     XelApp
 * @classdesc Script application.
 *
 * @property {String} name
 * @property {String} appName
 * @property {String} ver
 * @property {String} version
 * @property {String} author
 * @property {String} description
 * @property {String} url
 * @property {String} homepage
 * @property {String} ns
 * @property {String} namespace
 * @property {String} prefix
 * @property {String} unique
 *
 * @property {Boolean} isUserscript
 * @property {Boolean} isMobile
 *
 * @property {XelAppStorage} storage
 *
 * @method waitPageLoading({String} sel, {Callable} cb)
 * @method injectCSS({String} css, {String} id, {Boolean} preserve_comments)
 * @method createNode({String} node, {Mixed} content, {Object} attributes, {String} namespace)
 *
 * @method log({String} message)
 * @method logInfo({String} message)
 * @method logWarn({String} message)
 * @method logError({String} message)
 * @method logInit()
 * @method dump({Mixed} value, {String} comment)
 */
class XelApp
{
	/**
	 * @constructor
	 *
	 * @param {Object}   data                    App information (pass GM_info to use info from userscript' header)
	 * @param {Object}   config
	 * @param {Callable} storageUpgradeCallback
	 */
	constructor(data = {}, config = {}, storageUpgradeCallback = null)
	{
		const conf = Object.assign(
			{
				// Default config:
				logHeaderColor: 'c5c',
				logTextColor: 'ddd',
				noConsole: false,
				preferLocalStorage: false
			},
			config);

		const UserscriptInfo = (typeof GM_info !== 'undefined' && 'script' in GM_info) ? GM_info : ( (data && 'script' in data) ? data : null );

		this.__is_userscript__ = !!UserscriptInfo;

		this.__name__ = data.name || (this.__is_userscript__  ? UserscriptInfo.script.name : 'Script');
		this.__version__ = data.version || (this.__is_userscript__  ? UserscriptInfo.script.version : '0.0.1');
		this.__author__ = data.author || (this.__is_userscript__  ? UserscriptInfo.script.author : null);
		this.__description__ = data.description || (this.__is_userscript__  ? UserscriptInfo.script.description : null);
		this.__url__ = data.url || (this.__is_userscript__  ? UserscriptInfo.script.homepage : null);
		this.__namespace__ = data.namespace || (this.__is_userscript__  ? UserscriptInfo.script.namespace : (this.__author__ ? this.__author__.replace(/[^.\-\w]+/g, '') + '.' : '') + this.__name__.replace(/[^.\-\w]+/g, ''));
		this.__unique_id__ = this.__namespace__.replace(/[.\-\s]+/g, '_').replace(/[^\w]+/g, '').toLowerCase();

		this.__is_mobile_device__ = this.__isMobile();

		this.__style__ = {
			header: `color:#${conf.logHeaderColor};font-weight:bold;`,
			text: `color:#${conf.logTextColor};font-weight:normal;`
		};

		this.__no_console__ = conf.noConsole;

        if(storageUpgradeCallback)
            this.__onStorageUpgrade__ = storageUpgradeCallback;
	}

	/* ===================== PRIVATE METHODS ===================== */

	/**
	 * Initialize app storage
	 *
	 * @param  {Boolean}       preferLocalStorage
	 * @return {XelAppStorage}
	 */
	__initStorage()
	{
		try
		{
			this.__storage__ = new XelAppStorage(this.__version__, { preferLocalStorage: preferLocalStorage }, this.__onStorageUpgrade__);
			return this.__storage_;
		}
		catch(e)
		{
			const err = `Unable to initialize app storage: ${e.message}`;
			this.logError(err);
			throw new Error(err);
		}
	}

	/**
	 * Check if script running on mobile device.
	 *
	 * @return {Boolean}
	 */
	__isMobile()
	{
		if('maxTouchPoints' in navigator)
			return (navigator.maxTouchPoints > 0);
		else if('msMaxTouchPoints' in navigator)
			return (navigator.msMaxTouchPoints > 0);
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

	/* ===================== CLASS PROPERTIES ===================== */

	get name(){ return this.__name__; }
	get appName(){ return this.__name__; }
	get version(){ return this.__version__; }
	get ver(){ return this.__version__; }
	get author(){ return this.__author__; }
	get description(){ return this.__description__; }
	get url(){ return this.__url__; }
	get homepage(){ return this.__url__; }
	get namespace(){ return this.__namespace__; }
	get ns(){ return this.__namespace__; }
	get prefix(){ return this.__unique_id__; }
	get unique(){ return this.__unique_id__; }

	get isUserscript(){ return this.__is_userscript__; }
	get isMobile(){ return this.__is_mobile_device__; }

	get storage(){ return ('__storage__' in this) ? this.__storage__ : this.__initStorage(); }

	/* ===================== PUBLIC METHODS ===================== */

	/**
	 * Wait for page loading/processing.
	 *
	 * @param  {String}    sel  CSS selector of element to wait for
	 * @param  {Callable}  cb   Callback function
	 * @return {Void}
	 */
	waitPageLoading(sel, cb)
	{
		document.querySelector(sel) ? cb() : setTimeout(this.waitPageLoading(sel,cb), 330);
	}

	/**
	 * Inject CSS into page (create <style> element with CSS).
	 *
	 * @param  {String}   css
	 * @param  {String}   id
	 * @param  {String}   media
	 * @param  {Boolean}  preserve_comments
	 * @return {Node}
	 */
	injectCSS(css, id = null, media = 'screen', preserve_comments = false)
	{
		if(document.querySelector(id)) return;

		// replace tabulators and new lines with space, remove comments and double spaces
		css = ( preserve_comments ? css : css.replace(/\/\*[^*]*\*+([^/*][^*]*\*+)*\//g, '') ).replace(/[\t\n]/g, ' ').replace(/[\s]{2,}/g, ' ');

		let el = document.createElement('STYLE');
		if(id) el.id = id;
		if(media) el.media = media;
		el.type = 'text/css';
		el.appendChild( document.createTextNode(css) );
		document.head.appendChild(el);
		return el;
	}

	/**
	 * Create new Node.
	 *
	 * @param  {String}  node
	 * @param  {Mixed}   content      Node or Text or Array of elements (Nodes and/or Text) to insert into created Node.
	 * @param  {Object}  attributes
	 * @param  {String}  namespace
	 * @return {Node}
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
				el.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink");

			if(attributes)
				for(const [name, value] of Object.entries(attributes))
				{
					if(name == 'data')
					{
						for(const [dname, dvalue] of Object.entries(value))
						el.dataset[dname] = dvalue;
					}
					else
						el.setAttribute(name, value);
                }

			if(content)
			{
				if(Array.isArray(content))
					content.forEach((item) => { el.appendChild( (typeof item === 'string') ? document.createTextNode(item) : item ); });
				else
				    el.appendChild( (typeof content === 'string') ? document.createTextNode(content) : content );
			}

			return el;
		}
	}

	/* eslint-disable no-console */
	log(message)
	{
		if(this.__no_console__) return;
		console.log(`%c[${this.name}]%c ${message}`, this.__style__.header, this.__style__.text);
	}

	dump(value, comment)
	{
		if(this.__no_console__) return;
		if(comment) this.log(comment);
		console.log(value);
	}

	logInfo(message)
	{
		if(this.__no_console__) return;
		console.info(`%c[${this.name}]%c ${message}`, this.__style__.header, this.__style__.text + 'font-style:italic;');
	}

	logWarn(message)
	{
		if(this.__no_console__) return;
		console.warn(`%c[${this.name}]%c ${message}`, this.__style__.header, this.__style__.text);
	}

	logError(message)
	{
		if(this.__no_console__) return;
		console.error(`%c[${this.name}]%c ${message}`, this.__style__.header, this.__style__.text);
	}

	logInit()
	{
		this.logInfo(`App loaded (version: ${this.version})`);
	}
	/* eslint-enable no-console */
}
