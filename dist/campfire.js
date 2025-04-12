// src/dom/config.ts
var _CfDom = class _CfDom {
  // Public accessor for document
  static get document() {
    return _CfDom._document;
  }
  /**
   * Initialize the shim by attempting to detect browser environment.
   * If in a browser, use the native DOM objects; otherwise, leave them unset.
   */
  static initialize() {
    if (_CfDom._initialized) return;
    try {
      if (typeof window !== "undefined" && window.document) {
        _CfDom._document = window.document;
        _CfDom._window = window;
        _CfDom._HTMLElement = window.HTMLElement;
      }
    } catch {
    }
    _CfDom._initialized = true;
  }
  /**
   * Configure the shim with custom DOM implementation.
   */
  static configure(options) {
    if (options.document) _CfDom._document = options.document;
    if (options.window) _CfDom._window = options.window;
    if (options.HTMLElement) _CfDom._HTMLElement = options.HTMLElement;
    if (typeof options.ssr !== "undefined") this.ssr = options.ssr;
    _CfDom._initialized = true;
  }
  /**
   * Check if shim is properly configured.
   */
  static ensureInitialized() {
    if (!_CfDom._initialized) {
      _CfDom.initialize();
    }
    _CfDom.ensureAvailable(_CfDom._document, "document");
    _CfDom.ensureAvailable(_CfDom._window, "window");
    _CfDom.ensureAvailable(_CfDom._HTMLElement, "HTMLElement");
  }
  /**
   * Throws an error if the specified object is not available.
   */
  static ensureAvailable(obj, name) {
    if (!obj) {
      throw new Error(`CfDom: ${name} is not available.Please configure CfDom with a valid DOM implementation.`);
    }
  }
  // Document methods
  static createElement(tagName) {
    _CfDom.ensureInitialized();
    return _CfDom._document.createElement(tagName);
  }
  static createDocumentFragment() {
    _CfDom.ensureInitialized();
    return _CfDom._document.createDocumentFragment();
  }
  static querySelector(selector, node) {
    _CfDom.ensureInitialized();
    const n = node ?? _CfDom._document;
    return n.querySelector(selector);
  }
  static querySelectorAll(selector, node) {
    _CfDom.ensureInitialized();
    const n = node ?? _CfDom._document;
    return n.querySelectorAll(selector);
  }
  static get body() {
    _CfDom.ensureInitialized();
    return _CfDom._document.body;
  }
  /**
   * Add event listener with SSR protection
   * This is one of the few element methods we keep as it has special SSR handling
   */
  static addElEventListener(el, type, listener, options) {
    _CfDom.ensureInitialized();
    if (this.isSsr()) throw new Error("Event listeners are not available in SSR contexts!");
    el.addEventListener(type, listener, options);
  }
  // Additional helpers
  static isHTMLElement(obj) {
    _CfDom.ensureInitialized();
    return obj instanceof _CfDom._HTMLElement;
  }
  /**
   * Check if code is running in a browser environment.
   * This can be useful for conditional logic based on environment.
   */
  static isBrowser() {
    return typeof window !== "undefined" && !!window.document;
  }
  /**
   * Check if DOM shim is using a custom (non-browser) implementation.
   */
  static isUsingCustomDOMImplementation() {
    _CfDom.ensureInitialized();
    return _CfDom._document !== null && (typeof window === "undefined" || _CfDom._document !== window.document);
  }
  static isSsr(value) {
    if (typeof value !== "undefined") return this.ssr = value;
    return this.ssr;
  }
};
// Use a different name for the private field to avoid naming conflicts with getter
_CfDom._document = null;
_CfDom._window = null;
_CfDom._HTMLElement = null;
_CfDom._initialized = false;
_CfDom.ssr = false;
var CfDom = _CfDom;
CfDom.initialize();

