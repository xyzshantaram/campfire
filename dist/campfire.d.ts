import { ElementProperties, ElementPosition, Subscriber, Template } from './types';
interface RawHtml {
    raw: true;
    contents: string;
}
/**
 * Prevent values from being escaped by html``.
 * @param val Any value.
 * @returns An object that tells html`` to not escape `val` while building the HTML string.
 */
declare const r: (val: any) => RawHtml;
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
declare const extend: (elem: HTMLElement, args?: ElementProperties) => (HTMLElement | null)[];
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
declare const nu: (eltInfo: string, args?: ElementProperties) => (HTMLElement | null)[];
/**
 * Inserts an element into the DOM given a reference element and the relative position
 * of the new element.
 *
 * * if `where` looks like `{ after: reference }`, the element is inserted into `reference`'s
 * parent, after `reference`.
 * * if `where` looks like `{ before: reference }`, the element is inserted into `reference`'s
 * parent, before `reference`.
 * * if `where` looks like `{ prependTo: reference }`, the element is inserted into `reference`,
 * before its first child.
 * * if `where` looks like `{ appendTo: reference }`, the element is inserted into `reference`,
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
    _subscribers: Record<string, Record<number, Subscriber>>;
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
    constructor(value: T);
    /**
     * Add an event listener to the store.
     * @param type The type of event to listen for.
     * @param fn A function that will be called every time the store experiences an event of type `type`.
     * @param callNow Whether the function should be called once with the current value of the store.
     * The function will not be called for ListStore events "push", "remove", or "mutation".
     * @returns A number which can be passed to `Store.unsubscribe` to stop `fn` from being called from then on.
     */
    on(type: string, fn: Subscriber, callNow?: boolean): number;
    /**
     *
     * @param type The type of event to unsubscribe from.
     * @param id The value returned by `Store.on` when the subscriber was registered.
     */
    unsubscribe(type: string, id: number): void;
    /**
     * Sets the value of the store to be `value`. All subscribers to the "update" event are called.
     * @param value The new value to store.
     */
    update(value: T): void;
    /**
     * Forces all subscribers to the "update" event to be called.
     * @param value The new value to store.
     */
    refresh(): void;
    /**
     * Sends an event to all subscribers if the store has not been disposed of.
     * @internal
    */
    _sendEvent(type: string, value: T): void;
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
    constructor(ls: T[]);
    /**
     * Empties out the list store.
     *
     * A helper function that sends an `update` event
     * and sets the value of the store to [].
     */
    clear(): void;
    /**
     * Append the value `val` to the end of the list. This method sends a "push" event,
     * with the value being an object with the properties:
     * * `value`: the value that was pushed
     * * `idx`: the index of the new value.
     * @param val The value to append.
     */
    push(val: T): void;
    /**
     * Remove the element at the index `idx`. This method sends a "remove" event,
     * with the value being an object with the properties:
     * * `value`: the value that was removed
     * * `idx`: the index the removed value was at
     * @param val The value to append.
     */
    remove(idx: number): void;
    /**
     * Retrieves the value at the given index.
     * @param idx The index of the value to retrieve.
     * @returns The value at the index `idx`.
     */
    get(idx: number): false | T;
    /**
     * Sets the element at the given index `idx` to the value `val`. Sends a mutation event
     * with the value being an object bearing the properties:
     * @param idx The index to mutate.
     * @param val the new value at that index.
     */
    setAt(idx: number, val: T): void;
    /**
     * Utility accessor to find the length of the store.
     */
    get length(): number;
}
/**
 * A reactive map store. [UNSTABLE: DO NOT USE!]
 * Implements set(key, value), remove(key), clear(), transform(key, fn), and get(key).
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
    constructor(init: Record<string, T>);
    /**
     * Sets the value for the specified key. This method sends a "set" event,
     * with the value being an object with the properties:
     * * `key`: the key that was set
     * * `value`: the new value associated with the key
     * @param key The key to set.
     * @param value The value to associate with the key.
     */
    set(key: string, value: T): void;
    /**
     * Removes the value associated with the specified key. This method sends a "remove" event,
     * with the value being an object with the property:
     * * `key`: the key whose value was removed
     * @param key The key to remove.
     */
    remove(key: string): void;
    /**
     * Clears the entire map store. This method sends a "clear" event.
     */
    clear(): void;
    /**
     * Applies a transformation function to the value associated with the specified key.
     * This method sends a "mutation" event, with the value being an object with the properties:
     * * `key`: the key that was mutated
     * * `value`: the new value after applying the transformation function
     * @param key The key to transform.
     * @param fn The transformation function to apply.
     */
    transform(key: string, fn: (val: T) => T): void;
    /**
     * Retrieves the value associated with the specified key.
     * @param key The key to retrieve the value for.
     * @returns The value associated with the key.
     */
    get(key: string): T | undefined;
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
/**
 * Queries the DOM for a particular selector, and returns the first element matching it.
 * @param selector The selector to query.
 * @param from The node to query.
 * @returns The first element matching the given selector, or null.
 */
declare const select: (selector: string, from?: Document) => Element | null;
/**
 * Queries the DOM for a particular selector, and returns all elements that match it.
 * @param selector The selector to query.
 * @param from The node to query.
 * @returns An array of elements matching the given selector.
 */
declare const selectAll: (selector: string, from?: Document) => Element[];
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
declare const _default: {
    Store: typeof Store;
    ListStore: typeof ListStore;
    nu: (eltInfo: string, args?: ElementProperties) => (HTMLElement | null)[];
    mustache: (string: string, data?: Record<string, string>, shouldEscape?: boolean) => string;
    template: (str: string, shouldEscape?: boolean) => Template;
    escape: (str: string) => string;
    unescape: (str: string) => string;
    extend: (elem: HTMLElement, args?: ElementProperties) => (HTMLElement | null)[];
    insert: (elem: Element, where: ElementPosition) => Element;
    empty: (elt: Element) => void;
    rm: (elt: Element) => void;
    selectAll: (selector: string, from?: Document) => Element[];
    select: (selector: string, from?: Document) => Element | null;
    onload: (cb: (ev: Event) => void) => void;
    html: (strings: TemplateStringsArray, ...values: (string | number | RawHtml)[]) => string;
    r: (val: any) => RawHtml;
    seq: (...args: number[]) => number[];
    MapStore: typeof MapStore;
};
export default _default;
export { Store, ListStore, nu, mustache, template, escape, unescape, extend, insert, empty, rm, selectAll, select, onload, html, r, seq, MapStore };
export type { RawHtml, ElementPosition, ElementProperties, Subscriber, Template };
