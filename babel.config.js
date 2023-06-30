module.exports = {
    'presets' : [
        [
            '@babel/preset-env',
            {
                'modules' : process.env.BABEL_ENV === 'commonjs' ? 'commonjs' : false
            }
        ]
    ]
};
