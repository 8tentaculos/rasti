/**
 * Assign an option to `target`. A getter with no setter on the prototype would make the
 * assignment throw, so in that case `key` is defined as an own data property, which
 * shadows the getter. Any other accessor receives the value through its setter.
 * @param {object} target Object to assign the option to.
 * @param {string} key Property name.
 * @param {any} value Property value.
 * @return {object} The target object.
 * @module
 * @private
 */
const assignOption = (target, key, value) => {
    try {
        target[key] = value;
    } catch (error) {
        // Assigning to a getter with no setter throws a TypeError; anything else propagates.
        if (!(error instanceof TypeError)) throw error;
        Object.defineProperty(target, key, {
            value, writable : true, enumerable : true, configurable : true
        });
    }
    return target;
};

export default assignOption;
