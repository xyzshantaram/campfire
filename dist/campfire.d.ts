import { ElementProperties, ElementPosition, Subscriber, Template, StoreEvent, StoreInitializer } from './types';
interface RawHtml {
    raw: true;
    contents: string;
}
/**
 * Options for r()
 */
interface RawHtmlOptions {
    joiner?: string;
}
/**
 * Prevent values from being escaped by html``.
 * @param val Any value.
 * @returns An object that tells html`` to not escape `val` while building the HTML string.
 */
declare const r: (val: any, options?: RawHtmlOptions) => RawHtml;
/**
 *
 * @param strings The constant portions of the template string.
 * @param values The templated values.
 * @returns The built HTML.
 * @example
 * ```
 * const unsafe = `oops <script>alert(1)</script>`;
 * testing.innerHTML = html`foo bar baz ${unsafe}`;
 * console.assert(testing === "foo bar baz oops%20%3Cscript%3Ealert%281%29%3C/script%3E");
 * ```
 */
declare const html: (strings: TemplateStringsArray, ...values: (string | number | RawHtml)[]) => string;
/**
 * Takes an existing element and modifies its properties.
 * Refer ElementProperties documentation for details on
 * what can be changed.
 * @param elem The element to modify.
 * @param args Properties to set on the element.
 */
declare const extend: (elem: HTMLElement, args?: ElementProperties) => HTMLElement[];
/**
 * An element creation helper.
 * @param eltInfo Basic information about the element.
 * `eltInfo` should be a string of the format `tagName#id.class1.class2`.
 * Each part (tag name, id, classes) is optional, and an infinite number of
 * classes is allowed. When `eltInfo` is an empty string, the tag name is assumed to be
 * `div`.
 * @param args Optional extra properties for the created element.
 * @returns The newly created DOM element and any other elements requested in the
 * `gimme` parameter specified in args.
 * @example
 * ```
 * cf.nu(`elt#id.class1`, {
 *  raw: true,
 *  c: html`<span class=some-span>foo bar</span>`,
 *  gimme: ['.some-span']
 * }) // Output: [<elt#id.class1>, <the span some-span>]
 * ```
 * @example
 * ```
 * cf.nu(`span.some-span`, {
 *  // properties...
 *  // no gimme specified
 * }) // Output is still a list [<span.some-span>]
 * ```
 */
declare const nu: (eltInfo: string, args?: ElementProperties) => HTMLElement[];
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
 * @param elem The element to insert.
 * @param where An object specifying where to insert `elem` relative to another element.
 * @throws an Error when there are either zero or more than one keys present in `where`.
 * @returns the element that was inserted, so you can do `const a = insert(nu(), _)`.
 */
declare const insert: (elem: Element, where: ElementPosition) => Element;
/**
 * A simple reactive store.
 * @class Store
 * @public
 */
