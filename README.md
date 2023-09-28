# XelJSlib - Xeloses' JS lib
* [XelApp](./src/xelapp/xelapp.min.js) - Script application and storage.
  
  ``https://raw.githubusercontent.com/Xeloses/xeljslib/master/src/xelapp/xeljslib-xelapp.js``

## Usage:
• In HTML:
```html
<script src="https://.../xeljslib-xelapp.js" type="text/javascript"></script>
```
• Or use loader script from [loader.js](./loader.js) or [loader.min.js](./loader.min.js) :
```javascript
loadJS('https://.../xeljslib-xelapp.js', ()=>{ /* code */ });
```
or
```javascript
loadJS(
  {
    'xel-app': 'https://.../xeljslib-xelapp.min.js',
    'lib-jquery': 'https://.../jquery.min.js'
  },
  ()=>{
    /* code */
  }
);
```
