import { ElementProperties, Subscriber, Template } from './types';
/**
 * Takes an existing element and modifies its properties.
 * Refer ElementProperties documentation for details on
 * what can be changed.
 * @param elem The element to modify.
 * @param args Properties to set on the element.
 */
declare const extend: (elem: HTMLElement, args?: ElementProperties) => HTMLElement;
/**
 * An element creation helper.
 * @param eltInfo Basic information about the element.
 * `eltInfo` should be a string of the format `tagName#id.class1.class2`.
 * Each part (tag name, id, classes) is optional, and an infinite number of
 * classes is allowed. When `eltInfo` is an empty string, the tag name is assumed to be
 * `div`.
 * @param args - Optional extra properties for the created element.
 * @returns The newly created DOM element.
 */
declare const nu: (eltInfo: string, args?: ElementProperties) => HTMLElement;
/**
 * A simple reactive store.
 * @class Store
 * @public
 */
declare class Store {
    /**  The value of the store. */
    value: unknown;
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
    constructor(value: unknown);
    /**
     *
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
    update(value: unknown): void;
    /**
     * Forces all subscribers to the "update" event to be called.
     * @param value The new value to store.
     */
    refresh(): void;
    /**
     * Sends an event to all subscribers if the store has not been disposed of.
     * @internal
    */
    _sendEvent(type: string, value: unknown): void;
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
declare class ListStore extends Store {
    value: unknown[];
    constructor(ls: unknown[]);
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
    push(val: unknown): void;
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
    get(idx: number): any;
    /**
     * Sets the element at the given index `idx` to the value `val`. Sends a mutation event
     * with the value being an object bearing the properties:
     * @param idx The index to mutate.
     * @param val the new value at that index.
     */
    setAt(idx: number, val: unknown): void;
    /**
     * Utility accessor to find the length of the store.
     */
    get length(): number;
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
 * @returns A function that when passed an Object with templating data,
 * returns the result of the templating operation performed on the string str with
 * the data passed in.
 */
declare const template: (str: string) => Template;
/**
 * a simple HTML sanitizer. Escapes `&`, `<`, `>`, `'`, and `"` by
 * replacing them with their corresponding HTML escapes
 * (`&amp;`,`&gt;`, `&lt;`, `&#39;`, and `&quot`).
 * @param str A string to escape.
 * @returns The escaped string.
 * No characters other than the ones mentioned above are escaped.
 * `escape` is only provided for basic protection against XSS and if you need more
 * robust functionality consider using another HTML escaper (such as
 * [he](https://github.com/mathiasbynens/he)).
 */
declare const escape: (str: string) => string;
/**
 * Unescapes the output of escape() by replacing `&amp;`, `&gt;`, `&lt;`,
 * `&#39;`, and `&quot` with `&`, `<`, `>`, `'`, and `"` respectively.
 * @param str A string to unescape.
 * @returns The string, with its character references replaced by the characters it references.
 * No characters other than the ones mentioned above are unescaped.
 * If you need more robust functionality consider using another HTML
 * escaper (such as [he](https://github.com/mathiasbynens/he)).
 */
declare const unescape: (str: string) => string;
declare const _default: {
    Store: typeof Store;
    ListStore: typeof ListStore;
    nu: (eltInfo: string, args?: ElementProperties) => HTMLElement;
    mustache: (string: string, data?: Record<string, string>, shouldEscape?: boolean) => string;
    template: (str: string) => Template;
    escape: (str: string) => string;
    unescape: (str: string) => string;
    extend: (elem: HTMLElement, args?: ElementProperties) => HTMLElement;
};
export default _default;
export { Store, ListStore, nu, mustache, template, escape, unescape, extend };
