/**
 * External scripts loading helper.
 * @module xeljslib/helpers/helpers-script-loader
 */

/**
 * @typedef  {string[]} URLsArray - Array of URLs.
 */

/**
 * @typedef  {Object} URLsList   - List of URLs with IDs for them (pairs ``{"ID": "URL"}``).
 * @property {string} library_id - URL of script for loading.
 */

/**
 * Helper function for loading external JS lib(s).
 *
 * @example
 *   loadJS({
 *     'myApp-libs-jQuery': 'https://some-cdn.org/.../jquery-latest.js',
 *     'myApp-libs-myAwesomeLib': 'https://some-cdn.org/.../my-awesome-lib.min.js',
 *     'myApp-libs-SoMeHaSh': 'https://some-cdn.org/.../another-required-lib.min.js'
 *   });
 *
 * @param {string|URLsArray|URLsList} src
 *          Script source(s), can be String (loads single script), or {@linkcode URLsArray} (loads multiple scripts)
 *          or {@linkcode URLsList} with pairs {'id_01': 'script_url_01', ... } (reccomended; loads multiple scripts
 *          and sets IDs for them, prevents loading of scripts with duplicate IDs).
 * @param  {CallableFunction} callback - Callback function to execute after loading script(s).
 * @return {Void}
 */
function loadJSlib(src, callback)
{
    const counter = {
        n:   0,
        max: 0
    }

    const count = function(cb)
    {
        counter.n++;
        if(counter.n >= counter.max)
            cb();
    }

    const include = function(file_src, cb, id = null)
    {
        const loader = document.createElement('script');
        loader.setAttribute('type', 'text/javascript');
        loader.setAttribute('crossorigin', 'anonymous');
        if(id) loader.setAttribute('id', id);

        loader.setAttribute('src', file_src);
        if(loader.readyState)
            loader.onreadystatechange = () =>
            {
                if(loader.readyState == 'loaded' || loader.readyState == 'complete')
                {
                    loader.onreadystatechange = null;
                    count(cb);
                }
            }
        else
            loader.onload = () => { count(cb); }

        document.body.appendChild(loader);
    }

    if(typeof src === 'string')
        include(src, callback);
    else if(typeof src === 'object')
    {
        if(Array.isArray(src))
        {
            counter.max = src.length;
            src.forEach((s) =>
            {
                include(s, callback);
            });
        }
        else
        {
            counter.max = Object.values(src).filter((s) => { return s.length && s.startsWith('http') }).length;
            for(const id in src)
                if(!document.getElementById(id))
                    include(src[ id ], callback, id);
        }
    }
}

export default loadJSlib;