declare class Store<T> {
    /**  The value of the store. */
    value: T;
    /**
     * The subscribers currently registered to the store.
     * @internal
    */
    _subscribers: {
        [K in StoreEvent['type']]?: Record<number, Subscriber>;
    };
    /**
     * The subscribers currently registered to the store.
     * @internal
    */
    _subscriberCounts: Record<string, number>;
    /**
     * A value describing whether or not the store has been disposed of.
     * @internal
     */
    _dead: boolean;
    /**
     * Creates an instance of Store.
     * @param value - The initial value of the store.
     */
    constructor(value?: T);
    /**
     * Add an event listener to the store.
     * @param type The type of event to listen for.
     *   Supported event types include:
     *   - 'change': Triggered when the store's value is updated via `update()`.
     *   - Other custom event types may be supported depending on the store implementation.
     * @param fn A callback function that will be invoked when the specified event occurs.
     *   The function receives a `StoreEvent` object with details about the event.
     * @param callNow Determines whether the callback should be immediately invoked
     *   with the current store value. Note: Not applicable for events like "append",
     *   "remove" which have list/map-specific behaviors.
     * @returns A unique subscriber ID that can be used to unsubscribe the listener.
     * @throws May throw an error if the event type is invalid or if the callback is not a function.
     */
    on(type: StoreEvent['type'], fn: Subscriber, callNow?: boolean): number;
    /**
     * Removes a specific event listener from the store.
     * @param type The type of event from which to unsubscribe.
     * @param id The subscriber ID returned by the `on()` method when the listener was registered.
     * @throws Will throw an error if the subscriber ID is invalid or not found.
     */
    unsubscribe(type: StoreEvent['type'], id: number): void;
    /**
     * Updates the store's value and notifies all subscribers.
     * @param value The new value to set for the store.
     * @emits 'change' event with the new value when successfully updated.
     * @note No-op if the store has been disposed via `dispose()`.
     */
    update(value: T): void;
    /**
     * Sends an event to all subscribers if the store has not been disposed of.
     * @internal
    */
    _sendEvent(event: StoreEvent): void;
    /**
     * Close the store so it no longer sends events.
     */
    dispose(): void;
}
/**
    * A reactive list store.
    * Implements push(item). remove(idx), get(idx), and setAt(idx, item).
    * push() sends a "push" event
    * remove() sends a "remove" event
    * setAt() sends a "mutation" event
*/
declare class ListStore<T> extends Store<any> {
    value: T[];
    constructor(ls?: T[]);
    /**
     * Clears all elements from the store.
     * @description Sets the store's value to an empty array and triggers a 'clear' event.
     * @emits 'clear' event.
     */
    clear(): void;
    /**
     * Appends a new element to the end of the list.
     * @param val The value to add to the list.
     * @returns The new length of the list after appending.
     * @emits 'append' event with:
     *   - `value`: The appended item
     *   - `idx`: The index where the item was inserted (length - 1)
     */
    push(val: T): number;
    /**
     * Removes the element at the specified index.
     * @param idx The index of the element to remove.
     * @throws {RangeError} If the index is out of bounds.
     * @emits 'deletion' event with:
     *   - `value`: The removed item
     *   - `idx`: The index from which the item was removed
     */
    remove(idx: number): void;
    /**
     * Retrieves the element at the specified index.
     * @param idx The index of the element to retrieve.
     * @returns The element at the specified index.
     * @throws {RangeError} If the index is out of bounds.
     */
    get(idx: number): T;
    /**
     * Sets the value of an element at a specific index.
     * @param idx The index of the element to modify.
     * @param value The new value to set at the specified index.
     * @throws {RangeError} If the index is out of bounds.
     * @emits 'change' event with:
     *   - `value`: The new value
     *   - `idx`: The index of the modified element
     */
    set(idx: number, value: T): void;
    /**
     * Utility accessor to find the length of the store.
     */
    get length(): number;
}
/**
 * A reactive map store.
 * Implements set(key, value), remove(key), clear(), transform(key, fn), has(key), entries(),
 * and get(key).
 * set() sends a "set" event, remove() sends a "remove" event, clear() sends a "clear" event,
 * and transform() sends a "mutation" event.
 */
declare class MapStore<T> extends Store<any> {
    value: Map<string, T>;
    /**
     * Constructor for MapStore.
     * Initializes the store with the provided initial key-value pairs.
     * @param init Initial key-value pairs to populate the store.
     */
    constructor(init?: Record<string, T>);
    /**
     * Sets a value for a specific key in the store.
     * @param key The key to set or update.
     * @param value The value to associate with the key.
     * @emits 'change' event with:
     *   - `key`: The key that was set or updated
     *   - `value`: The new value associated with the key
     */
    set(key: string, value: T): void;
    /**
     * A no-operation method for MapStore to maintain base Store compatibility.
     * Does not perform any action.
     * @deprecated
     */
    update(): void;
    /**
     * Removes a key-value pair from the store.
     * @param key The key to remove.
     * @emits 'deletion' event with:
     *   - `key`: The key that was removed
     *   - `value`: The current state of the map after deletion
     */
    remove(key: string): void;
    /**
     * Removes all key-value pairs from the store.
     * @emits 'clear' event indicating the store has been emptied.
     */
    clear(): void;
    /**
     * Applies a transformation function to the value of a specific key.
     * @param key The key whose value will be transformed.
     * @param fn A function that takes the current value and returns a new value.
     * @throws {Error} If the key does not exist in the store.
     * @emits 'change' event with the transformed value (via internal `set` method)
     */
    transform(key: string, fn: (val: T) => T): void;
    /**
     * Retrieves the value associated with a specific key.
     * @param key The key to look up.
     * @returns The value associated with the key, or undefined if the key does not exist.
     */
    get(key: string): T | undefined;
    has(key: string): boolean;
    entries(): IterableIterator<[string, T]>;
}
/**
 * Applies mustache templating to a string. Any names surrounded by {{ }} will be
 * considered for templating: if the name is present as a property in `data`,
 * the mustache'd expression will be replaced with the value of the property in `data`.
 * Prefixing the opening {{ with double backslashes will escape the expression.
 * By default, mustache data is escaped with campfire's escape() function - you can
 * disable this by supplying the value of `esc` as false.
 * @param string - the string to be templated.
 * @param data - The data which will be used to perform replacements.
 * @param shouldEscape - Whether or not the templating data should be escaped. Defaults to true.
 * @returns the templated string.
*/
declare const mustache: (string: string, data?: Record<string, string>, shouldEscape?: boolean) => string;
/**
 * Returns a partial application that can be used to generate templated HTML strings.
 * Does not sanitize html, use with caution.
 * @param str - A string with mustaches in it. (For example:
 * `<span class='name'> {{ name }} </span>`)
 * @param shouldEscape - Whether or not the templating data should be escaped. Defaults to true.
 * @returns A function that when passed an Object with templating data,
 * returns the result of the templating operation performed on the string str with
 * the data passed in.
 */
