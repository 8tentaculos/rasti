import Constants from './Constants.js';

/**
 * Check if an element is a component root element.
 * Component root elements carry the element data-attribute ending with '-1'
 * (the root is emitted first, so it gets `${uid}-1`).
 * @param {Element} el The element to check.
 * @return {boolean} True if the element is a component root element.
 * @private
 */
const isComponent = el => !!(el && el.dataset && el.dataset[Constants.DATASET_ELEMENT] && el.dataset[Constants.DATASET_ELEMENT].endsWith('-1'));

export default isComponent;
