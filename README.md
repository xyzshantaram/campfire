# campfire

A cozy web framework for modern JavaScript.

<p align='center'>
    <img src='campfire.png' alt='campfire logo' width=256 height=256>
</p>

Campfire helps you build maintainable, reactive web UI without a build step, without piles of
dependencies, and without magic.

---

## Features

- **Chainable builder API** for expressive and readable DOM markup
- **Reactive data stores** for tightly-coupled UI and state—no frameworks, no global hacks
- **Fluent HTML templating** with autoescaping by default and simple pattern-matching
- **TypeScript-first**: type inference for all APIs
- **Near-zero dependencies**: ~5kb compressed, works in browsers & on the server
- **Composable by default**: create reusable components as regular JS/TS functions
- **Collection helpers**: ListStore and MapStore for ergonomic reactive collections
- **Clean DOM helpers** for selection, insertion, mutation, and more

---

## Install

Direct ES module (browser or Deno):

```js
import { nu, Store } from "https://esm.sh/campfire.js";
```

With npm:

```sh
pnpm i campfire.js
```

Then:

```js
import cf from "campfire.js";
```

---

## Quick Start

### Create a DOM element with the builder API

```js
const [button] = cf.nu("button#search")
    .content("Search")
    .attr("type", "submit")
    .on("click", searchHandler)
    .done();
```

### Reactive UI state

```js
const count = cf.store({ value: 0 });

const [counter] = cf.nu("div.counter")
    .deps({ count })
    .render(({ count }, { b }) => b.html`Clicked ${count} times!`)
    .done();

count.update((n) => n + 1);
```

### Simple, composable components

```js
const NameBadge = () => {
    const name = cf.store({ value: "" });
    const elt = cf.nu("div.badge")
        .deps({ name })
        .render(({ name }, { b, first }) => b.content(first ? "" : `Hi, ${name}!`))
        .done();
    return [name, elt];
};

const [name, badge] = NameBadge();
insert(badge, { into: document.body });
name.update("you");
```

---

## API at a Glance

| Function          | Purpose                                    |
| ----------------- | ------------------------------------------ |
| `nu()`            | Create elements with chainable builder API |
| `store()`         | Create reactive values, arrays, or maps    |
| `select()`        | Select DOM elements (array or single)      |
| `insert()`        | Insert element(s) anywhere in the DOM      |
| `html``           | Safe HTML templating (escaped by default)  |
| `mustache()`      | Render Mustache-style string templates     |
| `extend()`, `x()` | Modify or enhance any DOM element          |
| `empty()`, `rm()` | Empty or remove elements                   |
| `seq()`, `ids()`  | Utilities for number ranges and unique IDs |

For **full, annotated examples and advanced usage**, see the
[quick reference](https://xyzshantaram.github.io/campfire/?tab=docs).

---

## Contributing

Pull requests and issues are welcome!

---

## License and Acknowledgements

[MIT License](LICENSE)

See [ACKNOWLEDGEMENTS.md](ACKNOWLEDGEMENTS.md) for full license, icon, and upstream credit
information.

---

## Donate

If Campfire makes your project better, you can support maintenance and new features
[here](https://shantaram.xyz/contact/donate.html).
