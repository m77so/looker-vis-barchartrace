let path = require('path');
const TerserPlugin = require("terser-webpack-plugin")

let webpackConfig = {
    mode: 'production',
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
    module: {
        rules: [
            { test: /\.ts$/, loader: 'ts-loader' },
        ]
    },
    optimization: {
        minimize: true,
        minimizer: [
            new TerserPlugin({
                terserOptions: {
                    compress: {
                        drop_console: true, // console.log を出力しない
                    },
                },
            }),
        ],
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
