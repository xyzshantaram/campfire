/**
 * Prevent values from being escaped by html``.
 * @param val Any value.
 * @returns An object that tells html`` to not escape `val` while building the HTML string.
 */
const r = (val, options) => {
    var _a;
    return {
        raw: true,
        contents: Array.isArray(val) ?
            val.join((_a = options === null || options === void 0 ? void 0 : options.joiner) !== null && _a !== void 0 ? _a : ' ') :
            val.toString()
    };
};
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
const html = (strings, ...values) => {
    const built = [];
    for (let i = 0; i < strings.length; i++) {
        built.push(strings[i] || '');
        let val = values[i];
        if (typeof val !== 'undefined' && typeof val !== 'object') {
            built.push(escape((val || '').toString()));
        }
        else {
            built.push((val === null || val === void 0 ? void 0 : val.contents) || '');
        }
    }
    return built.join('');
};
/**
 *
 * @param str A string to parse, of the form tag#id.classes[.classes].
 * @returns A `TagStringParseResult` object containing the parsed information.
 * @internal
 */
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
 * Takes an existing element and modifies its properties.
 * Refer ElementProperties documentation for details on
 * what can be changed.
 * @param elem The element to modify.
 * @param args Properties to set on the element.
 */
const extend = (elem, args = {}) => {
    let { contents, c, misc, m, style, s, on, attrs, a, raw, g, gimme } = args;
    let result = [elem];
    contents = contents || c || '';
    contents = raw ? contents : escape(contents);
    if (contents)
        elem.innerHTML = contents;
    Object.assign(elem, misc || m);
    Object.assign(elem.style, style || s);
    const toGet = gimme || g || [];
    if (toGet && toGet.length) {
        for (const selector of toGet) {
            result.push(elem.querySelector(selector));
        }
    }
    Object.entries(on || {}).forEach(([evt, listener]) => elem.addEventListener(evt, listener));
    Object.entries(attrs || a || {}).forEach(([attr, value]) => elem.setAttribute(attr, value));
    return result;
};
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
const nu = (eltInfo, args = {}) => {
    let { tag, id, classes } = _parseEltString(eltInfo);
    if (classes === null || classes === void 0 ? void 0 : classes.some(itm => itm.includes("#"))) {
        throw new Error("Error: Found # in a class name. " +
            "Did you mean to do elt#id.classes instead of elt.classes#id?");
    }
    if (!tag)
        tag = 'div';
    let elem = document.createElement(tag);
    if (id)
        elem.id = id;
    (classes || []).forEach((cls) => elem.classList.add(cls));
    return extend(elem, args);
};
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
const insert = (elem, where) => {
    const keys = Object.keys(where);
    if (keys.length !== 1) {
        throw new Error("Too many or too few positions specified.");
    }
    const ref = Object.values(where)[0];
    let position = 'afterend';
    if (where.after) {
        position = 'afterend';
    }
    else if (where.before) {
        position = 'beforebegin';
    }
    else if (where.prependTo) {
        position = 'afterbegin';
    }
    else if (where.appendTo) {
        position = 'beforeend';
    }
    ref.insertAdjacentElement(position, elem);
    return elem;
};
/**
 * A simple reactive store.
 * @class Store
 * @public
 */