declare const template: (str: string, shouldEscape?: boolean) => Template;
/**
 * a simple HTML sanitizer. Escapes `&`, `<`, `>`, `'`, and `"` by
 * replacing them with their corresponding HTML escapes
 * (`&amp;`,`&gt;`, `&lt;`, `&#39;`, and `&quot`).
 * @param str A string to escape.
 * @returns The escaped string.
 * No characters other than the ones mentioned above are escaped.
 * `escape` is only provided for basic protection against XSS and if you need more
 * robust functionality consider using another HTML escaper (such as
 * [he](https://github.com/mathiasbynens/he) or
 * [sanitize-html](https://github.com/apostrophecms/sanitize-html)).
 */
declare const escape: (str: string) => string;
/**
 * Unescapes the output of escape() by replacing `&amp;`, `&gt;`, `&lt;`,
 * `&#39;`, and `&quot` with `&`, `<`, `>`, `'`, and `"` respectively.
 * @param str A string to unescape.
 * @returns The string, with its character references replaced by the characters it references.
 * No characters other than the ones mentioned above are unescaped.
 */
declare const unescape: (str: string) => string;
/**
 * Fires a callback when the DOMContentLoaded event fires.
 * @param cb The callback to run.
 * @returns void
 */
declare const onload: (cb: (ev: Event) => void) => void;
export interface SelectParams {
    /** The selector to query for. */
    selector: string;
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
declare const select: ({ selector, all, from }: SelectParams) => (Element | null)[];
/**
 * Removes `elt` from the DOM.
 * @param elt The element to remove.
 * @returns void
 */
declare const rm: (elt: Element) => void;
/**
 * Empties a DOM element of its content.
 * @param elt The element to empty.
 */
declare const empty: (elt: Element) => void;
declare const seq: (...args: number[]) => number[];
declare const store: <T>(opts: StoreInitializer<T>) => ListStore<T> | MapStore<T> | Store<T>;
declare const _default: {
    store: <T>(opts: StoreInitializer<T>) => ListStore<T> | MapStore<T> | Store<T>;
    nu: (eltInfo: string, args?: ElementProperties) => HTMLElement[];
    mustache: (string: string, data?: Record<string, string>, shouldEscape?: boolean) => string;
    template: (str: string, shouldEscape?: boolean) => Template;
    escape: (str: string) => string;
    unescape: (str: string) => string;
    extend: (elem: HTMLElement, args?: ElementProperties) => HTMLElement[];
    insert: (elem: Element, where: ElementPosition) => Element;
    empty: (elt: Element) => void;
    rm: (elt: Element) => void;
    select: ({ selector, all, from }: SelectParams) => (Element | null)[];
    onload: (cb: (ev: Event) => void) => void;
    html: (strings: TemplateStringsArray, ...values: (string | number | RawHtml)[]) => string;
    r: (val: any, options?: RawHtmlOptions | undefined) => RawHtml;
    seq: (...args: number[]) => number[];
};
export default _default;
export { store, nu, mustache, template, escape, unescape, extend, insert, empty, rm, select, onload, html, r, seq };
export type { RawHtml, ElementPosition, ElementProperties, Subscriber, Template };
