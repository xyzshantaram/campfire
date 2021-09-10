const _parseEltString = (str) => {
    var _a;
    const matches = str ? str.match(/([0-9a-zA-Z\-]*)?(#[0-9a-zA-Z\-]*)?((.[0-9a-zA-Z\-]+)*)/) : undefined;
    const results = matches ? (_a = matches.slice(1, 4)) === null || _a === void 0 ? void 0 : _a.map((elem) => elem ? elem.trim() : undefined) : Array(3).fill(undefined);
    if (results && results[1])
        results[1] = results[1].replace(/#*/g, "");
    return matches ? {
        tag: results[0] || undefined,
        id: results[1] || undefined,
        classes: results[2] ? results[2].split('.').filter((elem) => elem.trim()) : undefined
    } : {};
};
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
const nu = (eltInfo, args = {}) => {
    let { innerHTML, i, misc, m, style, s, on: handlers, attrs, a } = args;
    let { tag, id, classes } = _parseEltString(eltInfo);
    if (!tag)
        tag = 'div';
    let elem = document.createElement(tag);
    if (id)
        elem.id = id;
    if (classes) {
        classes.forEach((cls) => elem.classList.add(cls));
    }
    innerHTML = innerHTML || i;
    misc = misc || m;
    style = style || s;
    attrs = attrs || a;
    if (innerHTML)
        elem.innerHTML = innerHTML;
    if (misc)
        Object.assign(elem, misc);
    if (style)
        Object.assign(elem.style, style);
    if (handlers)
        for (const handler in handlers)
            elem.addEventListener(handler, handlers[handler]);
    if (attrs)
        for (const attr in attrs)
            elem.setAttribute(attr, attrs[attr]);
    return elem;
};
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
class Store {
    constructor(value) {
        this.value = null;
        this._subscribers = {};
        this._subscriberCounts = {};
        this._dead = false;
        this.value = value;
    }
    on(type, fn, callNow = false) {
        this._subscriberCounts[type] = this._subscriberCounts[type] || 0;
        this._subscribers[type] = this._subscribers[type] || {};
        this._subscribers[type][this._subscriberCounts[type]] = fn;
        if (callNow) {
            fn(this.value);
        }
        return this._subscriberCounts[type]++;
    }
    unsubscribe(type, idx) {
        delete this._subscribers[type][idx];
    }
    update(value) {
        if (this._dead)
            return;
        this.value = value;
        this._sendEvent("update", value);
    }
    refresh() {
        this._sendEvent("refresh", this.value);
    }
    _sendEvent(type, value) {
        if (this._dead)
            return;
        this._subscribers[type] = this._subscribers[type] || {};
        for (const idx in Object.keys(this._subscribers[type])) {
            this._subscribers[type][idx](value);
        }
    }
    dispose() {
        this._dead = true;
    }
}
/**
    * A reactive list store.
    * Implements push(item). remove(idx), get(idx), and setAt(idx, item).
    * push() sends a "push" event
    * remove() sends a "remove" event
    * setAt() sends a "mutation" event
*/
class ListStore extends Store {
    constructor(ls) {
        super(ls);
    }
    clear() {
        this.update([]);
    }
    push(val) {
        this.value.push(val);
        this._sendEvent("push", {
            value: val,
            idx: this.value.length - 1
        });
    }
    remove(idx) {
        if (idx < 0 || idx >= this.value.length)
            throw new RangeError("Invalid index.");
        this.value.splice(idx, 1);
        this._sendEvent("remove", {
            value: this.value[idx],
            idx: idx
        });
    }
    get(idx) {
        if (idx < 0 || idx > this.value.length)
            throw new RangeError("Invalid index.");
        return this.value instanceof Array && this.value[idx];
    }
    setAt(idx, val) {
        if (idx < 0 || idx >= this.value.length)
            throw new RangeError("Invalid index.");
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
/**
    * Applies mustache templating to a string. Any names surrounded by {{ }} will be
    * considered for templating: if the name is present as a property in `data`,
    * the mustache'd expression will be replaced with the value of the property in `data`.
    * Prefixing the opening {{ with double backslashes will escape the expression.
*/
const mustache = (string, data = {}) => {
    return Object.entries(data).reduce((res, [key, value]) => {
        const mainRe = new RegExp(`(?<!\\\\){{\\s*${key}\\s*}}`, 'g');
        // lookbehind expression, only replaces if mustache was not preceded by a backslash
        // this regex is actually (?<!\\){{\s*<key>\s*}} but because of escaping it looks like that...
        const escapeRe = new RegExp(`\\\\({{\\s*${key}\\s*}})`, 'g');
        // the second regex now handles the cases that were skipped in the first case.
        return res.replace(mainRe, value || "").replace(escapeRe, '$1');
    }, string);
};
/**
    * Returns a partial application that can be used to generate templated HTML strings.
    * Pass in an HTML string with mustache standins in it, and pass in a Record<string, string>
    * to the resulting function to get back a templated string.
    * Does not sanitize html, use with caution.
*/
const template = (str) => {
    return (data) => mustache(str, data);
};
/**
    * Simple HTML sanitizer.
*/
const escape = (str) => {
    if (!str)
        return '';
    return str.replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
};
/**
    * Unescapes the output of escape().
*/
const unescape = (str) => {
    if (!str)
        return '';
    const expr = /(?<!\\)&(?:amp|lt|gt|quot|#(0+)?(?:39|96));/g;
    const entities = {
        '&amp;': '&',
        '&lt;': '<',
        '&gt;': '>',
        '&quot;': '"',
        '&#39;': "'"
    };
    return str.replace(expr, (entity) => entities[entity] || '\'');
};
export default {
    Store, ListStore, nu, mustache, template, escape, unescape
};
export { Store, ListStore, nu, mustache, template, escape, unescape };
