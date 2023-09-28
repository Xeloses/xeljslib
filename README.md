# XelJSlib - Xeloses' JS lib
* XelApp: [xelapp.min.js](./src/xelapp/xelapp.min.js)
## Usage:
• Use loader script from [loader.js](./loader.js) or [loader.min.js](./loader.min.js).

• Load required scripts:
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
