/*
 * Helper function. If expression is a function, call it with context and args.
 * Otherwise, return expression.
 */
export default (expression, context, ...args) =>
    typeof expression === 'function' ?
        expression.apply(context, args) :
        expression;
