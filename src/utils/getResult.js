/**
 * Evaluate the expression. If it's a function, call it with the provided context and return the result.
 * Otherwise, return the expression as is.
 * @param {any} expression Expression to be evaluated.
 * @param {any} context Context to call the expression.
 * @param {...any} args Arguments to pass to the expression.
 * @return {any} The result of the expression.
 * @module
 * @private
 */
const getResult = (expression, context, ...args) =>
    typeof expression !== 'function' ? expression :
        expression.apply(context, args);

export default getResult;
