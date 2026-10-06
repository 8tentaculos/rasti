/**
 * Define `key` on `target` as an own data property. Unlike an assignment, it does not go
 * through an accessor declared on the prototype, so it shadows a getter with no setter
 * instead of throwing.
 * @param {object} target Object to define the property on.
 * @param {string} key Property name.
 * @param {any} value Property value.
 * @return {object} The target object.
 * @module
 * @private
 */
const defineOwn = (target, key, value) => Object.defineProperty(target, key, {
    value, writable : true, enumerable : true, configurable : true
});

export default defineOwn;