class Store {
    /**
     * Creates an instance of Store.
     * @param value - The initial value of the store.
     */
    constructor(value) {
        /**
         * The subscribers currently registered to the store.
         * @internal
        */
        this._subscribers = {};
        /**
         * The subscribers currently registered to the store.
         * @internal
        */
        this._subscriberCounts = {};
        /**
         * A value describing whether or not the store has been disposed of.
         * @internal
         */
        this._dead = false;
        this.value = value;
    }
    /**
     * Add an event listener to the store.
     * @param type The type of event to listen for.
     * @param fn A function that will be called every time the store experiences an event of type `type`.
     * @param callNow Whether the function should be called once with the current value of the store.
     * The function will not be called for ListStore events "push", "remove", or "mutation".
     * @returns A number which can be passed to `Store.unsubscribe` to stop `fn` from being called from then on.
     */
    on(type, fn, callNow = false) {
        this._subscriberCounts[type] = this._subscriberCounts[type] || 0;
        this._subscribers[type] = this._subscribers[type] || {};
        this._subscribers[type][this._subscriberCounts[type]] = fn;
        if (callNow && !["push", "remove", "mutation", "setAt"].includes(type)) {
            fn(this.value);
        }
        return this._subscriberCounts[type]++;
    }
    /**
     *
     * @param type The type of event to unsubscribe from.
     * @param id The value returned by `Store.on` when the subscriber was registered.
     */
    unsubscribe(type, id) {
        delete this._subscribers[type][id];
    }
    /**
     * Sets the value of the store to be `value`. All subscribers to the "update" event are called.
     * @param value The new value to store.
     */
    update(value) {
        if (this._dead)
            return;
        this.value = value;
        this._sendEvent("update", value);
    }
    /**
     * Forces all subscribers to the "update" event to be called.
     * @param value The new value to store.
     */
    refresh() {
        this._sendEvent("refresh", this.value);
    }
    /**
     * Sends an event to all subscribers if the store has not been disposed of.
     * @internal
    */
    _sendEvent(type, value) {
        if (this._dead)
            return;
        this._subscribers[type] = this._subscribers[type] || {};
        for (const idx in Object.keys(this._subscribers[type])) {
            this._subscribers[type][idx](value);
        }
    }
    /**
     * Close the store so it no longer sends events.
     */
    dispose() {
        this._dead = true;
        this._subscribers = {};
        this._subscriberCounts = {};
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
    /**
     * Empties out the list store.
     *
     * A helper function that sends an `update` event
     * and sets the value of the store to [].
     */
    clear() {
        this.update([]);
    }
    /**
     * Append the value `val` to the end of the list. This method sends a "push" event,
     * with the value being an object with the properties:
     * * `value`: the value that was pushed
     * * `idx`: the index of the new value.
     * @param val The value to append.
     */
    push(val) {
        this.value.push(val);
        this._sendEvent("push", {
            value: val,
            idx: this.value.length - 1
        });
    }
    /**
     * Remove the element at the index `idx`. This method sends a "remove" event,
     * with the value being an object with the properties:
     * * `value`: the value that was removed
     * * `idx`: the index the removed value was at
     * @param val The value to append.
     */
    remove(idx) {
        if (idx < 0 || idx >= this.value.length)
            throw new RangeError("Invalid index.");
        this._sendEvent("remove", {
            value: this.value.splice(idx, 1)[0],
            idx: idx
        });
    }
    /**
     * Retrieves the value at the given index.
     * @param idx The index of the value to retrieve.
     * @returns The value at the index `idx`.
     */
    get(idx) {
        if (idx < 0 || idx > this.value.length)
            throw new RangeError("Invalid index.");
        return this.value instanceof Array && this.value[idx];
    }
    /**
     * Sets the element at the given index `idx` to the value `val`. Sends a mutation event
     * with the value being an object bearing the properties:
     * @param idx The index to mutate.
     * @param val the new value at that index.
     */
    setAt(idx, val) {
        if (idx < 0 || idx >= this.value.length)
            throw new RangeError("Invalid index.");
        this.value[idx] = val;
        this._sendEvent("mutation", {
            value: val,
            idx: idx,
        });
    }
    /**
     * Utility accessor to find the length of the store.
     */
    get length() {
        return this.value.length;
    }
}
/**
 * A reactive map store. [UNSTABLE: DO NOT USE!]
 * Implements set(key, value), remove(key), clear(), transform(key, fn), and get(key).
 * set() sends a "set" event, remove() sends a "remove" event, clear() sends a "clear" event,
 * and transform() sends a "mutation" event.
 */
class MapStore extends Store {
    /**
     * Constructor for MapStore.
     * Initializes the store with the provided initial key-value pairs.
     * @param init Initial key-value pairs to populate the store.
     */
    constructor(init) {
        super(new Map());
        // Populates the store with initial key-value pairs.
        for (const [k, v] of Object.entries(init)) {
            this.value.set(k, v);
        }
    }
    /**
     * Sets the value for the specified key. This method sends a "set" event,
     * with the value being an object with the properties:
     * * `key`: the key that was set
     * * `value`: the new value associated with the key
     * @param key The key to set.
     * @param value The value to associate with the key.
     */
    set(key, value) {
        this.value.set(key, value);
        this._sendEvent('set', {
            key, value
        });
    }
    /**
     * Removes the value associated with the specified key. This method sends a "remove" event,
     * with the value being an object with the property:
     * * `key`: the key whose value was removed
     * @param key The key to remove.
     */
    remove(key) {
        this.value.delete(key);
        this._sendEvent('remove', {
            key, value: this.value
        });
    }
    /**
     * Clears the entire map store. This method sends a "clear" event.
     */
    clear() {
        this.value = new Map();
        this._sendEvent('clear', undefined);
    }
    /**
     * Applies a transformation function to the value associated with the specified key.
     * This method sends a "mutation" event, with the value being an object with the properties:
     * * `key`: the key that was mutated
     * * `value`: the new value after applying the transformation function
     * @param key The key to transform.
     * @param fn The transformation function to apply.
     */
    transform(key, fn) {
        const old = this.value.get(key);
        if (!old)
            throw new Error(`ERROR: key ${key} does not exist in store!`);
        const transformed = fn(old);
        this.set(key, transformed);
    }
    /**
     * Retrieves the value associated with the specified key.
     * @param key The key to retrieve the value for.
     * @returns The value associated with the key.
     */
    get(key) {
        return this.value.get(key);
    }
}
/**
 * The function that actually does the mustache templating.
 * @param string - the string to be templated.
 * @param data - The replacement data.
 * @internal
 * @returns the templated string.
*/
const _mustache = (string, data = {}) => {
    const escapeExpr = new RegExp("\\\\({{\\s*" + Object.keys(data).join("|") + "\\s*}})", "gi");
    new RegExp(Object.keys(data).join("|"), "gi");
    return string.replace(new RegExp("(^|[^\\\\]){{\\s*(" + Object.keys(data).join("|") + ")\\s*}}", "gi"), function (matched, p1, p2) {
        return `${p1 || ""}${data[p2]}`;
    }).replace(escapeExpr, '$1');
};
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
const mustache = (string, data = {}, shouldEscape = true) => {
    let escaped = Object.assign({}, data);
    if (shouldEscape) {
        escaped = Object.fromEntries(Object.entries(escaped).map(([key, value]) => {
            return [key, escape(value)];
        }));
    }
    return _mustache(string, escaped);
};
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
const template = (str, shouldEscape = true) => {
    return (data) => mustache(str, data, shouldEscape);
};
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
 * Unescapes the output of escape() by replacing `&amp;`, `&gt;`, `&lt;`,
 * `&#39;`, and `&quot` with `&`, `<`, `>`, `'`, and `"` respectively.
 * @param str A string to unescape.
 * @returns The string, with its character references replaced by the characters it references.
 * No characters other than the ones mentioned above are unescaped.
 */
const unescape = (str) => {
    if (!str)
        return '';
    const expr = /&(?:amp|lt|gt|quot|#(0+)?39);/g;
    const entities = {
        '&amp;': '&',
        '&lt;': '<',
        '&gt;': '>',
        '&quot;': '"',
        '&#39;': "'"
    };
    return str.replace(expr, (entity) => entities[entity] || '\'');
};
/**
 * Fires a callback when the DOMContentLoaded event fires.
 * @param cb The callback to run.
 * @returns void
 */
const onload = (cb) => globalThis.addEventListener('DOMContentLoaded', cb);
/**
 * Queries the DOM for a particular selector, and returns the first element matching it.
 * @param selector The selector to query.
 * @param from The node to query.
 * @returns The first element matching the given selector, or null.
 */
const select = (selector, from = document) => from.querySelector(selector);
/**
 * Queries the DOM for a particular selector, and returns all elements that match it.
 * @param selector The selector to query.
 * @param from The node to query.
 * @returns An array of elements matching the given selector.
 */
const selectAll = (selector, from = document) => Array.from(from.querySelectorAll(selector));
/**
 * Removes `elt` from the DOM.
 * @param elt The element to remove.
 * @returns void
 */
const rm = (elt) => elt.remove();
/**
 * Empties a DOM element of its content.
 * @param elt The element to empty.
 */
const empty = (elt) => {
    elt.innerHTML = '';
};
const seq = (...args) => {
    let start = 0, stop = args[0], step = 1;
    if (typeof args[1] !== 'undefined') {
        start = args[0];
        stop = args[1];
    }
    if (args[2])
        step = args[2];
    const result = [];
    for (let i = start; i < stop; i += step) {
        result.push(i);
    }
    return result;
};
export default {
    Store, ListStore, nu, mustache, template, escape, unescape, extend, insert, empty, rm, selectAll, select, onload, html, r, seq, MapStore
};
export { Store, ListStore, nu, mustache, template, escape, unescape, extend, insert, empty, rm, selectAll, select, onload, html, r, seq, MapStore };
