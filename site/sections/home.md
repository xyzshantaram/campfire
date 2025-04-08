### campfire: a cozy web framework

**Campfire** is a collection of small utilities to make developing with vanilla
JS easy.

It is kept lightweight on purpose, aiming to provide the bare minimum necessary
to make development easier.

#### Features

- Small size
- Easy to get started with - just `import` it into your project from
  [unpkg](https://unpkg.com/browse/campfire.js/) or
  [esm.sh](https://esm.sh/campfire.js/). Campfire is on npm as well, so you can
  also add it into your existing application with `npm i campfire.js`!
- Uses vanilla JS wherever possible - no unnecessary DSLs or abstractions!
- Provides an easy-to-understand API for implementing reactive data
- Provides simple helpers for mustache templating

#### FAQs

<details>
<summary>How does it compare to $framework?</summary>

It doesn't. Campfire and $framework have entirely different goals. Campfire is a
library to make writing vanilla JS applications easier, if you don't want the
level of abstraction (or the associated overhead) that comes with $framework.
You can build entire applications with it or add it quickly to an existing
project. You are afforded complete control over your project.

The learning curve is minuscule and the possibilities are endless.

</details>

<details>
<summary>What about WebComponents?</summary>

[lit.dev](https://lit.dev)

</details>

<details>
<summary>How do I create and share reusable components?</summary>

Campfire has no opinion on how you should do this. However, one option is to use
a function that returns functions and stores to let you manipulate the element
(and the created element itself).

```js
// a reactive representation of a name badge
const NameBadge = () => {
  const name = cf.store({ value: "" });

  const [badge] = cf.nu("div")
    .content(({ name }) => `Hello! My name is ${name}`)
    .deps({ name })
    .done();

  return [badge, name];
};
```

</details>

<details>
<summary>Why are escape and unescape so basic?</summary>

`escape` and `unescape` are intended as basic HTML sanitizers mainly for setting
element contents, etc. You are encouraged to use a different HTML sanitizer if
you need more functionality.

- [he](https://github.com/mathiasbynens/he)
- [html-sanitize](https://github.com/apostrophecms/sanitize-html)

</details>

[Get campfire today!](/?tab=get)
