var __defProp = Object.defineProperty;
var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
var __export = (target, all) => {
  __markAsModule(target);
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// dist/testing/campfire.js
__export(exports, {
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
var r = (val, options) => {
  var _a;
  return {
    raw: true,
    contents: Array.isArray(val) ? val.join((_a = options === null || options === void 0 ? void 0 : options.joiner) !== null && _a !== void 0 ? _a : " ") : val.toString()
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
      built.push((val === null || val === void 0 ? void 0 : val.contents) || "");
    }
  }
  return built.join("");
};
var _parseEltString = (str) => {
  var _a;
  const matches = str ? str.match(/([0-9a-zA-Z\-]*)?(#[0-9a-zA-Z\-]*)?((.[0-9a-zA-Z\-]+)*)/) : void 0;
  const results = matches ? (_a = matches.slice(1, 4)) === null || _a === void 0 ? void 0 : _a.map((elem) => elem ? elem.trim() : void 0) : Array(3).fill(void 0);
  if (results && results[1])
    results[1] = results[1].replace(/#*/g, "");
  return matches ? {
    tag: results[0] || void 0,
    id: results[1] || void 0,
    classes: results[2] ? results[2].split(".").filter((elem) => elem.trim()) : void 0
  } : {};
};
var extend = (elem, args = {}) => {
  let { contents, c, misc, m, style, s, on, attrs, a, raw, g, gimme } = args;
  let result = [elem];
  contents = contents || c || "";
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
var nu = (eltInfo, args = {}) => {
  let { tag, id, classes } = _parseEltString(eltInfo);
  if (classes === null || classes === void 0 ? void 0 : classes.some((itm) => itm.includes("#"))) {
    throw new Error("Error: Found # in a class name. Did you mean to do elt#id.classes instead of elt.classes#id?");
  }
  if (!tag)
    tag = "div";
  let elem = document.createElement(tag);
  if (id)
    elem.id = id;
  (classes || []).forEach((cls) => elem.classList.add(cls));
  return extend(elem, args);
};
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
var Store = class {
  constructor(value) {
    this._subscribers = {};
    this._subscriberCounts = {};
    this._dead = false;
    if (value)
      this.value = value;
  }
  on(type, fn, callNow = false) {
    var _a;
    var _b;
    this._subscriberCounts[type] = this._subscriberCounts[type] || 0;
    (_a = (_b = this._subscribers)[type]) !== null && _a !== void 0 ? _a : _b[type] = {};
    this._subscribers[type][this._subscriberCounts[type]] = fn;
    if (callNow && !["push", "remove", "mutation", "setAt"].includes(type)) {
      fn({ type: "change", value: this.value });
    }
    return this._subscriberCounts[type]++;
  }
  unsubscribe(type, id) {
    var _a;
    (_a = this._subscribers[type]) === null || _a === void 0 ? true : delete _a[id];
  }
  update(value) {
    if (this._dead)
      return;
    this.value = value;
    this._sendEvent({ type: "change", value });
  }
  _sendEvent(event) {
    if (this._dead)
      return;
    this._subscribers[event.type] = this._subscribers[event.type] || {};
    const subs = this._subscribers[event.type];
    if (!subs)
      return;
    for (const idx in Object.keys(subs)) {
      subs[idx](event);
    }
  }
  dispose() {
    this._dead = true;
    this._subscribers = {};
    this._subscriberCounts = {};
  }
};
var ListStore = class extends Store {
  constructor(ls) {
    super(ls);
  }
  clear() {
    this.value = [];
    this._sendEvent({ type: "clear" });
  }
  push(val) {
    this.value.push(val);
    this._sendEvent({ type: "append", value: val, idx: this.value.length - 1 });
    return this.value.length;
  }
  remove(idx) {
    if (idx < 0 || idx >= this.value.length)
      throw new RangeError("Invalid index.");
    this._sendEvent({
      type: "deletion",
      idx,
      value: this.value.splice(idx, 1)[0]
    });
  }
  get(idx) {
    if (idx < 0 || idx >= this.value.length)
      throw new RangeError("Invalid index.");
    return this.value[idx];
  }
  set(idx, value) {
    if (idx < 0 || idx >= this.value.length)
      throw new RangeError("Invalid index.");
    this.value[idx] = value;
    this._sendEvent({ type: "change", value, idx });
  }
  get length() {
    return this.value.length;
  }
};
var MapStore = class extends Store {
  constructor(init) {
    super(new Map());
    for (const [k, v] of Object.entries(init || {})) {
      this.value.set(k, v);
    }
  }
  set(key, value) {
    this.value.set(key, value);
    this._sendEvent({ key, value, type: "change" });
  }
  update() {
  }
  remove(key) {
    this.value.delete(key);
    this._sendEvent({ key, value: this.value, type: "deletion" });
  }
  clear() {
    this.value = new Map();
    this._sendEvent({ type: "clear" });
  }
  transform(key, fn) {
    const old = this.value.get(key);
    if (!old)
      throw new Error(`ERROR: key ${key} does not exist in store!`);
    const transformed = fn(old);
    this.set(key, transformed);
    this._sendEvent({ type: "change", value: transformed, key });
  }
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
var _mustache = (string, data = {}) => {
  const escapeExpr = new RegExp("\\\\({{\\s*" + Object.keys(data).join("|") + "\\s*}})", "gi");
  new RegExp(Object.keys(data).join("|"), "gi");
  return string.replace(new RegExp("(^|[^\\\\]){{\\s*(" + Object.keys(data).join("|") + ")\\s*}}", "gi"), function(matched, p1, p2) {
    return `${p1 || ""}${data[p2]}`;
  }).replace(escapeExpr, "$1");
};
var mustache = (string, data = {}, shouldEscape = true) => {
  let escaped = Object.assign({}, data);
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
var escape = (str) => {
  if (!str)
    return "";
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
};
var unescape = (str) => {
  if (!str)
    return "";
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
var onload = (cb) => globalThis.addEventListener("DOMContentLoaded", cb);
var select = ({ selector, all, from }) => {
  from !== null && from !== void 0 ? from : from = document;
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
var seq = (...args) => {
  let start = 0, stop = args[0], step = 1;
  if (typeof args[1] !== "undefined") {
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
var store = (opts) => {
  if ("type" in opts) {
    if (opts.type === "list")
      return new ListStore(opts.value);
    else if (opts.type === "map")
      return new MapStore(opts.value);
  }
  return new Store(opts.value);
};
var campfire_default = {
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
