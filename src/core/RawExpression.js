/**
 * Compile-time descriptor for an original expression that survives outside of an
 * element attribute or a content interpolation — in practice, a dynamic tag name
 * (`<${tag}>`). It is emitted inline (no markers) by evaluating its expression, so
 * it is resolved on render but not reconciled between updates (a dynamic tag only
 * takes effect on recreation).
 * @param {number} exprIndex Index of the original expression this part evaluates.
 * @private
 */
class RawExpression {
    constructor(exprIndex) {
        this.exprIndex = exprIndex;
    }
}

export default RawExpression;
