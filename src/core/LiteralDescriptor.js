import LiteralSlot from './LiteralSlot.js';

/**
 * A literal chunk of the template, kept as parsed. It is HTML source, emitted as
 * written, so it carries no expression and nothing to reconcile.
 * @param {string} value The literal HTML.
 * @property {string} value The literal HTML.
 * @property {Function} Slot The class of the live state this part renders through.
 * @private
 */
class LiteralDescriptor {
    constructor(value) {
        this.value = value;
    }
}

LiteralDescriptor.Slot = LiteralSlot;

export default LiteralDescriptor;
