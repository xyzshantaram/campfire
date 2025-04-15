const elements = new Map<string, HTMLElement>();

/**
 * Track an element by an arbitrary string id. This is essentially a global 
 * key-value store of elements you'd like to keep around.
 * @param id an id to track the element by. This has to be unique across your
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
 * @param id id of the element to track, as passed to `track()`.
 */
export const untrack = (id: string) => {
    elements.delete(id);
}

/**
 * Retrieve a tracked element by its id. Will return null if an element for
 * corresponding to a given id is not found.
 */
export const tracked = (id: string) => {
    return elements.get(id) || null;
}