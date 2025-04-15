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
var generateId = (prefix) => `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
var ids = (prefix = "cf-") => {
  const existing = /* @__PURE__ */ new Set();
  return () => {
    let id = generateId(prefix);
    while (existing.has(id)) id = generateId(prefix);
    existing.add(id);
    return id;
  };
};

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
      built.push(escape((val ?? "").toString()));
    } else {
      built.push(val?.contents || "");
    }
  }
  return built.join("");
};

// src/dom/NuBuilder.ts
var createTypedElement = (name) => {
  return CfDom.createElement(name);
};
var createElemFromInfo = (info) => {
  let { tag, id, classes = [] } = parseEltString(info);
  if (classes?.some((itm) => itm.includes("#"))) {
    throw new Error(
      "Error: Found # in a class name. Did you mean to do elt#id.classes instead of elt.classes#id?"
    );
  }
  if (!tag) tag = "div";
  const elem = createTypedElement(tag);
  if (id) elem.id = id;
  if (classes?.length) classes.forEach((cls) => elem.classList.add(cls));
  return elem;
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
  constructor(elt, props) {
    /** Element properties configuration object */
    this.props = {};
    this.elem = typeof elt === "string" ? createElemFromInfo(elt) : elt;
    this.props = props || {};
  }
  /**
   * Set a class name. Pass on with a falsy value to not apply the class.
   * 
   * @param name - The class name to add/remove
   * @param on - Whether the class should be applied (true) or removed (false/falsy)
   * @returns The builder instance for chaining
   */
  cls(name, on = true) {
    var _a;
    (_a = this.props).classes ?? (_a.classes = {});
    this.props.classes[name] = !!on;
    return this;
  }
  /**
   * Finalizes the builder and creates the actual DOM element with all configured properties.
   * 
   * @returns A tuple containing the created element as the first item, followed by any child elements
   * @throws Error if a class name contains a '#' character
   */
  done() {
    return extend(this.elem, this.props);
  }
  ref() {
    return this.done()[0];
  }
  /**
   * Sets the content of the element as a string, escaped by default.
   * Useful for quick and safe interpolation of strings into DOM content.
   * 
   * @param value - String content to set
   * @returns The builder instance for chaining
   */
  content(value) {
    this.props.contents = value;
    return this;
  }
  /**
   * Sets a render function that will be called to generate content
   * whenever dependencies change.
   * 
   * @param fn - The render function that returns content
   * @returns The builder instance for chaining
   */
  render(fn) {
    this.props.render = fn;
    return this;
  }
  /**
   * Sets a single attribute on the element.
   * 
   * @param name - The attribute name
   * @param value - The attribute value. Set to empty string ('') to clear/reset an attribute.
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
   * @param value - The CSS property value. Set to empty string ('') to clear a style.
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
  html(value, ...args) {
    this.props.raw = true;
    if (typeof value === "string") {
      this.props.contents = value;
    } else if (Array.isArray(value)) {
      this.props.contents = html(value, ...args);
    }
    return this;
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
  /**
   * Mark the element for tracking, so it can be retrieved later by calling
   * `cf.tracked(id)`.
   * @param id The id to track the element by.
   */
  track(id) {
    console.log(id);
    this.props.track = id;
    return this;
  }
};

// src/dom/tracking.ts
var elements = /* @__PURE__ */ new Map();
var track = (id, elt) => {
  elements.set(id, elt);
};
var untrack = (id) => {
  elements.delete(id);
};
var tracked = (id) => {
  return elements.get(id) || null;
};

// src/dom/nu.ts
var unwrap = (deps) => {
  const result = {};
  for (const key in deps) {
    result[key] = deps[key].current();
  }
  return result;
};
var isValidRenderFn = (fn) => {
  if (!fn) return false;
  if (typeof fn !== "function") return false;
  return true;
};
var reconcileClasses = (elt, changed) => {
  return Object.keys(changed).forEach(
    (key) => changed[key] ? elt.classList.add(key) : elt.classList.remove(key)
  );
};
var reconcile = (elt, builder) => {
  const { style = {}, attrs = {}, misc = {}, classes = {} } = builder.props;
  reconcileClasses(elt, classes);
  Object.assign(elt.style, style);
  if (attrs) {
    Object.entries(attrs || {}).forEach(([key, value]) => {
      if (typeof value === "string" && value.length === 0) {
        elt.removeAttribute(key);
      } else if (elt.getAttribute(key) !== String(value)) {
        elt.setAttribute(key, String(value));
      }
    });
  }
  if (misc) Object.assign(elt, misc);
  return elt;
};
var extractReactiveChildren = (elt) => select({ s: "[data-cf-slot]", all: true, from: elt }).map((elt2) => [elt2.getAttribute("data-cf-slot"), elt2]).reduce((prev, [slot, elt2]) => {
  prev[slot] ?? (prev[slot] = []);
  prev[slot].push(elt2);
  return prev;
}, {});
var setupDeps = ({ elt, render: render2, deps }) => {
  Object.entries(deps).forEach(
    ([name, dep]) => dep.any((evt) => {
      const builder = new NuBuilder(elt);
      const res = render2(unwrap(deps), {
        elt,
        event: { ...evt, triggeredBy: name },
        b: builder,
        first: false
      });
      const children = extractReactiveChildren(elt);
      if (typeof res === "string") {
        elt.innerHTML = res;
      } else if (res instanceof NuBuilder) {
        const c = res.props.contents || "";
        elt.innerHTML = res.props.raw ? c : escape(c);
        reconcile(elt, res);
      } else return;
      for (const key in children) {
        const [slot] = select({ s: `cf-slot[name='${key}']`, from: elt });
        if (!slot) continue;
        const list = children[key] || [];
        const fragment = CfDom.createDocumentFragment();
        list.forEach((elt2) => fragment.appendChild(elt2));
        slot.replaceWith(fragment);
      }
    })
  );
};
var setupReactiveChildren = (elt, children) => {
  elt.querySelectorAll("cf-slot[name]").forEach((itm) => {
    const name = itm.getAttribute("name");
    if (!name) return;
    if (Object.hasOwn(children, name)) {
      const val = children[name];
      const replacement = Array.isArray(val) ? CfDom.createDocumentFragment() : val;
      if (Array.isArray(val)) val.forEach((item) => {
        replacement.appendChild(item);
        item.setAttribute("data-cf-slot", name);
      });
      else val.setAttribute("data-cf-slot", name);
      itm.replaceWith(replacement);
    }
  });
};
var extend = (elt, args = {}) => {
  const {
    contents,
    render: render2,
    misc,
    style,
    on = {},
    attrs = {},
    raw: r2,
    classes = {},
    gimme = [],
    deps = {},
    children = {},
    track: track2
  } = args;
  let raw = !!r2;
  if (track2) track(track2, elt);
  reconcileClasses(elt, classes);
  const setHtml = (str) => elt.innerHTML = raw ? str : escape(str);
  if (isValidRenderFn(render2)) {
    setupDeps({ elt, render: render2, deps });
    const result = render2(unwrap(deps), {
      elt,
      b: new NuBuilder(elt),
      first: true
    });
    if (typeof result === "undefined") elt.setAttribute("data-cf-fg-updates", "true");
    else {
      elt.removeAttribute("data-cf-fg-updates");
      if (typeof result === "string") {
        setHtml(result);
      }
      if (result instanceof NuBuilder) {
        raw = !!result.props.raw;
        setHtml(result.props.contents || "");
        reconcile(elt, result);
      }
    }
  } else if (typeof contents === "string") {
    setHtml(contents);
  }
  setupReactiveChildren(elt, children);
  if (misc) Object.assign(elt, misc);
  if (style) Object.assign(elt.style, style);
  Object.entries(on).forEach(([evt, listener]) => CfDom.addElEventListener(elt, evt, listener));
  Object.entries(attrs).forEach(([attr, value]) => {
    const current = elt.getAttribute(attr);
    const str = String(value);
    if (current === str) return;
    if (typeof value === "string" && value.length === 0) elt.removeAttribute(attr);
    else elt.setAttribute(attr, String(value));
  });
  const extras = [];
  for (const selector of gimme) {
    const found = elt.querySelector(selector);
    extras.push(found);
  }
  return [elt, ...extras];
};
var nu = (elt = "div", args = {}) => {
  return new NuBuilder(elt, args);
};

// src/stores/Store.ts
var storeId = ids("cf-store");
var Store = class _Store {
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
   *   - `update`: Triggered when the store's value is updated via `update()`.
   *   - `append`: For `ListStore` - Triggered when an item is added to the list.
   *   - `deletion`: For `ListStore`/`MapStore` - Triggered when an item is removed.
   *   - `change`: For `ListStore`/`MapStore`: Triggered when an item at an index/key
   *     has its value set via the corresponding store's set() method.
   *   - 'clear': Triggered when the store is cleared.
   * @param fn A callback function that will be invoked when the specified event occurs.
   *   The function receives a `StoreEvent` object with details about the event.
   * @returns A unique subscriber ID that can be used to unsubscribe the listener.
   */
  on(type, fn, callNow) {
    var _a, _b;
    (_a = this._subscriberCounts)[type] ?? (_a[type] = 0);
    (_b = this._subscribers)[type] ?? (_b[type] = {});
    const id = this._subscriberCounts[type]++;
    this._subscribers[type][id] = fn;
    if (type === "update" && callNow) fn({ type: "update", value: this.value });
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
  static isUpdater(val) {
    return typeof val === "function";
  }
  update(value) {
    if (this._dead) return null;
    let updated;
    if (_Store.isUpdater(value)) {
      updated = value(this.value);
    } else {
      updated = value;
    }
    this.value = updated;
    this._sendEvent({ type: "update", value: updated });
    return updated;
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
  current() {
    return structuredClone(this.value);
  }
  valueOf() {
    return structuredClone(this.value);
  }
};

// src/stores/ListStore.ts
var ListStore = class extends Store {
  constructor(ls) {
    super(ls || []);
    this.map = (...args) => {
      return this.value.map(...args);
    };
    this.forEach = (...args) => {
      return this.value.forEach(...args);
    };
    this.findIndex = (...args) => {
      return this.value.findIndex(...args);
    };
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
    if (idx < 0) return;
    if (idx >= this.value.length) throw new RangeError("Invalid index.");
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
  [Symbol.iterator]() {
    return this.value[Symbol.iterator]();
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
    super({});
    for (const [k, v] of Object.entries(init || {})) {
      this.value[k] = v;
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
    this.value[key] = value;
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
    const value = this.value[key];
    if (value === null || typeof value === "undefined") return;
    delete this.value[key];
    this._sendEvent({ key, value, type: "deletion" });
  }
  /**
   * Removes all key-value pairs from the store.
   * @emits 'clear' event indicating the store has been emptied.
   */
  clear() {
    this.value = {};
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
    const old = this.value[key];
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
    return structuredClone(this.value[key]);
  }
  has(key) {
    return Object.hasOwn(this.value, key);
  }
  entries() {
    return Object.entries(this.value);
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

// src/templating/mustache.ts
var tokenize = (template2) => {
  const re = /\\?({{{\s*([^}]+)\s*}}}|{{[#^/]?\s*([^}]+)\s*}})/g;
  let index = 0;
  const tokens = [];
  let match = re.exec(template2);
  while (match !== null) {
    const [chunk, mustache2, unsafeKey, key] = match;
    const escaped = chunk.startsWith("\\");
    const tag = chunk.length > 2 ? chunk[2] : null;
    if (index < match.index) {
      tokens.push({ type: "text", value: template2.slice(index, match.index) });
    }
    if (escaped) {
      tokens.push({ type: "text", value: mustache2 });
    } else if (tag === "/") {
      tokens.push({ type: "section-close", key });
    } else if (tag === "#" || tag === "^") {
      tokens.push({ type: "section-open", key: key?.trim(), inverted: tag === "^" });
    } else {
      tokens.push({ type: "var", key: (unsafeKey || key)?.trim(), unescaped: !!unsafeKey });
    }
    index = re.lastIndex;
    match = re.exec(template2);
  }
  if (index < template2.length) {
    tokens.push({ type: "text", value: template2.slice(index) });
  }
  return tokens;
};
function nest(tokens) {
  const root = [];
  const stack = [root];
  for (const token of tokens) {
    if (token.type === "section-open") {
      const section = {
        type: "section",
        key: token.key,
        inverted: token.inverted,
        children: []
      };
      stack.at(-1)?.push(section);
      stack.push(section.children);
    } else if (token.type === "section-close") {
      if (stack.length === 1) throw new Error(`Unexpected closing tag ${token.key}`);
      stack.pop();
    } else {
      stack.at(-1)?.push(token);
    }
  }
  if (stack.length > 1) {
    throw new Error(`Unclosed section(s) found`);
  }
  return root;
}
var compile = (template2) => nest(tokenize(template2));
var render = (tokens, ctx, parentCtx) => tokens.map((token) => {
  switch (token.type) {
    case "text":
      return token.value;
    case "var": {
      if (token.key === "." && "." in ctx) {
        return token.unescaped ? String(ctx["."]) : escape(String(ctx["."]));
      }
      if (!(token.key in ctx)) {
        return token.unescaped ? `{{{ ${token.key} }}}` : `{{ ${token.key} }}`;
      }
      const val = String(ctx[token.key]);
      return token.unescaped ? val : escape(val);
    }
    case "section": {
      const v = ctx[token.key];
      let visible = !!v;
      if (token.inverted) {
        visible = v === null || v === false || typeof v === "undefined" || Array.isArray(v) && v.length === 0;
      }
      if (!visible) return "";
      if (token.inverted) return render(token.children, ctx, parentCtx);
      if (Array.isArray(v)) return v.map(
        (item) => render(token.children, typeof item === "object" ? item : { ".": item }, ctx)
      ).join("");
      else if (typeof v === "object" && v !== null)
        return render(token.children, v, ctx);
      else
        return render(token.children, ctx, parentCtx);
    }
  }
}).join("");
var mustache = (template2, ctx) => {
  return render(compile(template2), ctx);
};
var template = (template2) => {
  const compiled = compile(template2);
  return (ctx) => render(compiled, ctx);
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
  poll,
  ids,
  track,
  tracked,
  untrack
};
export {
  CfDom,
  ListStore,
  MapStore,
  Store,
  callbackify,
  campfire_default as default,
  empty,
  escape,
  extend,
  html,
  ids,
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
  track,
  tracked,
  unescape,
  untrack
};
//# sourceMappingURL=campfire.js.map
