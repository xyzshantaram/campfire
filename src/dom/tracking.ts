/**
 * Element tracking utility module
 * 
 * This module provides a global registry for tracking DOM elements by custom identifiers.
 * It allows you to store references to elements and retrieve them from anywhere in your code.
 * Useful for creating routing systems, modal managers, or other scenarios where you need
 * to access specific elements across different parts of your application.
 */

const elements = new Map<string, HTMLElement>();

/**
 * Track an element by an arbitrary string id. This is essentially a global 
 * key-value store of elements you'd like to keep around.
 * 
 * @example
 * ```ts
 * // Create and track elements
 * const header = document.createElement('header');
 * track('main-header', header);
 * 
 * // Track dynamically created elements
 * const [sidebar] = nu('aside.sidebar').done();
 * track('app-sidebar', sidebar);
 * ```
 * 
 * @param id An id to track the element by. This has to be unique across your
 * entire application.
 * @param elt The element to track.
 */
export const track = (id: string, elt: HTMLElement) => {
    elements.set(id, elt);
}

/**
 * Stop tracking an element that was previously tracked by `track()`. If you're
 * calling track for thousands of elements it's probably a good idea to untrack
 * them when you're done.
 * 
 * @example
 * ```ts
 * // Clean up when a component is removed
 * function removeComponent(id: string) {
 *   const element = tracked(id);
 *   if (element) {
 *     element.remove();
 *     untrack(id);
 *   }
 * }
 * ```
 * 
 * @param id Id of the element to untrack, as passed to `track()`.
 */
export const untrack = (id: string) => {
    elements.delete(id);
}

/**
 * Retrieve a tracked element by its id. Will return null if an element
 * corresponding to a given id is not found.
 * 
 * @example
 * ```ts
 * // Access tracked elements from anywhere in your code
 * function showSidebar() {
 *   const sidebar = tracked('app-sidebar');
 *   if (sidebar) {
 *     sidebar.style.display = 'block';
 *   }
 * }
 * ```
 * 
 * @param id The id of the tracked element to retrieve
 * @returns The tracked element, or null if not found
 */
export const tracked = (id: string) => {
    return elements.get(id) || null;
}