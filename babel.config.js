const plugins = [
    '@babel/plugin-transform-arrow-functions',
    '@babel/plugin-transform-block-scoped-functions',
    '@babel/plugin-transform-block-scoping',
    ['@babel/plugin-transform-classes', { 'loose': true }],
    ['@babel/plugin-transform-computed-properties', { 'loose': true }],
    ['@babel/plugin-transform-destructuring', { 'loose': true }],
    ['@babel/plugin-transform-for-of', { 'loose': true }],
    '@babel/plugin-transform-function-name',
    '@babel/plugin-transform-literals',
    '@babel/plugin-transform-object-super',
    '@babel/plugin-transform-parameters',
    '@babel/plugin-transform-shorthand-properties',
    ['@babel/plugin-transform-spread', { 'loose': true }],
    '@babel/plugin-transform-sticky-regex',
    ['@babel/plugin-transform-template-literals', { 'loose': true }],
    '@babel/plugin-transform-unicode-regex',
    '@babel/plugin-transform-member-expression-literals',
    '@babel/plugin-transform-property-literals'
];

if (process.env.BABEL_ENV === 'commonjs') {
    plugins.push(['@babel/plugin-transform-modules-commonjs', { 'loose': true }]);
}

module.exports = {
    plugins
};
