var __defProp = Object.defineProperty;
var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
var __export = (target, all) => {
  __markAsModule(target);
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// dist/testing/campfire.js
__export(exports, {
  ListStore: () => ListStore,
  Store: () => Store,
  default: () => campfire_default,
  escape: () => escape,
  mustache: () => mustache,
  nu: () => nu,
  template: () => template,
  unescape: () => unescape
});
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
var nu = (eltInfo, args = {}) => {
  let { innerHTML, i, misc, m, style, s, on: handlers, attrs, a } = args;
  let { tag, id, classes } = _parseEltString(eltInfo);
  if (!tag)
    tag = "div";
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
var Store = class {
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
    if (callNow && !["push", "remove", "mutation", "setAt"].includes(type)) {
      fn(this.value);
    }
    return this._subscriberCounts[type]++;
  }
  unsubscribe(type, id) {
    delete this._subscribers[type][id];
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
    this._subscribers = {};
    this._subscriberCounts = {};
  }
};
var ListStore = class extends Store {
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
    this._sendEvent("remove", {
      value: this.value.splice(idx, 1)[0],
      idx
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
      idx
    });
  }
  get length() {
    return this.value.length;
  }
};
var mustache = (string, data = {}) => {
  return Object.entries(data).reduce((res, [key, value]) => {
    const mainRe = new RegExp(`(^|[^\\\\]){{\\s*${key}\\s*}}`, "g");
    const escapeRe = new RegExp(`\\\\({{\\s*${key}\\s*}})`, "g");
    return res.replace(mainRe, `$1${value || ""}`).replace(escapeRe, "$1");
  }, string);
};
var template = (str) => {
  return (data) => mustache(str, data);
};
var escape = (str) => {
  if (!str)
    return "";
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
};
var unescape = (str) => {
  if (!str)
    return "";
  const expr = /(?<!\\)&(?:amp|lt|gt|quot|#(0+)?(?:39|96));/g;
  const entities = {
    "&amp;": "&",
    "&lt;": "<",
    "&gt;": ">",
    "&quot;": '"',
    "&#39;": "'"
  };
  return str.replace(expr, (entity) => entities[entity] || "'");
};
var campfire_default = {
  Store,
  ListStore,
  nu,
  mustache,
  template,
  escape,
  unescape
};
