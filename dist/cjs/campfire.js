var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/campfire.ts
var campfire_exports = {};
__export(campfire_exports, {
  ListStore: () => ListStore,
  MapStore: () => MapStore,
  Store: () => Store,
  default: () => campfire_default,
  empty: () => empty,
  escape: () => escape,
  extend: () => extend,
  html: () => html,
  insert: () => insert,
  mustache: () => mustache,
  nu: () => nu,
  onload: () => onload,
  r: () => r,
  rm: () => rm,
  select: () => select,
  seq: () => seq,
  store: () => store,
  template: () => template,
  unescape: () => unescape
});
module.exports = __toCommonJS(campfire_exports);

// src/dom/mod.ts
var insert = (elem, where) => {
  const keys = Object.keys(where);
  if (keys.length !== 1) {
    throw new Error("Too many or too few positions specified.");
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
  ref.insertAdjacentElement(position, elem);
  return elem;
};
var onload = (cb) => globalThis.addEventListener("DOMContentLoaded", cb);
var select = ({ selector, all, from }) => {
  from != null ? from : from = document;
  if (all) {
    return Array.from(from.querySelectorAll(selector));
  } else {
    return [from.querySelector(selector)];
  }
};
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
  const observer = new MutationObserver((mutations) => {
    var _a, _b, _c;
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (!(node instanceof HTMLElement)) continue;
        const parent = mutation.target;
        if (!parent.hasAttribute("data-cf-deps")) continue;
        if (parent.hasAttribute("data-cf-fg-updates")) continue;
        const reactiveChildren = (_b = (_a = node.querySelectorAll) == null ? void 0 : _a.call(node, "[data-cf-deps]").length) != null ? _b : 0;
        if (!((_c = node.hasAttribute) == null ? void 0 : _c.call(node, "data-cf-deps")) && reactiveChildren === 0) continue;
        console.warn(`[Campfire] \u26A0\uFE0F A reactive node ${fmtNode(node)} was inserted into a reactive container ${fmtNode(parent)} This may cause it to be wiped on re-render.`);
      }
    }
  });
  if (!document.body.hasAttribute("cf-disable-mo"))
    observer.observe(document.body, { childList: true, subtree: true });
};

