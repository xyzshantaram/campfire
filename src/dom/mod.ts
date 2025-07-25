import type { ElementPosition } from "../types.ts";
import { CfDom } from "./config.ts";
import type { CfHTMLElementInterface } from "./config.ts";
export { CfDom };

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
 * @param els The element(s) to insert.
 * @param where An object specifying where to insert `elem` relative to another element.
 * @throws an Error when there are no valid keys ('into', 'after', or 'before') present in `where`.
 * @returns the element that was inserted, so you can do `const a = insert(nu(), _)`.
 */
export const insert = (els: Element | Element[], where: ElementPosition): typeof els => {
    // Check we have at least one valid key
    if (!("into" in where) && !("after" in where) && !("before" in where)) {
        throw new Error(
            "No valid position specified. Use 'into', 'after', or 'before'.",
        );
    }

    let position: InsertPosition = "beforeend";
    let ref: CfHTMLElementInterface;

    if ("after" in where) {
        position = "afterend";
        ref = where.after;
    } else if ("before" in where) {
        position = "beforebegin";
        ref = where.before;
    } else if ("into" in where && where.at === "start") {
        position = "afterbegin";
        ref = where.into;
    } else {
        ref = where.into;
    }

    const frag = CfDom.createDocumentFragment();
    if (Array.isArray(els)) {
        for (const item of els) frag.appendChild(item);
    } else {
        frag.appendChild(els);
    }

    if (position === "beforebegin") {
        const parentNode = ref.parentNode;
        if (parentNode) parentNode.insertBefore(frag, ref);
    } else if (position === "afterend") {
        const parentNode = ref.parentNode;
        if (parentNode) parentNode.insertBefore(frag, ref.nextSibling);
    } else if (position === "afterbegin") {
        ref.insertBefore(frag, ref.firstChild);
    } else {
        ref.appendChild(frag);
    }

    return els;
};

/**
 * Fires a callback when the DOMContentLoaded event fires.
 * @param cb The callback to run.
 * @returns void
 */
export const onload = (cb: (ev: Event) => void): void =>
    globalThis.addEventListener("DOMContentLoaded", cb);

/**
 * Params for `select()`.
 */
export type SelectParams = {
    /** The selector to query for. */
    s: string;
    /** The parent node to query. Defaults to `document`. */
    from?: ParentNode;
    /** Whether to return all elements matching the given selector or just the first. */
    all?: true;
};

/**
 * Queries the DOM for a particular selector, and returns the first element matching it.
 * @param opts See SelectParams.
 * @returns Element(s) matching the given selector, or an empty list.
 */
export function select(
    params: SelectParams & { single: true },
): HTMLElement | null;
export function select(
    params: SelectParams & { single?: false },
): HTMLElement[];
export function select(
    { s, all, from, single }: SelectParams & { single?: boolean },
) {
    const parent = (from ?? CfDom.document) as ParentNode;
    if (all) {
        return Array.from(CfDom.querySelectorAll(s, parent)) as HTMLElement[];
    }

    const elt = CfDom.querySelector(s, parent);
    return single ? elt : [elt];
}

/**
 * Removes `elt` from the DOM.
 * @param elt The element to remove.
 * @returns void
 */
export const rm = (elt: Element): void => elt.remove();

/**
 * Empties a DOM element of its content.
 * @param elt The element to empty.
 */
export const empty = (elt: Element): void => {
    elt.innerHTML = "";
};
