/**
 * @module utility/exporter
 */

/**
 * @typedef  {Object} ExportingList
 * @property {*} exporting_unit_name - Name of the exporting unit.
 */

/**
 * Exports source units (classes/functions/consts/...) to the browser.
 * Source units will be available in global scope as children of
 * {window} and/or {unsafeWindow} (for userscripts).
 *
 * @param {ExportingList} exporting  List ({@link ExportingList}) of exporting units
 *                                   (as pairs: `{string} Name: {any} Unit`).
 *                                   Source units will be exported with given names
 *                                   *(all symbols in names except alphanumeric and
 *                                   underscore will be converted to underscores)*.
 * @return {void}
 */
function exportToBrowser(exporting)
{
    for(const key in exporting)
    {
        const name = key.replace(/[^\w]+/g, '_').replace(/_+/g, '_');

        if(typeof unsafeWindow !== 'undefined'){ unsafeWindow[ name ] = exporting[ key ]; }
        if(typeof window !== 'undefined'){ window[ name ] = exporting[ key ]; }
    }
}

const Export = {
    toBrowser: exportToBrowser
}

export default Export;