// src/dom/NuBuilder.ts
var createTypedElement = (name) => {
  return document.createElement(name);
};
var parseEltString = (str) => {
  var _a;
  const matches = str ? str.match(/([0-9a-zA-Z\-]*)?(#[0-9a-zA-Z\-]*)?((.[0-9a-zA-Z\-]+)*)/) : void 0;
  const results = matches ? (_a = matches.slice(1, 4)) == null ? void 0 : _a.map((elem) => elem ? elem.trim() : void 0) : Array(3).fill(void 0);
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
    if (classes == null ? void 0 : classes.some((itm) => itm.includes("#"))) {
      throw new Error(
        "Error: Found # in a class name. Did you mean to do elt#id.classes instead of elt.classes#id?"
      );
    }
    if (!tag) tag = "div";
    const elem = createTypedElement(tag);
    if (id) elem.id = id;
    classes.forEach((cls) => elem.classList.add(cls));
    return extend(elem, this.props);
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
    this.props.style = value;
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
  gimme(selectors) {
    var _a;
    (_a = this.props).gimme || (_a.gimme = []);
    if (Array.isArray(selectors)) this.props.gimme = selectors;
    else this.props.gimme.push(selectors);
    return this;
  }
  deps(obj) {
    this.props.deps = obj;
    return this;
  }
};

// src/dom/nu.ts
if ("MutationObserver" in globalThis) initMutationObserver();
else {
  console.warn(
    "MutationObserver was not found in your browser. Campfire will",
    "not be able to warn you of destructive mutations!"
  );
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
  let { contents, misc, style, on = {}, attrs = {}, raw, gimme = [], deps = {} } = args;
  let content = "";
  if (isValidRenderFn(contents)) {
    Object.entries(deps).forEach(([name, dep]) => {
      dep.any((evt) => {
        const res = contents(unwrapDeps(deps), { event: __spreadProps(__spreadValues({}, evt), { triggeredBy: name }), elt });
        if (res !== void 0) elt.innerHTML = res;
      });
    });
    const result = contents(unwrapDeps(deps), { elt });
    if (typeof result === "undefined") elt.setAttribute("data-cf-fg-updates", "true");
    else elt.removeAttribute("data-cf-fg-updates");
    content = result || "";
  } else if (typeof contents === "string") {
    content = contents;
  }
  if (content == null ? void 0 : content.trim()) {
    elt.innerHTML = raw ? content : escape(content);
  }
  const depIds = Object.values(deps).map((dep) => dep.id);
  if (depIds.length) elt.setAttribute("data-cf-reactive", "true");
  else elt.removeAttribute("data-cf-reactive");
  if (misc) Object.assign(elt, misc);
  if (style) Object.assign(elt.style, style);
  Object.entries(on).forEach(([evt, listener]) => elt.addEventListener(evt, listener));
  Object.entries(attrs).forEach(([attr, value]) => elt.setAttribute(attr, value));
  const extras = [];
  for (const selector of gimme) {
    const found = elt.querySelector(selector);
    extras.push(found);
  }
  return [elt, ...extras];
};
var nu = (info, args) => {
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
    if (typeof value !== "undefined" && value !== null) this.value = value;
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
  * @param callNow Determines whether the callback should be immediately invoked 
  *   with the current store value. Only applies to 'change' event type.
  * @returns A unique subscriber ID that can be used to unsubscribe the listener.
  */
  on(type, fn, callNow = false) {
    var _a, _b;
    this._subscriberCounts[type] = this._subscriberCounts[type] || 0;
    (_b = (_a = this._subscribers)[type]) != null ? _b : _a[type] = {};
    this._subscribers[type][this._subscriberCounts[type]] = fn;
    if (callNow && !["push", "remove", "mutation", "setAt"].includes(type)) {
      fn({ type: "change", value: this.value });
    }
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
  }
  /**
   * Removes a specific event listener from the store.
   * @param type The type of event from which to unsubscribe.
   * @param id The subscriber ID returned by the `on()` method when the listener was registered.
   * @throws Will throw an error if the subscriber ID is invalid or not found.
   */
  unsubscribe(type, id) {
    var _a;
    (_a = this._subscribers[type]) == null ? true : delete _a[id];
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
    this._sendEvent({ type: "change", value });
  }
  /**
   * Sends an event to all subscribers if the store has not been disposed of.
   * @internal
  */
  _sendEvent(event) {
    if (this._dead) return;
    this._subscribers[event.type] = this._subscribers[event.type] || {};
    const subs = this._subscribers[event.type];
    if (!subs) return;
    for (const idx in Object.keys(subs)) {
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
    super(ls);
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
   * A no-operation method for MapStore to maintain base Store compatibility.
   * Does not perform any action.
   * @deprecated
   */
  update() {
  }
  /**
   * Removes a key-value pair from the store.
   * @param key The key to remove.
   * @emits 'deletion' event with:
   *   - `key`: The key that was removed
   *   - `value`: The current state of the map after deletion
   */
  remove(key) {
    this.value.delete(key);
    this._sendEvent({ key, value: this.value, type: "deletion" });
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
  var _a;
  return {
    raw: true,
    contents: Array.isArray(val) ? val.join((_a = options == null ? void 0 : options.joiner) != null ? _a : " ") : val.toString()
  };
};
var html = (strings, ...values) => {
  const built = [];
  for (let i = 0; i < strings.length; i++) {
    built.push(strings[i] || "");
    let val = values[i];
    if (typeof val !== "undefined" && typeof val !== "object") {
      built.push(escape((val || "").toString()));
    } else {
      built.push((val == null ? void 0 : val.contents) || "");
    }
  }
  return built.join("");
};

// src/templating/mustache.ts
var _mustache = (string, data = {}) => {
  const escapeExpr = new RegExp("\\\\({{\\s*" + Object.keys(data).join("|") + "\\s*}})", "gi");
  new RegExp(Object.keys(data).join("|"), "gi");
  return string.replace(new RegExp("(^|[^\\\\]){{\\s*(" + Object.keys(data).join("|") + ")\\s*}}", "gi"), function(matched, p1, p2) {
    return `${p1 || ""}${data[p2]}`;
  }).replace(escapeExpr, "$1");
};
var mustache = (string, data = {}, shouldEscape = true) => {
  let escaped = __spreadValues({}, data);
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
  seq
};
