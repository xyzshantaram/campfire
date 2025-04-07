import type { ElementPosition } from "../types.ts";
/**
 * Inserts an element into the DOM given a reference element and the relative position
 * of the new element.
 *
 * * if `where` looks like `{ after: reference }`, the element is inserted into `reference`'s
 * parent, after `reference`.
 * * if `where` looks like `{ before: reference }`, the element is inserted into `reference`'s
 * parent, before `reference`.
 * * if `where` looks like `{ into: reference, at: 'start' }`, the element is inserted into
 * `reference`, before its first child.
 * * if `where` looks like `{ into: reference }`, the element is inserted into `reference`,
 * after its last child.
 * @param elems The elements to insert.
 * @param where An object specifying where to insert `elem` relative to another element.
 * @throws an Error when there are either zero or more than one keys present in `where`.
 * @returns the element that was inserted, so you can do `const a = insert(nu(), _)`.
 */
export declare const insert: (elems: Element[], where: ElementPosition) => Element[];
/**
 * Fires a callback when the DOMContentLoaded event fires.
 * @param cb The callback to run.
 * @returns void
 */
export declare const onload: (cb: (ev: Event) => void) => void;
export interface SelectParams {
    /** The selector to query for. */
    s: string;
    /** The parent node to query. Defaults to `document`. */
    from?: ParentNode;
    /** Whether to return all elements matching the given selector or just the first. */
    all?: true;
}
/**
 * Queries the DOM for a particular selector, and returns the first element matching it.
 * @param opts See SelectParams.
 * @returns Element(s) matching the given selector, or an empty list.
 */
export declare const select: ({ s, all, from }: SelectParams) => HTMLElement[];
/**
 * Removes `elt` from the DOM.
 * @param elt The element to remove.
 * @returns void
 */
export declare const rm: (elt: Element) => void;
/**
 * Empties a DOM element of its content.
 * @param elt The element to empty.
 */
export declare const empty: (elt: Element) => void;
