/**
 * The indices of a longest increasing subsequence of `values`, ascending. A negative
 * value stands for an item with no place in any subsequence and is left out.
 *
 * Keeps, for every length, the index of the smallest value that ends an increasing
 * subsequence of that length (`tails`), which is itself increasing and so can be
 * searched by halves; `previous` links each value to the one it extends, so the
 * subsequence is recovered by walking the links back from the last tail.
 *
 * @param {Array<number>} values The values to walk.
 * @return {Array<number>} The indices of one longest increasing subsequence.
 * @module
 * @private
 */
export default function increasingSubsequence(values) {
    const tails = [];
    const previous = [];

    for (let i = 0; i < values.length; i++) {
        const value = values[i];
        if (value < 0) continue;
        const last = tails[tails.length - 1];
        // Extends the longest subsequence found so far.
        if (!tails.length || values[last] < value) {
            previous[i] = last;
            tails.push(i);
            continue;
        }
        // Otherwise it can only replace the tail of the shortest subsequence it ends.
        let low = 0;
        let high = tails.length - 1;
        while (low < high) {
            const middle = (low + high) >> 1;
            if (values[tails[middle]] < value) low = middle + 1;
            else high = middle;
        }
        if (value < values[tails[low]]) {
            if (low > 0) previous[i] = tails[low - 1];
            tails[low] = i;
        }
    }

    let length = tails.length;
    let index = tails[length - 1];
    while (length-- > 0) {
        tails[length] = index;
        index = previous[index];
    }

    return tails;
}
