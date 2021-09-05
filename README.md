# campfire

a cozy web framework

<p align='center'>
    <img src='campfire.png' alt='campfire logo' width=256 height=256>
</p>

Campfire provides small utilities to make developing your app easy. It does not
impose on you a way to build your application or create unnecessary
abstractions - you only get the bare minimum to make developing with the DOM
easy.

### Features

- Small size (<1kb gzipped!)
- No unnecessary boilerplate, just one import away
- Work directly with DOM elements
- Reactive data using a publish-subscribe model
- String templating functionality using mustaches

### Usage

ES6 imports only, on purpose.

```js
import cf from "campfire.min.js";
```

### API (subject to change)

#### Methods

#### `cf.nu` - element creation helper

```js
let count = 0;
const btn = cf.nu("button#id.class1.class2", {
  innerHTML: "I have not been clicked.",
  attrs: {
    // DOM attributes
    "data-an-attribute": 42,
  },
  on: {
    // event handlers, assigned using addEventListener
    "click": function (e) {
      this.innerHTML = `I have been clicked ${++count} times.`;
    },
  },
  style: {
    // Uses property names as specified in CSSStyleDeclaration.
    background: "#007cdf",
    borderRadius: "0.25em",
    margin: "0.5rem",
    color: "#f5f4f0",
    transitionDuration: "0.2s",
    border: "2px solid black",
  }, // styles
  misc: {
    // miscellaneous properties
    type: "button",
  },
});
```

The first argument is a string describing the element. It contains the tag name,
id, and a number of classes. All of these are optional, you can omit this
option, any one part of it (i.e., the tag, id, or classes), or supply a falsy
value to default to a blank div.

The second argument to `nu()` is an object containing 0 or more of the following
properties:

- `attrs`: Aliased to `a`. Should contain a set of attributes that will be set
  on the element using setAttribute.
- `innerHTML`: Aliased to `i`. Should contain the inner HTML string for the
  element.
- `on`: An Object describing various event listeners for the created element.
- `style`: Aliased to `s`. An Object with CSS styling. Property names are the
  same as the ones in a CSSStyleDeclaration object.
- `misc`: Aliased to `m`. Should contain a set of miscellaneous properties that
  will be set on the created object.

Both arguments are optional. If `nu()` is called without any arguments, a blank
\<div> is created.

#### `cf.mustache` - string templating with mustaches

```js
const result = cf.mustache("Welcome to Mars, {{ name }}.", { name: "user" }); // result is now "Welcome to Mars, user."
```

One-off string templating. The first argument should be a string containing
mustaches and the second argument is data to substitute for the templates.

#### `cf.template` - templating helper

```js
const marsTemplate = cf.template("Welcome to Mars, {{ name }}."); // returns a function
const result = marsTemplate({ name: "user" }); // result is now "Welcome to Mars, user."
```

A function that wraps `mustache()` to return a partial application. Pass in an
object with templating data to the result of `template()` and it returns the
result of the templating operation.

#### `cf.Store` - reactive data store

```js
const store = new cf.Store(0); // initial value
const question = store.on("set", (val) => { // this function is called every time the value is changed
  if (val == 42) {
    console.log("That's the right answer!");
  } else {
    console.log("Hmmm. Try again.");
  }
}, false);
/* The last argument specifies whether or not the callback should be called right now with the current value of the store. */

store.update(3);
store.update(42);
store.update(69);

store.unsubscribe("set", question);
store.dispose();
store.update(42); // does nothing since the store is disposed of
```

The Store class is a simple reactive data store. It has the following methods
defined:

- the constructor: The constructor takes the initial value of the store as an
  argument and creates a new store.
- `on(type: string, fn: Subscriber, callNow: boolean = false)`: The `on()`
  method is modeled on the browser's addEventListener() in functionality. It
  adds a new subscriber to the store. Every time the Store sends an event of the
  type `type`, the subscriber function is called. If callNow is a truthy value,
  the subscribing function is called once with the current value of the store.
  The method's return value can be passed to `unsubscribe()` to prevent the
  subscribing function from being called further.
- `unsubscribe(type: string, idx: number)`: The unsubscribe method unsubscribes
  the subscriber with the given `idx` for the supplied type. `idx` should be a
  number that was returned by `on()`.
- `refresh()`: The `refresh()` method sends a "refresh" event to all listeners,
  useful for global updates. The subscribing function will be passed the current
  value of the store.
- `update(value)`: The `update()` method sets the value of the store to `value`
  and sends an "update" event to all listeners. The subscribing function will be
  passed the current value of the store.
- `dispose()`: The `dispose()` method prevents any further events from being
  sent by the store.

#### `cf.ListStore` - Reactive list store

```js
const homework = new cf.ListStore([]); // create a new store

const list = document.body.appendChild(cf.nu("div"));
const getIdx = (elem) => parseInt(elem.getAttribute("data-idx")); // helper function

homework.on("refresh", function () {
  if (homework.length == 0) list.innerHTML = "yay! no items!";
}, false);

homework.on("push", function (val) {
  if (homework.length === 1) list.innerHTML = "";
  list.appendChild(cf.nu("div", {
    innerHTML: val.value,
    attrs: { "data-idx": homework.length - 1 },
    on: { click: (e) => homework.remove(getIdx(e.target)) },
    style: { cursor: "pointer" },
  }));
});

homework.on("remove", function (val) {
  Array.from(list.querySelectorAll(`div:nth-child(n+${val.idx + 1})`)).forEach(
    (elem, i) => {
      elem.setAttribute("data-idx", getIdx(elem) - 1);
    },
  );
  list.removeChild(list.querySelector(`div:nth-child(${val.idx + 1})`));
  homework.refresh();
});

homework.push("English assignment");
homework.push("Math assignment");
homework.push("French assignment");

homework.setAt(1, "Math test");

console.log(
  "Homework:",
  [homework.get(0), homework.get(1), homework.get(2)].join(", "),
);

homework.setAt(3, "test"); // errors out
homework.setAt(-1, "test 2"); // errors out
```

The ListStore is similar to a regular Store, but adds the following methods:

- `clear()`: sets the value of the store to an empty list. This sends an
  "update" event
- `push(value)`: Adds a new element to the end of the list. This sends a "push"
  event with the properties:
  - `idx`: the index of the newly added element.
  - `value`: the value of the added element.
- `remove(idx: number)`: Deletes the element at the idx_th_ index from the list.
  This sends a "remove" event with the following properties:
  - `idx`: the index of the newly added element.
  - `value`: the value of the added element.
- `get(idx: number)`: the `get()` method returns the value of the element at the
  supplied `idx`.
- `setAt(idx: number, value)`: The `setAt()` method is a method to set the value
  at the supplied `idx` to `value`. ListStore also has getter called `length`
  which returns the current length of the list.

### Acknowledgements

Icon made by [Those Icons](https://www.flaticon.com/authors/those-icons) from
[Flaticon](https://www.flaticon.com/)
