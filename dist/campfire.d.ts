import { ElementProperties, Subscriber } from './types';
/**
    * Element creation helper.
    * Returns a new DOM element with the arguments specified in `args`.
    * PARAMS:
        * `eltInfo`: The basic info of the element.
            * A string in the format
            * <tagName>#<id>.<class1>.<class2>
            * An infinite number of classes is allowed, but only one id and tagName
            * should be supplied. All portions of eltInfo are optional. When passed
            * an empty string, a div is created.
        * `args`: An optional object containing the following properties:
        * (all properties are optional)
            * `innerHTML`, `i`: The inner HTML of the element.
            * `style`, `s`: An object containing styles to be set on the new element.
                * Understands styles as defined in CSSStyleDeclaration objects.
            * `on`: An object containing event handlers. See examples.
            * `misc`, `m`: Miscellaneous properties of the element.
*/
declare const nu: (eltInfo: string, args?: ElementProperties) => HTMLElement;
/**
    * The Store class is a simple reactive store. Create a store object with
    * `const store = new Store(<initial value>)` then use the `on()` method
    * with a event type ("set" is the only currently supported type) and a callback
    * to add functions that get called with the new value of the store when it
    * is updated with `update(<new value>)`. The `on()` method returns an
    * integer that can be passed to the `unsubscribe()` method to prevent the callback
    * passed into that `on()` call from being called.
    * Calling the `dispose()` method for a Store will prevent it from updating any further.
*/
declare class Store {
    value: unknown;
    _subscribers: Record<string, Record<number, Subscriber>>;
    _subscriberCounts: Record<string, number>;
    _dead: boolean;
    constructor(value: unknown);
    on(type: string, fn: Subscriber, callNow?: boolean): number;
    unsubscribe(type: string, idx: number): void;
    update(value: unknown): void;
    refresh(): void;
    _sendEvent(type: string, value: unknown): void;
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
    clear(): void;
    push(val: unknown): void;
    remove(idx: number): void;
    get(idx: number): any;
    setAt(idx: number, val: unknown): void;
    get length(): number;
}
/**
    * Applies mustache templating to a string. Any names surrounded by {{ }} will be
    * considered for templating: if the name is present as a property in `data`,
    * the mustache'd expression will be replaced with the value of the property in `data`.
    * Prefixing the opening {{ with double backslashes will escape the expression.
*/
declare const mustache: (string: string, data?: Record<string, string>) => string;
/**
    * Returns a partial application that can be used to generate templated HTML strings.
    * Pass in an HTML string with mustache standins in it, and pass in a Record<string, string>
    * to the resulting function to get back a templated string.
    * Does not sanitize html, use with caution.
*/
declare const template: (str: string) => (data: Record<string, string>) => string;
/**
    * Simple HTML sanitizer.
*/
declare const escape: (str: string) => string;
/**
    * Unescapes the output of escape().
    * Allows escaping escapes by prefixing them with a backslash.
*/
declare const unescape: (str: string) => string;
declare const _default: {
    Store: typeof Store;
    ListStore: typeof ListStore;
    nu: (eltInfo: string, args?: ElementProperties) => HTMLElement;
    mustache: (string: string, data?: Record<string, string>) => string;
    template: (str: string) => (data: Record<string, string>) => string;
    escape: (str: string) => string;
    unescape: (str: string) => string;
};
export default _default;
export { Store, ListStore, nu, mustache, template, escape, unescape };
