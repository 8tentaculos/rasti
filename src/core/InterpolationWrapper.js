/**
 * Wrapper for interpolation results with markers.
 * @param {number} interpolationUid The interpolation UID for markers.
 * @param {any} result The interpolation result.
 * @private
 */
class InterpolationWrapper {
    constructor(interpolationUid, result) {
        this.interpolationUid = interpolationUid;
        this.result = result;
    }
}

export default InterpolationWrapper;
