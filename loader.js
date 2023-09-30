/**
 * Load external JS lib(s).
 *
 * @param  {string|Array|Object}  src        Script source(s), can be String (loads single script), or Array of Strings (loads multiple scripts) or Plain Object with pairs {'id_01': 'script_url_01', ... } (loads multiple scripts and sets IDs for them, prevents loading of scripts with duplicate IDs)
 * @param  {CallableFunction}     callback   Callback function to execute after loading script(s).
 * @return {Void}
 */

function loadJS(src, callback){
    const counter = {
              n: 0,
              max: 0
          },
          count = function(cb)
          {
              counter.n++;
              if(counter.n >= counter.max)
                  cb();
          },
          include = function(file_src, cb, id = null)
          {
              const loader = document.createElement('script');
              loader.setAttribute('type', 'text/javascript');
              loader.setAttribute('crossorigin', 'anonymous');
              if(id) loader.setAttribute('id', id);

              loader.setAttribute('src', file_src);
              if(loader.readyState)
                  loader.onreadystatechange = () => {
                      if (loader.readyState == "loaded" || loader.readyState == "complete")
                      {
                          loader.onreadystatechange = null;
                          count(cb);
                      }
                  };
              else
                  loader.onload = () => {
                      count(cb);
                  };

              document.body.appendChild(loader);
          };

    if(typeof src === 'string')
        include(src, callback);
    else if(typeof src === 'object')
    {
        if(Array.isArray(src))
        {
            counter.max = src.length;
            src.forEach((s) => {
                include(s, callback);
            });
        }
        else
        {
            counter.max = Object.values(src).filter((s) => { return s.length && s.startsWith('http'); }).length;
            for(const id in src)
                if(!document.getElementById(id))
                    include(src[id], callback, id);
        }
    }
}
