import { ElementProperties, Subscriber } from './types';

/*
    * Element creation helper.
    * Returns a new DOM element with the arguments specified in `args`.
    * PARAMS:
        * `type`: The tag name of the newly created DOM element. Defaults to div.
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
    let { parent, type, className, id, innerHTML, misc, children, style, on: handlers, attrs } = args;

    if (!type) type = 'div';
    let elem = document.createElement(type);

    if (className) elem.className = className;
    if (id) elem.id = id;
    if (innerHTML) elem.innerHTML = innerHTML;
    if (misc) Object.assign(elem, misc);

    if (children) {
        if (children instanceof HTMLCollection) {
            children = Array.from(children);
        }
        children.forEach((child) => elem.appendChild(child));
    }

    if (style) Object.assign(elem.style, style);
    if (parent) parent.appendChild(elem);

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
    * `const store = new Store(<initial value>)` then use the `subscribe()` method
    * to add functions that get called with the new value of the store when it
    * is updated with `update(<new value>)`. The `subscribe()` method returns an
    * integer that can be passed to the `unsubscribe()` method to prevent the callback
    * passed into that `subscribe()` call from being called.
    * Calling the `dispose()` method for a Store will prevent it from updating any further.
*/
class Store {
    value: unknown = null;
    subscribers: Record<string, Subscriber> = {};
    subscriberCount = 0;
    dead = false;

    constructor(value: unknown) {
        this.value = value;
    }

    subscribe(fn: Subscriber): number {
        this.subscribers[this.subscriberCount] = fn;
        return ++this.subscriberCount;
    }

    unsubscribe(idx: number) {
        const str = idx.toString();
        if (Object.keys(this.subscribers).includes(str)) {
            delete this.subscribers[str];
        }
    }

    update(value: unknown) {
        if (this.dead) return;

        this.value = value;
        for (const subscriber of Object.keys(this.subscribers)) {
            this.subscribers[subscriber](this.value);
        }
    }

    dispose() {
        this.dead = true;
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
    return (data: Record <string, string>) => mustache(str, data);
}

export default {
    Store, create, mustache, template
}