// src/dom/mod.ts
var insert = (els, where) => {
  if (!("into" in where) && !("after" in where) && !("before" in where)) {
    throw new Error("No valid position specified. Use 'into', 'after', or 'before'.");
  }
  let position = "beforeend";
  let ref;
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
var onload = (cb) => globalThis.addEventListener("DOMContentLoaded", cb);
function select({ s, all, from, single }) {
  const parent = from ?? CfDom.document;
  if (all) {
    return Array.from(CfDom.querySelectorAll(s, parent));
  }
  const elt = CfDom.querySelector(s, parent);
  return single ? elt : [elt];
}
var rm = (elt) => elt.remove();
var empty = (elt) => {
  elt.innerHTML = "";
};

// src/utils.ts
var escape = (str) => {
  if (!str) return "";
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
};
var unescape = (str) => {
  if (!str) return "";
  const expr = /&(?:amp|lt|gt|quot|#(0+)?39);/g;
  const entities = {
    "&amp;": "&",
    "&lt;": "<",
    "&gt;": ">",
    "&quot;": '"',
    "&#39;": "'"
  };
  return str.replace(expr, (entity) => entities[entity] || "'");
};
var seq = (...args) => {
  let start = 0, stop = args[0], step = 1;
  if (typeof args[1] !== "undefined") {
    start = args[0];
    stop = args[1];
  }
  if (args[2]) step = args[2];
  const result = [];
  for (let i = start; i < stop; i += step) {
    result.push(i);
  }
  return result;
};
var fmtNode = (node) => {
  const result = ["<"];
  result.push(node.tagName.toLowerCase());
  if (node.id) result.push(`#${node.id}`);
  if (node.className.trim()) result.push(`.${node.className.split(" ").join(".")}`);
  result.push(...Array.from(node.attributes).map((attr) => `${attr.name}="${attr.value}"`).slice(0, 3).join(" "));
  return result.join("");
};
var initMutationObserver = () => {
  if (!CfDom.isBrowser()) return;
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      mutation.addedNodes.forEach((node) => {
        if (!CfDom.isHTMLElement(node)) return;
        const parent = mutation.target;
        console.log(parent, node);
        if (!parent.hasAttribute("data-cf-deps")) return;
        if (parent.hasAttribute("data-cf-fg-updates")) return;
        const reactiveChildren = node.querySelectorAll?.("[data-cf-deps]").length ?? 0;
        if (!node.hasAttribute("data-cf-deps") && reactiveChildren === 0) return;
        console.warn(`[Campfire] \u26A0\uFE0F A reactive node ${fmtNode(node)} was inserted into a reactive container ${fmtNode(parent)} This may cause it to be wiped on re-render.`);
      });
    }
  });
  if (!CfDom.body.hasAttribute("cf-disable-mo"))
    observer.observe(CfDom.body, { childList: true, subtree: true });
};
var callbackify = (fn) => {
  return (cb, ...args) => {
    fn(...args).then((v) => cb(null, v)).catch((err) => cb(err, null));
  };
};
var poll = (fn, interval, callNow = false) => {
  let timeout = null;
  const handler = () => {
    try {
      fn();
    } finally {
      timeout = setTimeout(handler, interval);
    }
  };
  if (callNow) handler();
  else timeout = setTimeout(handler, interval);
  return () => {
    if (timeout !== null) clearTimeout(timeout);
  };
};
var enumerate = (arr) => {
  if (!Array.isArray(arr)) return [];
  return arr.map((item, i) => [i, item]);
};

