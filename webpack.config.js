const path = require('path')
const webpack = require('webpack');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

module.exports = {
    mode: 'production',
    entry: {
        'axios-api-module': './src/index.js'
    },
    externals: ['axios'],
    output: {
        path: path.resolve(__dirname, './dist'),
        filename: '[name].min.js',
        libraryTarget: 'umd',
        library: 'ApiModule',
        globalObject: 'typeof self !== \'undefined\' ? self : this',
    },
    module: {
        rules: [{
            test: /\.js$/,
            exclude: /node_modules/,
            loader: "babel-loader"
        }]
    },
    plugins: [
        new webpack.BannerPlugin({
            banner: `axios-api-module.js v${require('./package.json').version}\n(c) ${new Date().getFullYear()} Calvin Von\nReleased under the MIT License.`
        }),
        new UglifyJsPlugin({
            uglifyOptions: {
                compress: {
                    warnings: false
                }
            },
            parallel: true
        })
    ]
}