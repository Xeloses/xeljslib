const fs = require( 'fs' );
const path = require( 'path' );
const webpack = require( 'webpack' );

/**
 * JS Libraries (modules).
 *
 * @const modules
 * @type  {Object}
 */
const modules = {
    default: './src/xeljslib.js',
    xelapp: './src/modules/xelapp/xelapp.js'
}

module.exports = ( env, argv ) =>
{
    const
        isDev = argv.mode ? ( argv.mode !== 'production' ) : ( process.env.NODE_ENV !== 'production' ),
        projectData = JSON.parse( fs.readFileSync( './package.json', 'utf8' ) ),
        moduleName = ( env.job && env.job in modules ) ? env.job : 'default',
        outputDirName = path.dirname( projectData.main ),
        outputPath = path.resolve( __dirname, ( moduleName === 'default' ? outputDirName : path.join( outputDirName, 'modules' ) ) ),
        outputName = `${ projectData.name.toLowerCase() }${ moduleName !== 'default' ? `-${ moduleName }` : '' }`,
        outputFile = `${ outputName }${ !isDev ? '.min' : '' }.js`;

    // import packages from global installation:
    const requireGlobal = ( moduleName ) => { return require( path.join( ( process.env.npm_config_global_prefix || path.dirname( process.execPath ) ), 'node_modules', moduleName ) ); }

    // plugins used in project
    const plugins = {
        stats: requireGlobal( 'bundle-stats-webpack-plugin' ).BundleStatsWebpackPlugin,
        minifier: requireGlobal( 'terser-webpack-plugin' ),
        banner: webpack.BannerPlugin,
        progress: webpack.ProgressPlugin
    }

    // create outpit directory
    try { fs.accessSync( outputPath, fs.constants.F_OK ); } catch( e ) { fs.mkdirSync( outputPath ); }

    // print report
    console.info( `Build "${ projectData.name }" v${ projectData.version }.` );
    console.info( `  - mode:        <${ isDev ? 'DEVELOPMENT' : 'PRODUCTION' }>` );
    console.info( `  - job/module:  ${ moduleName }` );
    console.info( `  - input file:  '${ modules[ moduleName ] }'` );
    console.info( `  - output dir:  './${ outputDirName }'` );
    console.info( `  - output file: '${ outputFile }'` );
    console.info( '  - webpack env: ', env );
    console.info( ' ' );

    // create config
    const config = {
        mode: isDev ? 'development' : 'production',
        entry: modules[ moduleName ],
        output: {
            path: outputPath,
            filename: outputFile
        },
        devtool: isDev ? false : 'source-map',
        devServer: {
            static: outputPath,
        },
        optimization: {
            // Terser (minify):
            minimize: !isDev,
            minimizer:
                [
                    new plugins.minifier( {
                        terserOptions: {
                            compress: !isDev,
                            format: { comments: /(@license|@copyright|@author|==UserScript==)/i }
                        },
                        extractComments: false
                    } )
                ]
        },
        plugins: [
            // analyze bundle and create report:
            new plugins.stats( {
                baseline: !fs.existsSync( path.resolve( __dirname, path.join( 'node_modules', '.cache', 'bundle-stats', 'baseline.json' ) ) )
            } ),
            // show compilation progress:
            new plugins.progress( {
                activeModules: true,
                entries: true,
                modules: true,
                profile: false,
                dependencies: true,
                percentBy: 'entries',
                handler( percentage, message, ...args )
                {
                    const p = Math.ceil( percentage * 100 );
                    console.info( `# Compiling "${ projectData.name }" [${ p }%]${ message ? `: ${ message }` : '' }` );
                }
            } ),
        ],
        stats: {
            nestedModules: true,
            orphanModules: true
        }
    }

    // add banner to production build file(s):
    if( !isDev )
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
            new plugins.banner( {
                banner: banner.replace( /^[\s\r\n]+$/g, '' ),
                entryOnly: true,
                raw: true,
                test: /\.js$/,
            } )
        );
    }

    return config;
}
