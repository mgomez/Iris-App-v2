var path = require('path');
var webpack = require('webpack');
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var CopyWebpackPlugin = require('copy-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');

var pkg = require('./package.json');
var nodeModules = __dirname + '/node_modules/';

var config = {
    // the main entry of our app
    entry: {
        app: './src/app/index.js'
    },
    // output configuration
    output: {
        path: 'dist',
        filename: 'app.js'
    },
    // f7 alias
    resolve: {
        alias: {
            'nodeModules': nodeModules,
            'handlebars': 'handlebars/dist/handlebars.min.js'
        }
    },
    // how modules should be transformed
    module: {
        loaders: [
            { test: /\.css$/, loader: ExtractTextPlugin.extract('style-loader', 'css-loader', "postcss-loader") },
            { test: /\.less$/, loader: ExtractTextPlugin.extract("style-loader", 'css-loader?sourceMap!!postcss-loader!less-loader') },
            { test: /\.js$/, loader: 'babel', exclude: /(node_modules|bower_components)/ },
            { test: /\.html$/, loader: 'html' },
            { test: /\.png$/, loader: 'url?limit=8192&mimetype=image/png' },
            { test: /\.jpe?g$/, loader: 'url?limit=8192&mimetype=image/jpg' },
            { test: /\.gif$/, loader: 'url?limit=8192&mimetype=image/gif' },
            { test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=8192&mimetype=image/svg+xml' },
            { test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=8192&mimetype=application/font-woff2' },
            { test: /\.woff(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=8192&mimetype=application/font-woff' },
            { test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=8192&mimetype=application/octet-stream' },
            { test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, loader: 'file' },
            { test: /\.json$/, loader: 'json-loader' }
        ],
        noParse: [
            /node_modules\/localforage\/dist\/localforage.js/
        ]
    },
    node: {
        fs: 'empty'
    },
    // configure babel-loader.
    babel: {
        presets: ['es2015', 'es2017'],
        plugins: ['transform-runtime']
    },
    plugins: [
        new ExtractTextPlugin("style.css", {
            allChunks: true
        }),
        new webpack.optimize.OccurrenceOrderPlugin(),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoErrorsPlugin(),
        new CopyWebpackPlugin([
            { from: './src/page', to: './page' }
        ]),
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: 'index.html',
            inject: true
        })
    ]
};

if (process.env.NODE_ENV === 'production') {
    config.plugins.pop();
    config.plugins = config.plugins.concat([
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: '"production"'
            }
        }),
        new webpack.optimize.DedupePlugin(),
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            }
        }),
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: 'index.html',
            inject: true,
            hash: true,
            minify: {
                removeComments: true,
                collapseWhitespace: true,
                removeAttributeQuotes: true
            }
        }),
        new webpack.optimize.CommonsChunkPlugin({
            name: 'vendor',
            filename: 'vendor.js',
            minChunks: function(module, count) {
                // any required modules inside node_modules are extracted to vendor
                return (module.resource && /\.js$/.test(module.resource) && module.resource.indexOf('/node_modules/') >= 0)
            }
        })
    ]);
}

module.exports = config;