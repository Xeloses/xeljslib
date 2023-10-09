/* eslint-disable no-console */

const fs = require('fs');
const path = require('path');
const webpack = require('webpack');

/**
 * JS Libraries (modules).
 *
 * @const modules
 * @type  {Object}
 */
const modules = {
    main:      './src/xeljslib.js',
    xelapp:    './src/modules/xelapp/xelapp.js',
    xelwebapp: './src/modules/xelapp/xelwebapp.js'
}

module.exports = (env, argv) =>
{
    const
        isDev = argv.mode ?
                !argv.mode.startsWith('production') :
                !('NODE_ENV' in process.env && process.env.NODE_ENV.startsWith('production')),
        projectData = JSON.parse(fs.readFileSync('./package.json', 'utf8')),
        projecPrefix = projectData.name.toLowerCase(),
        inputFiles = { main: modules[ 'main' ] },
        outputPath = path.resolve(__dirname, path.dirname(projectData.main)),
        outputFile = `${ projecPrefix }${ !isDev ? '.min' : '' }.js`,
        cacheDir = path.resolve(__dirname, '.cache'),
        Cache = {
            stats: path.relative( outputPath, path.join(cacheDir, 'stats', 'bundle-stats.json'))
        };

    for(const moduleName in modules)
        if(moduleName !== 'main')
            inputFiles[ moduleName ] = {
                'import': modules[ moduleName ],
                filename: `modules/${ projecPrefix }-[name]${ !isDev ? '.min' : '' }.js`
            }


    // import packages from global installation:
    const requireGlobal = (moduleName) => { return require(path.join(process.env.npm_config_global_prefix || path.dirname(process.execPath), 'node_modules', moduleName)); }

    // plugins used in project
    const plugins = {
        stats:    requireGlobal('bundle-stats-webpack-plugin').BundleStatsWebpackPlugin,
        minifier: requireGlobal('terser-webpack-plugin'),
        banner:   webpack.BannerPlugin,
        ignore:   webpack.IgnorePlugin,
        progress: webpack.ProgressPlugin
    }

    // print report
    console.info(`Build "${ projectData.title || projectData.name }" v${ projectData.version }`);
    console.info(`  @author:   ${ projectData.author }.`);
    console.info(`  @license:  ${ projectData.license }.`);
    console.info(`  @homepage: ${ projectData.homepage }.`);
    console.info(`  - mode:        <${ isDev ? 'DEVELOPMENT' : 'PRODUCTION' }>`);
    console.info(`  - working dir: '${ path.resolve(__dirname) }'`);
    console.info(`  - output dir:  './${ path.relative(__dirname, outputPath) }'`);
    console.info(`  - output file: '${ outputFile }'`);
    console.info('  - webpack env: ', env);
    console.info(' ');

    // create config
    const config = {
        mode:    isDev ? 'development' : 'production',
        context: path.resolve(__dirname),
        entry:   inputFiles,
        output:
        {
            path:     outputPath,
            filename: outputFile,
            clean:    { keep: /bundle-stats\.(html|json)/ }
        },
        devtool: isDev ? false : 'source-map',
        optimization:
        {
            // Terser (minify):
            minimize: !isDev,
            minimizer:
            [
                new plugins.minifier({
                    terserOptions:
                    {
                        compress: !isDev,
                        format:   { comments: /(@license|@copyright|@author|==UserScript==)/i }
                    },
                    extractComments: false
                })
            ]
        },
        plugins:
        [
            // ignore type definitions module:
            new plugins.ignore({
                resourceRegExp: /^typedefs?(.[cm]?jsx?)?$/
            }),
            // analyze bundle and create report:
            new plugins.stats({
                baselineFilepath: Cache.stats,
                baseline:         !fs.existsSync(Cache.stats)
            }),
            // show compilation progress:
            new plugins.progress({
                activeModules: true,
                entries:       true,
                modules:       true,
                profile:       false,
                dependencies:  true,
                percentBy:     'entries',
                handler(percentage, message)
                {
                    const p = Math.ceil(percentage * 100);
                    console.info(`# Compiling "${ projectData.name }" [${ p }%]${ message ? `: ${ message }` : '' }`);
                }
            })
        ],
        stats:
        {
            nestedModules: true,
            orphanModules: true
        }
    }

    // add banner to production build file(s):
    if(!isDev)
    {
        // generate banner:
        const banner = `
/**
 * @name         ${ projectData.title || projectData.name }
 * @description  ${ projectData.description }
 * @version      ${ projectData.version }
 * @author       ${ projectData.author }
 * @homepage     ${ projectData.homepage }
 * @license      ${ projectData.license }
 */
        `;
        // add banner to output files:
        config.plugins.push(
            new plugins.banner({
                banner:    banner.replace(/^[\s\r\n]+$/g, ''),
                entryOnly: true,
                raw:       true,
                test:      /\.js$/
            })
        );
    }

    return config;
}
