const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: './src/main.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js',
    },
    resolve: {
        extensions: ['.js'],
    },
    devtool: 'source-map',
    plugins: [
        new HtmlWebpackPlugin({
            template: path.join(__dirname, 'public/index.html'),
        }),
        new CopyWebpackPlugin([
            { from: 'static' },
        ]),
    ],
    module: {
        rules: [
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.(png|jpg|gif|svg)$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: '[name].[ext]',
                            outputPath: 'images/', // Output path for copied images
                        },
                    },
                ],
            },
        ],
    },
};