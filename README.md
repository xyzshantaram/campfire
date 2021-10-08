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

Docs for Campfire are built with [TypeDoc](https://typedoc.org).

The Campfire website uses the [toml](https://www.npmjs.com/package/toml) and
[Marked.js](https://marked.js.org/) libraries under the MIT License to display
its content.

Syntax highlighting on the Campfire website is achieved with
[Microlight](https://asvd.github.io/microlight/). Microlight is a copyright of
[asvd](https://github.com/asvd) and is used under the
[MIT License](https://github.com/asvd/microlight/blob/master/LICENSE).

The Campfire playground uses the [Ace editor](https://github.com/ajaxorg/ace/)
as an embedded editor. The Ace editor is a copyright of Ajax.org B.V. and is
used under the
[3-clause BSD license](https://github.com/ajaxorg/ace/blob/master/LICENSE).
