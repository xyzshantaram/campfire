# campfire

a cozy web framework

<p align='center'>
    <img src='campfire.png' alt='campfire logo' width=256 height=256>
</p>

Campfire is a collection of small utilities to make developing with vanilla JS
easy.

It is kept lightweight on purpose, aiming to provide the bare minimum necessary
to make development easier.

### Features

- Small size (~2kb gzipped!)
- Easy to get started with (just one import statement away!)
- Reactive data using a publish-subscribe model
- String templating functionality using mustaches

### Building

```sh
$ npm run build
```

Then you can use `dist/campfire.min.js` and `dist/campfire.d.ts`.

### Usage

You can use it directly in a JS file intended for the browser, either from
[esm.sh](https://esm.sh/campfire.js) or
[unpkg](https://unpkg.com/campfire.js@latest/dist/campfire.esm.min.js), or
self-host it:

```js
import cf from "https://esm.sh/campfire.js";
```

or install it with npm (`npm i campfire.js`) and use it in your existing
workflow:

```js
const cf = require("campfire.js");
```

All the methods and classes are also exported, so you can do named imports as
usual:

```js
const { nu, ListStore } = require("campfire.js");
```

or

```js
import { ListStore, nu } from "https://esm.sh/campfire.js";
```

### Quick reference

The API reference can be found
[here](https://xyzshantaram.github.io/campfire/?tab=docs).

#### Methods

#### `nu` - element creation helper

```js
// A button that keeps track of how many times it's been clicked
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

#### `mustache` - string templating with mustaches

```js
const result = cf.mustache("Welcome to Mars, {{ name }}.", { name: "user" }); // "Welcome to Mars, user."
```

#### `template` - templating helper

```js
const marsTemplate = cf.template("Welcome to Mars, {{ name }}."); // returns a function
const result = marsTemplate({ name: "user" }); // "Welcome to Mars, user."
```

#### `escape` - HTML entity escaper

A function to perform basic escaping of HTML entities. `escape` will replace
`&`, `<`, `>`, `'`, and `"` with their corresponding HTML escapes (`&amp;`,
`&gt;`, `&lt;`, `&#39;`, and `&quot`).

#### `unescape` - character reference unescaper

A function to perform the reverse operation of `escape`. It will convert
character references into their corresponding characters.

#### Classes

#### `Store` - reactive data store

```js
// What is six by nine?

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

store.unsubscribe("set", question);
store.dispose();
store.update(42); // does nothing since the store is disposed of
```

#### `ListStore` - Reactive list store

```js
// An app to keep track of your homework

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
```

### Contributing

Fork the repo and make a pull request, or open an issue on the issues page.

### Donate

If you like using Campfire, you can donate to Campfire development using one of
the means listed [here](https://shantaram.xyz/contact/donate.html).

### Acknowledgements

Icon made by [Those Icons](https://www.flaticon.com/authors/those-icons) from
[Flaticon](https://www.flaticon.com/)

The [unescape](https://github.com/lodash/lodash/blob/master/unescape.js)
function and
[unit tests for it](https://github.com/lodash/lodash/blob/master/test/unescape.js)
and [escape](https://github.com/lodash/lodash/blob/master/test/escape.test.js)
are derived from lodash under the terms of the MIT License. Code in lodash is a
copyright of JS Foundation and other contributors <https://js.foundation/>.
Lodash itself is based on Underscore.js, copyright Jeremy Ashkenas,
DocumentCloud and Investigative Reporters & Editors <http://underscorejs.org/>

Docs for Campfire are built with TSDoc.

Syntax highlighting on the Campfire website is achieved with
[Microlight](https://asvd.github.io/microlight/). Microlight is a copyright of
[asvd](https://github.com/asvd) and is used under the
[MIT License](https://github.com/asvd/microlight/blob/master/LICENSE).