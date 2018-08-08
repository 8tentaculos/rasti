import webpack from 'webpack';
import path from 'path';

const { NODE_ENV } = process.env;

const filename = `rasti${NODE_ENV === 'production' ? '.min' : ''}.js`;

export default {
    mode : NODE_ENV || 'development',
    entry : [
      './src/index',
    ],
    output : {
        path : path.join(__dirname, 'dist'),
        filename,
        library : 'Rasti',
        libraryTarget : 'umd'
    },
    module : {
        rules : [
            {
                test : /\.js$/, 
                exclude : /node_modules/,
                use : {
                    loader : 'babel-loader'
                }
            }
        ]
    }
};
