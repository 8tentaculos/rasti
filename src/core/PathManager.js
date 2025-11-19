/**
 * Manager for component position tracking and recycling.
 * @private
 */
class PathManager {
    constructor() {}

    /**
     * Reset before render.
     */
    reset() {
        this.paused = 0;
        this.previous = this.tracked || new Map();
        this.tracked = new Map();
        this.positionStack = [0];
    }

    /**
     * Push position to stack.
     */
    push() {
        this.positionStack.push(0);
    }

    /**
     * Pop position from stack.
     */
    pop() {
        this.positionStack.pop();
    }

    /**
     * Increment position.
     */
    increment() {
        this.positionStack[this.positionStack.length - 1]++;
    }

    /**
     * Pause tracking.
     */
    pause() {
        this.paused++;
    }

    /**
     * Resume tracking.
     */
    resume() {
        this.paused--;
    }

    /**
     * Get current path as array.
     * @return {string} Current position path.
     */
    getPath() {
        return this.positionStack.join('-');
    }

    /**
     * Track component at current path.
     * @param {Component} component The component to track.
     * @return {Component} The component.
     */
    track(component) {
        if (this.paused === 0) {
            this.tracked.set(
                this.getPath(),
                component
            );
        }

        return component;
    }

    /**
     * Tell if there was only one component rendered in the previous and current tracked maps
     * and that component instance is the same (was recycled).
     * Used by Component to detect simple single component cases and skip DOM moves.
     * @return {boolean} Returns true when there is exactly one component at the first level
     *                   and it was successfully recycled.
     */
    hasSingleComponent() {
        if (this.tracked.size !== 1 || this.previous.size !== 1) return false;
        const [currentPath, currentComponent] = this.tracked.entries().next().value;
        const [previousPath, previousComponent] = this.previous.entries().next().value;
        // Ensure the component is at the root level (path '0') so it is not part of a deeper partial/array.
        if (currentPath !== '0' || previousPath !== '0') return false;
        return currentComponent === previousComponent;
    }

    /**
     * Find a recyclable component for the current path based on constructor (type)
     * when the component is un-keyed.
     * @param {Component} candidate The candidate component instance.
     * @return {Component|null} The recyclable component or null if none found.
     */
    findRecyclable(candidate) {
        const previous = this.previous.get(this.getPath());
        return previous && !previous.key && previous.constructor === candidate.constructor ? previous : null;
    }
}

export default PathManager;
