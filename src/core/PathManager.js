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
        this.paused = false;
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
        this.paused = true;
    }

    /**
     * Resume tracking.
     */
    resume() {
        this.paused = false;
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
        if (this.paused) return component;

        this.tracked.set(
            this.getPath(),
            component
        );

        return component;
    }

    /**
     * Find recyclable component by path and type.
     * @param {Function} constructor The component constructor.
     * @return {Component|null} The recyclable component or null.
     */
    findRecyclable(constructor) {
        const prev = this.previous.get(this.getPath());
        return prev && prev.constructor === constructor && !prev.key ? prev : null;
    }
}

export default PathManager;
