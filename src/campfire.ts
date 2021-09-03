import { ElementProperties, Subscriber } from './types';

/*
    * Element creation helper.
    * Returns a new DOM element with the arguments specified in `args`.
    * PARAMS:
        * `tag`: The tag name of the newly created DOM element. Defaults to div.
        * `parent`: a DOM element to parent the newly created element to.
        * `id`: The ID of the newly created element.
        * `className`: A space-separated list of classes for the new element,
        *              similar to the `class` attribute in HTML.
        * `innerHTML`: The inner HTML of the element.
        * `children`: Children for this element. Can either be an Array of
        *             Nodes, an Array of HTMLElements or an HTMLCollection
        * `style`: An object containing styles to be set on the new element.
        * `on`: An object containing event handlers. See examples.
        * `misc`: Miscellaneous properties of the element.
*/
const create = (args: ElementProperties) => {
    let { tag, className, id, innerHTML, misc, style, on: handlers, attrs } = args;

    if (!tag) tag = 'div';
    let elem = document.createElement(tag);

    if (className) elem.className = className;
    if (id) elem.id = id;
    if (innerHTML) elem.innerHTML = innerHTML;
    if (misc) Object.assign(elem, misc);

    if (style) Object.assign(elem.style, style);

    if (handlers) {
        for (const handler in handlers) {
            elem.addEventListener(handler, handlers[handler]);
        }
    }

    if (attrs) {
        for (const attr in attrs) {
            elem.setAttribute(attr, attrs[attr]);
        }
    }

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
    _value: unknown = null;
    subscribers: Record<string, Record<number, Subscriber>> = {};
    subscriberCounts: Record<string, number> = {};
    dead = false;

    constructor(value: unknown) {
        this._value = value;
    }

    on(type: string, fn: Subscriber): number {
        this.subscriberCounts[type] = this.subscriberCounts[type] || 0;
        this.subscribers[type] = this.subscribers[type] || {};
        this.subscribers[type][this.subscriberCounts[type]] = fn;
        return this.subscriberCounts[type]++;
    }

    unsubscribe(type: string, idx: number) {
        delete this.subscribers[type][idx];
    }

    update(value: unknown) {
        if (this.dead) return;
        this._value = value;
        this._sendEvent("set", value);
    }

    _sendEvent(type: string, value: unknown) {
        for (const idx in Object.keys(this.subscribers[type])) {
            this.subscribers[type][idx](value);
        }
    }

    dispose() {
        this.dead = true;
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
    _value: unknown[];

    constructor(ls: unknown[]) {
        super(ls);
    }

    clear() {
        this.update([]);
    }

    push(val: unknown) {
        this._value.push(val);
        this._sendEvent("push", {
            value: val,
            idx: this._value.length - 1
        });
    }

    remove(idx: number) {
        if (idx < 0 || idx > this._value.length) throw new RangeError("Invalid index.");

        this._sendEvent("remove", {
            value: this._value[idx],
            idx: idx
        });
        this._value.splice(idx, 1);
    }

    get(idx: number) {
        if (idx < 0 || idx > this._value.length) throw new RangeError("Invalid index.");
        return this._value instanceof Array && this._value[idx];
    }

    setAt(idx: number, val: unknown) {
        if (idx < 0 || idx > this._value.length) throw new RangeError("Invalid index.");
        this._value[idx] = val;
        this._sendEvent("mutation", {
            value: val,
            idx: idx,
        });
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
    Store, ListStore, create, mustache, template
}