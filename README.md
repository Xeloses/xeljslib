# XelJSlib - Xeloses' JS lib
* [XelApp](./src/xelapp/xelapp.min.js) - Script application and storage.
  
  ``https://cdn.jsdelivr.net/gh/xeloses/xeljslib/src/xelapp/xeljslib-xelapp.js``

## Usage:
• In HTML:
```html
<script src="https://cdn.jsdelivr.net/gh/xeloses/xeljslib/src/xelapp/xeljslib-xelapp.js" type="text/javascript" crossorigin="anonymous"></script>
```
• Or use loader script from [loader.js](./loader.js) or [loader.min.js](./loader.min.js) :
```javascript
loadJS('https://cdn.jsdelivr.net/gh/xeloses/xeljslib/src/xelapp/xeljslib-xelapp.js', ()=>{ /* code */ });
```
or
```javascript
loadJS(
  {
    'xel-app': 'https://cdn.jsdelivr.net/gh/xeloses/xeljslib/src/xelapp/xeljslib-xelapp.min.js',
    'lib-jquery': 'https://code.jquery.com/jquery-3.7.1.min.js'
  },
  ()=>{
    /* code */
  }
);
```
