# campfire

a cozy web framework

<p align='center'>
    <img src='campfire.png' alt='campfire logo' width=256 height=256>
</p>

Campfire provides small utilities to simplify building web applications with
vanilla JavaScript. It does not impose on you a way to build your application or
create unnecessary abstractions - you only get the bare minimum to make
developing with the DOM easy.

Turn your dumpster fire into a Campfire today!

### Features

- Small size (~1kb gzipped!)
- No unnecessary boilerplate, Campfire is just one import away
- Work directly with DOM elements
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

### Reference

#### Methods

#### `nu` - element creation helper

[Code example](examples/nu.js)

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
`<div>` is created.

#### `mustache` - string templating with mustaches

```js
const result = cf.mustache("Welcome to Mars, {{ name }}.", { name: "user" }); // "Welcome to Mars, user."
```

One-off string templating. The first argument should be a string containing
mustaches and the second argument is data to substitute for the templates.

#### `template` - templating helper

```js
const marsTemplate = cf.template("Welcome to Mars, {{ name }}."); // returns a function
const result = marsTemplate({ name: "user" }); // "Welcome to Mars, user."
```

A function that wraps `mustache()` to return a partial application. Pass in an
object with templating data to the result of `template()` and it returns the
result of the templating operation.

#### `escape` - HTML entity escaper

A function to perform basic escaping of HTML entities. `escape` will replace
`&`, `<`, `>`, `'`, and `"` with their corresponding HTML escapes (`&amp;`,
`&gt;`, `&lt;`, `&#39;`, and `&quot`).

#### `unescape` - character reference unescaper

A function to perform the reverse operation of `escape`. It will convert
character references into their corresponding characters.

#### Classes

[Code example](examples/Store.js)

#### `Store` - reactive data store

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

#### `ListStore` - Reactive list store

[Code example](examples/ListStore.js)

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
