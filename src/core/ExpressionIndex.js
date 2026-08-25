/**
 * A reference to one of the template's original expressions, by index. The skeleton
 * stores it wherever a value may be either an expression or a literal parsed from the
 * template — an attribute key or value, and a part that is an expression on its own
 * (a dynamic tag name) — so the two are told apart by type rather than by the shape
 * of the literal.
 * @param {number} index Index of the expression in the render's `expressions`.
 * @private
 */
class ExpressionIndex {
    constructor(index) {
        this.index = index;
    }
}

export default ExpressionIndex;
