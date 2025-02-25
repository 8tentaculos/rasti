/*
 * Helper function. If expression is a function, call it with context and args.
 * Otherwise, return expression.
 * @param {any} expression Expression to be evaluated.
 * @param {any} context Context to call the expression.
 * @param {...any} args Arguments to pass to the expression.
 * @return {any} The result of the expression.
 */
export default (expression, context, ...args) =>
    typeof expression === 'function' ?
        expression.apply(context, args) :
        expression;