// src/dom/NuBuilder.ts
var createTypedElement = (name) => {
  return CfDom.createElement(name);
};
var parseEltString = (str) => {
  const matches = str ? str.match(/([0-9a-zA-Z\-]*)?(#[0-9a-zA-Z\-]*)?((.[0-9a-zA-Z\-]+)*)/) : void 0;
  const results = matches ? matches.slice(1, 4)?.map((elem) => elem ? elem.trim() : void 0) : Array(3).fill(void 0);
  if (results && results[1]) results[1] = results[1].replace(/#*/g, "");
  return matches ? {
    tag: results[0] || void 0,
    id: results[1] || void 0,
    classes: results[2] ? results[2].split(".").filter((elem) => elem.trim()) : void 0
  } : {};
};
var NuBuilder = class {
  /**
   * Creates a new NuBuilder instance.
   * 
   * @param info - A string describing the element in the format 'tag#id.class1.class2'
   * @param props - Optional initial properties for the element
   */
  constructor(info, props) {
    /** Element properties configuration object */
    this.props = {};
    if (props) this.props = props;
    this.info = info;
  }
  /**
   * Finalizes the builder and creates the actual DOM element with all configured properties.
   * 
   * @returns A tuple containing the created element as the first item, followed by any child elements
   * @throws Error if a class name contains a '#' character
   */
  done() {
    let { tag, id, classes = [] } = parseEltString(this.info);
    if (classes?.some((itm) => itm.includes("#"))) {
      throw new Error(
        "Error: Found # in a class name. Did you mean to do elt#id.classes instead of elt.classes#id?"
      );
    }
    if (!tag) tag = "div";
    const elem = createTypedElement(tag);
    if (id) elem.id = id;
    if (classes?.length) classes.forEach((cls) => elem.classList.add(cls));
    return extend(elem, this.props);
  }
  ref() {
    return this.done()[0];
  }
  /**
   * Sets the content of the element.
   * 
   * @param value - Either a string of content or a render function that returns content
   * @returns The builder instance for chaining
   */
  content(value) {
    this.props.contents = value;
    return this;
  }
  /**
   * Sets a single attribute on the element.
   * 
   * @param name - The attribute name
   * @param value - The attribute value
   * @returns The builder instance for chaining
   */
  attr(name, value) {
    var _a;
    (_a = this.props).attrs || (_a.attrs = {});
    this.props.attrs[name] = value.toString();
    return this;
  }
  /**
   * Sets multiple attributes on the element at once.
   * 
   * @param value - An object containing attribute name-value pairs
   * @returns The builder instance for chaining
   */
  attrs(value) {
    this.props.attrs = value;
    return this;
  }
  /**
   * Sets whether the content value should be treated as raw HTML.
   * 
   * @param value - If true, content will not be escaped before setting innerHTML
   * @returns The builder instance for chaining
   */
  raw(value) {
    this.props.raw = value;
    return this;
  }
  misc(obj, value) {
    var _a;
    (_a = this.props).misc || (_a.misc = {});
    if (typeof obj === "object") this.props.misc = obj;
    else this.props.misc[obj] = value;
    return this;
  }
  /**
   * Sets a single CSS style property on the element.
   * 
   * @param prop - The CSS property name
   * @param value - The CSS property value
   * @returns The builder instance for chaining
   */
  style(prop, value) {
    var _a;
    (_a = this.props).style || (_a.style = {});
    this.props.style[prop] = value;
    return this;
  }
  /**
   * Sets multiple CSS style properties on the element at once.
   * 
   * @param value - An object containing style name-value pairs
   * @returns The builder instance for chaining
   */
  styles(value) {
    this.props.style = value ?? {};
    return this;
  }
  /**
   * Attaches an event handler to the element.
   * 
   * @param type - The event type to listen for (e.g., 'click', 'submit')
   * @param handler - The event handler function
   * @returns The builder instance for chaining
   */
  on(type, handler) {
    var _a;
    (_a = this.props).on || (_a.on = {});
    this.props.on[type] = handler;
    return this;
  }
  /**
   * Specifies selectors for elements that should be retrieved after building the element.
   * 
   * @param selectors - A single selector string or an array of selector strings
   * @returns The builder instance for chaining
   */
  gimme(...selectors) {
    var _a;
    (_a = this.props).gimme || (_a.gimme = []);
    this.props.gimme = selectors;
    return this;
  }
  deps(obj) {
    this.props.deps = { ...this.props.deps, ...obj };
    return this;
  }
  /**
   * Unsafely set the html of the object. This is equivalent to calling
   * .content(...).raw(true) and is meant to be used with a templating function
   * like `cf.html`.
   * @param value The content function / string to set.
   * @returns The builder for chaining.
   */
  html(value) {
    return this.content(value).raw(true);
  }
  /**
   * Mount reactive children into a parent element. The children are preserved
   * across re-renders and can be independently reactive.
   * @param children An object whose keys correspond to the `name` attributes 
   * of cf-slot elements in the parent's innerHTML.
   * @returns The builder object for chaining.
   */
  children(children) {
    this.props.children = children;
    return this;
  }
};

// src/dom/nu.ts
if (CfDom.isBrowser()) {
  if ("MutationObserver" in globalThis) initMutationObserver();
  else {
    console.warn(
      "MutationObserver was not found in your browser. Campfire will",
      "not be able to warn you of destructive mutations!"
    );
  }
}
var unwrapDeps = (deps) => {
  const result = {};
  for (const key in deps) {
    const value = deps[key].value;
    if (value instanceof Map) {
      result[key] = Object.fromEntries(value.entries());
    } else {
      result[key] = value.valueOf();
    }
  }
  return result;
};
var isValidRenderFn = (fn) => {
  if (!fn) return false;
  if (typeof fn !== "function") return false;
  return true;
};
var extend = (elt, args = {}) => {
  const { contents, misc, style, on = {}, attrs = {}, raw, gimme = [], deps = {}, children = {} } = args;
  let content = "";
  if (isValidRenderFn(contents)) {
    Object.entries(deps).forEach(([name, dep]) => {
      dep.any((evt) => {
        const res = contents(unwrapDeps(deps), { event: { ...evt, triggeredBy: name }, elt });
        if (res !== void 0) {
          const reactiveChildren = select({ s: "[data-cf-slot]", all: true, from: elt }).map((elt2) => [elt2.getAttribute("data-cf-slot"), elt2]);
          elt.innerHTML = res;
          reactiveChildren.forEach(([slot, ref]) => {
            elt.querySelector(`cf-slot[name='${slot}']`)?.replaceWith(ref);
          });
        }
      });
    });
    const result = contents(unwrapDeps(deps), { elt });
    if (typeof result === "undefined") elt.setAttribute("data-cf-fg-updates", "true");
    else elt.removeAttribute("data-cf-fg-updates");
    content = result || "";
  } else if (typeof contents === "string") {
    content = contents;
  }
  if (content?.trim()) {
    elt.innerHTML = raw ? content : escape(content);
    elt.querySelectorAll("cf-slot[name]").forEach((itm) => {
      const name = itm.getAttribute("name");
      if (!name) return;
      if (name in children) {
        const val = children[name];
        const [child] = Array.isArray(val) ? val : [val];
        if (!child) return;
        itm.replaceWith(child);
        child.setAttribute("data-cf-slot", name);
      }
    });
  }
  const depIds = Object.values(deps).map((dep) => dep.id);
  if (depIds.length) elt.setAttribute("data-cf-reactive", "true");
  else elt.removeAttribute("data-cf-reactive");
  if (misc) Object.assign(elt, misc);
  if (style) Object.assign(elt.style, style);
  Object.entries(on).forEach(([evt, listener]) => CfDom.addElEventListener(elt, evt, listener));
  Object.entries(attrs).forEach(([attr, value]) => elt.setAttribute(attr, String(value)));
  const extras = [];
  for (const selector of gimme) {
    const found = elt.querySelector(selector);
    extras.push(found);
  }
  return [elt, ...extras];
};
var nu = (info = "div", args = {}) => {
  return new NuBuilder(info, args);
};

// src/stores/Store.ts
var storeIds = /* @__PURE__ */ new Set();
var genId = () => "cf-" + Math.random().toString(36).slice(2, 8);
var storeId = () => {
  let id = genId();
  while (storeIds.has(id)) id = genId();
  storeIds.add(id);
  return id;
};
var Store = class {
  /**
   * Creates an instance of Store.
   * @param value - The initial value of the store.
   */
  constructor(value) {
    /**
     * A unique ID for the store, to track nested reactive elements to warn the user.
     * @internal
     */
    this.id = storeId();
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
  *   Supported event types include:
  *   - 'change': Triggered when the store's value is updated via `update()`.
  *   - 'append': For ListStore - Triggered when an item is added to the list.
  *   - 'deletion': For ListStore/MapStore - Triggered when an item is removed.
  *   - 'clear': Triggered when the store is cleared.
  * @param fn A callback function that will be invoked when the specified event occurs.
  *   The function receives a `StoreEvent` object with details about the event.
  * @returns A unique subscriber ID that can be used to unsubscribe the listener.
  */
  on(type, fn) {
    var _a, _b;
    (_a = this._subscriberCounts)[type] ?? (_a[type] = 0);
    (_b = this._subscribers)[type] ?? (_b[type] = {});
    const id = this._subscriberCounts[type]++;
    this._subscribers[type][id] = fn;
    return this._subscriberCounts[type]++;
  }
  /**
       * Subscribes the provided function to all store events.
       * This is a convenience method that registers the function for 'change',
       * 'append', 'clear', and 'deletion' events.
       * 
       * @param fn A callback function that will be called for all store events
       * @returns void
       */
  any(fn) {
    this.on("append", fn);
    this.on("change", fn);
    this.on("clear", fn);
    this.on("deletion", fn);
    this.on("update", fn);
  }
  /**
   * Removes a specific event listener from the store.
   * @param type The type of event from which to unsubscribe.
   * @param id The subscriber ID returned by the `on()` method when the listener was registered.
   * @throws Will throw an error if the subscriber ID is invalid or not found.
   */
  unsubscribe(type, id) {
    delete this._subscribers[type]?.[id];
  }
  /**
   * Updates the store's value and notifies all subscribers.
   * @param value The new value to set for the store.
   * @emits 'change' event with the new value when successfully updated.
   * @note No-op if the store has been disposed via `dispose()`.
   */
  update(value) {
    if (this._dead) return;
    this.value = value;
    this._sendEvent({ type: "update", value });
  }
  /**
   * Sends an event to all subscribers if the store has not been disposed of.
   * @internal
  */
  _sendEvent(event) {
    if (this._dead) return;
    const subs = this._subscribers[event.type];
    if (!subs) return;
    for (const idx in subs) {
      subs[idx](event);
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
  valueOf() {
    return structuredClone(this.value);
  }
};

// src/stores/ListStore.ts
var ListStore = class extends Store {
  constructor(ls) {
    super(ls || []);
  }
  /**
   * Clears all elements from the store.
   * @description Sets the store's value to an empty array and triggers a 'clear' event.
   * @emits 'clear' event.
   */
  clear() {
    this.value = [];
    this._sendEvent({ type: "clear" });
  }
  /**
   * Appends a new element to the end of the list.
   * @param val The value to add to the list.
   * @returns The new length of the list after appending.
   * @emits 'append' event with:
   *   - `value`: The appended item
   *   - `idx`: The index where the item was inserted (length - 1)
   */
  push(val) {
    this.value.push(val);
    this._sendEvent({ type: "append", value: val, idx: this.value.length - 1 });
    return this.value.length;
  }
  /**
   * Removes the element at the specified index.
   * @param idx The index of the element to remove.
   * @throws {RangeError} If the index is out of bounds.
   * @emits 'deletion' event with:
   *   - `value`: The removed item
   *   - `idx`: The index from which the item was removed
   */
  remove(idx) {
    if (idx < 0 || idx >= this.value.length) throw new RangeError("Invalid index.");
    this._sendEvent({
      type: "deletion",
      idx,
      value: this.value.splice(idx, 1)[0]
    });
  }
  /**
   * Retrieves the element at the specified index.
   * @param idx The index of the element to retrieve.
   * @returns The element at the specified index.
   * @throws {RangeError} If the index is out of bounds.
   */
  get(idx) {
    if (idx < 0 || idx >= this.value.length) throw new RangeError("Invalid index.");
    return this.value[idx];
  }
  /**
   * Sets the value of an element at a specific index.
   * @param idx The index of the element to modify.
   * @param value The new value to set at the specified index.
   * @throws {RangeError} If the index is out of bounds.
   * @emits 'change' event with:
   *   - `value`: The new value
   *   - `idx`: The index of the modified element
   */
  set(idx, value) {
    if (idx < 0 || idx >= this.value.length) throw new RangeError("Invalid index.");
    this.value[idx] = value;
    this._sendEvent({ type: "change", value, idx });
  }
  /**
   * Utility accessor to find the length of the store.
   */
  get length() {
    return this.value.length;
  }
};

// src/stores/MapStore.ts
var MapStore = class extends Store {
  /**
   * Constructor for MapStore.
   * Initializes the store with the provided initial key-value pairs.
   * @param init Initial key-value pairs to populate the store.
   */
  constructor(init) {
    super(/* @__PURE__ */ new Map());
    for (const [k, v] of Object.entries(init || {})) {
      this.value.set(k, v);
    }
  }
  /**
   * Sets a value for a specific key in the store.
   * @param key The key to set or update.
   * @param value The value to associate with the key.
   * @emits 'change' event with:
   *   - `key`: The key that was set or updated
   *   - `value`: The new value associated with the key
   */
  set(key, value) {
    this.value.set(key, value);
    this._sendEvent({ key, value, type: "change" });
  }
  /**
   * Removes a key-value pair from the store.
   * @param key The key to remove.
   * @emits 'deletion' event with:
   *   - `key`: The key that was removed
   *   - `value`: The current state of the map after deletion
   */
  remove(key) {
    const value = this.value.get(key);
    if (!value) return;
    this.value.delete(key);
    this._sendEvent({ key, value, type: "deletion" });
  }
  /**
   * Removes all key-value pairs from the store.
   * @emits 'clear' event indicating the store has been emptied.
   */
  clear() {
    this.value = /* @__PURE__ */ new Map();
    this._sendEvent({ type: "clear" });
  }
  /**
   * Applies a transformation function to the value of a specific key.
   * @param key The key whose value will be transformed.
   * @param fn A function that takes the current value and returns a new value.
   * @throws {Error} If the key does not exist in the store.
   * @emits 'change' event with the transformed value (via internal `set` method)
   */
  transform(key, fn) {
    const old = this.value.get(key);
    if (!old) throw new Error(`ERROR: key ${key} does not exist in store!`);
    const transformed = fn(old);
    this.set(key, transformed);
    this._sendEvent({ type: "change", value: transformed, key });
  }
  /**
   * Retrieves the value associated with a specific key.
   * @param key The key to look up.
   * @returns The value associated with the key, or undefined if the key does not exist.
   */
  get(key) {
    return this.value.get(key);
  }
  has(key) {
    return this.value.has(key);
  }
  entries() {
    return this.value.entries();
  }
};

// src/stores/mod.ts
function store(opts) {
  if ("type" in opts) {
    if (opts.type === "list") return new ListStore(opts.value);
    if (opts.type === "map") return new MapStore(opts.value);
  }
  return new Store(opts.value);
}

// src/templating/html.ts
var r = (val, options) => {
  return {
    raw: true,
    contents: Array.isArray(val) ? val.join(options?.joiner ?? " ") : val.toString()
  };
};
var html = (strings, ...values) => {
  const built = [];
  for (let i = 0; i < strings.length; i++) {
    built.push(strings[i] || "");
    const val = values[i];
    if (typeof val !== "undefined" && typeof val !== "object") {
      built.push(escape((val || "").toString()));
    } else {
      built.push(val?.contents || "");
    }
  }
  return built.join("");
};

// src/templating/mustache.ts
var _mustache = (string, data = {}) => {
  const escapeExpr = new RegExp("\\\\({{\\s*" + Object.keys(data).join("|") + "\\s*}})", "gi");
  new RegExp(Object.keys(data).join("|"), "gi");
  return string.replace(new RegExp("(^|[^\\\\]){{\\s*(" + Object.keys(data).join("|") + ")\\s*}}", "gi"), function(_, p1, p2) {
    return `${p1 || ""}${data[p2]}`;
  }).replace(escapeExpr, "$1");
};
var mustache = (string, data = {}, shouldEscape = true) => {
  let escaped = { ...data };
  if (shouldEscape) {
    escaped = Object.fromEntries(Object.entries(escaped).map(([key, value]) => {
      return [key, escape(value)];
    }));
  }
  return _mustache(string, escaped);
};
var template = (str, shouldEscape = true) => {
  return (data) => mustache(str, data, shouldEscape);
};

// src/campfire.ts
var campfire_default = {
  ListStore,
  MapStore,
  Store,
  store,
  nu,
  mustache,
  template,
  escape,
  unescape,
  extend,
  insert,
  empty,
  rm,
  select,
  onload,
  html,
  r,
  seq,
  CfDom,
  callbackify,
  enumerate,
  poll
};
export {
  CfDom,
  ListStore,
  MapStore,
  Store,
  callbackify,
  campfire_default as default,
  empty,
  enumerate,
  escape,
  extend,
  html,
  insert,
  mustache,
  nu,
  onload,
  poll,
  r,
  rm,
  select,
  seq,
  store,
  template,
  unescape
};
//# sourceMappingURL=campfire.js.map
