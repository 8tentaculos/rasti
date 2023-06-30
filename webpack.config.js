require('webpack');
const path = require('path');

const { NODE_ENV } = process.env;

const filename = `rasti${NODE_ENV === 'production' ? '.min' : ''}.js`;

module.exports = {
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
