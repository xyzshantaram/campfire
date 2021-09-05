import { ElementProperties, Subscriber } from './types';

interface ElementInfo {
    tag?: string | undefined;
    id?: string | undefined;
    classes?: string[] | undefined
}

const _parse = (str: string | undefined): ElementInfo => {
    const matches = str ? str.match(/([0-9a-zA-Z\-]*)?(#[0-9a-zA-Z\-]*)?((.[0-9a-zA-Z\-]+)*)/): undefined;
    const results = matches ? matches.slice(1, 4)?.map((elem) => elem ? elem.trim() : undefined) : Array(3).fill(undefined);

    if (results && results[1]) results[1] = results[1].replace(/#*/g, "");

    return matches ? {
        tag: results[0] || undefined,
        id: results[1] || undefined, 
        classes: results[2] ? results[2].split('.').filter((elem: string) => elem.trim()) : undefined
    } : {};
};

/*
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
const nu = (eltInfo: string, args: ElementProperties = {}) => {
    let { innerHTML, i, misc, m, style, s, on: handlers, attrs, a } = args;

    let { tag, id, classes } = _parse(eltInfo);

    if (!tag) tag = 'div';
    let elem = document.createElement(tag);
    
    if (id) elem.id = id;

    if (classes) {
        classes.forEach((cls) => elem.classList.add(cls));
    }

    innerHTML = innerHTML || i;
    misc = misc || m;
    style = style || s;
    attrs = attrs || a;

    if (innerHTML) elem.innerHTML = innerHTML;
    if (misc) Object.assign(elem, misc);
    if (style) Object.assign(elem.style, style);
    if (handlers) for (const handler in handlers) elem.addEventListener(handler, handlers[handler]);
    if (attrs) for (const attr in attrs) elem.setAttribute(attr, attrs[attr]);

    return elem;
}

/*
    * The Store class is a simple reactive store. Create a store object with
    * `const store = new Store(<initial value>)` then use the `on()` method
    * with a event type ("set" is the only currently supported type) and a callback
    * to add functions that get called with the new value of the store when it
    * is updated with `update(<new value>)`. The `on()` method returns an
    * integer that can be passed to the `unsubscribe()` method to prevent the callback
    * passed into that `on()` call from being called.
    * Calling the `dispose()` method for a Store will prevent it from updating any further.
*/
class Store {
    value: unknown = null;
    _subscribers: Record<string, Record<number, Subscriber>> = {};
    _subscriberCounts: Record<string, number> = {};
    _dead = false;

    constructor(value: unknown) {
        this.value = value;
    }

    on(type: string, fn: Subscriber, callNow: boolean = false): number {
        this._subscriberCounts[type] = this._subscriberCounts[type] || 0;
        this._subscribers[type] = this._subscribers[type] || {};

        this._subscribers[type][this._subscriberCounts[type]] = fn;
        if (callNow) {
            fn(this.value);
        }
        return this._subscriberCounts[type]++;
    }

    unsubscribe(type: string, idx: number) {
        delete this._subscribers[type][idx];
    }

    update(value: unknown) {
        if (this._dead) return;
        this.value = value;
        this._sendEvent("update", value);
    }

    refresh() {
        this._sendEvent("refresh", this.value);
    }

    _sendEvent(type: string, value: unknown) {
        if (this._dead) return;
        this._subscribers[type] = this._subscribers[type] || {};
        for (const idx in Object.keys(this._subscribers[type])) {
            this._subscribers[type][idx](value);
        }
    }

    dispose() {
        this._dead = true;
    }
}
/* 
    * A reactive list store. 
    * Implements push(item). remove(idx), get(idx), and setAt(idx, item).
    * push() sends a "push" event
    * remove() sends a "remove" event
    * setAt() sends a "mutation" event
*/
class ListStore extends Store {
    value: unknown[];

    constructor(ls: unknown[]) {
        super(ls);
    }

    clear() {
        this.update([]);
    }

    push(val: unknown) {
        this.value.push(val);
        this._sendEvent("push", {
            value: val,
            idx: this.value.length - 1
        });
    }

    remove(idx: number) {
        if (idx < 0 || idx >= this.value.length) throw new RangeError("Invalid index.");
        this.value.splice(idx, 1);
        this._sendEvent("remove", {
            value: this.value[idx],
            idx: idx
        });
    }

    get(idx: number) {
        if (idx < 0 || idx > this.value.length) throw new RangeError("Invalid index.");
        return this.value instanceof Array && this.value[idx];
    }

    setAt(idx: number, val: unknown) {
        if (idx < 0 || idx >= this.value.length) throw new RangeError("Invalid index.");
        this.value[idx] = val;
        this._sendEvent("mutation", {
            value: val,
            idx: idx,
        });
    }
    
    get length() {
        return this.value.length;
    }
}

/*
    * Applies mustache templating to a string. Any names surrounded by {{ }} will be
    * considered for templating: if the name is present as a property in `data`,
    * the mustache'd expression will be replaced with the value of the property in `data`.
    * Prefixing the opening {{ with double backslashes will escape the expression.
*/
const mustache = (string: string, data: Record<string, string> = {}): string => {
    return Object.entries(data).reduce((res, [key, value]) => {
        const mainRe = new RegExp(`(?<!\\\\){{\\s*${key}\\s*}}`, 'g')
        // lookbehind expression, only replaces if mustache was not preceded by a backslash
        // this regex is actually (?<!\\){{\s*<key>\s*}} but because of escaping it looks like that...
        const escapeRe = new RegExp(`\\\\({{\\s*${key}\\s*}})`, 'g')
        // the second regex now handles the cases that were skipped in the first case.
        return res.replace(mainRe, value || "").replace(escapeRe, '$1');
    }, string);
}

/*
    * Returns a partial application that can be used to generate templated HTML strings. 
    * Pass in an HTML string with mustache standins in it, and pass in a Record<string, string>
    * to the resulting function to get back a templated string.
    * Does not sanitize html, use with caution.
*/
const template = (str: string) => {
    return (data: Record<string, string>) => mustache(str, data);
}

export default {
    Store, ListStore, nu, mustache, template
}

export {
    Store, ListStore, nu, mustache, template
}