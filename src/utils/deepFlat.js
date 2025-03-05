/*
 * Flatten an array recursively
 * @param {Array} arr Array to flat recursively
 * @return {Array} Flat array
 */
const deepFlat = (arr) => arr.reduce((acc, val) => {
    if (Array.isArray(val)) acc.push(...deepFlat(val));
    else acc.push(val);
    return acc;
}, []);

export default deepFlat;
