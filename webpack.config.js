let path = require('path');

const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

let webpackConfig = {
    entry: {
        myCustomViz: './src/visualizations/my-custom-viz.ts'
    },
    output: {
        filename: '[name].js',
        path: path.join(__dirname, 'dist'),
        library: '[name]',
        libraryTarget: 'umd'
    },
    resolve: {
        extensions: ['.ts', '.js', '.scss', '.css'],
        fallback: {
            path: require.resolve("path-browserify"),
            stream: false,
            http: false,
            https: false,
            fs: false,
            util: false,
            zlib: false,
            buffer: false,
          },
    },
    plugins: [
        new UglifyJSPlugin()
    ],
    module: {
        rules: [
            { test: /\.ts$/, loader: 'ts-loader' },
            { test: /\.css$/, loader: 'css-loader' },
            { test: /\.scss$/,
                use: [
                    'style-loader',
                    'css-loader',
                    'sass-loader',
                ]
            }
        ]
    },
    devServer: {
        compress: true,
        port: 3443,
        https: true
    },
    devtool: 'eval',
    watch: true
};

module.exports = webpackConfig;