import path from 'path';
import webpack from 'webpack';

import HtmlWebpackPlugin from 'html-webpack-plugin';

import MiniCssExtractPlugin from 'mini-css-extract-plugin';

const { NODE_ENV } = process.env;

export default {
    entry : [
        './src/index'
    ],
    
    output : {
        path : path.resolve(__dirname, 'dist'),
        filename : 'main.js',
    },
    
    ...(NODE_ENV === 'production' ? {
        mode : 'production'
    } : {
        mode : 'development',
        devtool : 'inline-source-map',
        devServer: {
            contentBase: './dist',
            host : '0.0.0.0'
        }
    }),
    
    module : {
        rules : [
            {
                test : /\.js$/,
                exclude : /node_modules/,
                use : {
                    loader : 'babel-loader'
                }
            },
            {
                test : /\.css$/,
                ...(NODE_ENV === 'production' ? {
                    use : [
                        { loader : MiniCssExtractPlugin.loader },
                        { loader : 'css-loader' }
                    ]
                } : {
                    use : [
                        { loader : 'style-loader/url' },
                        { loader : 'file-loader' }
                    ]
                })
            }
        ]
    },
    
    plugins : [
        new HtmlWebpackPlugin({
            template : './src/index.html'
        }),
        ...(NODE_ENV === 'production' ? [
            new MiniCssExtractPlugin()
        ] : [])
    ]
};
