### campfire: a cozy web framework

**Campfire** is a collection of small utilities to make developing with vanilla
JS easy.

It is kept lightweight on purpose, aiming to provide the bare minimum necessary
to make development easier.

#### Features

- **Small size, zero dependencies**: 5kb compressed, no external dependencies
- **Fluent Builder API**: Create and configure DOM elements with a chainable
  syntax:
  ```js
  const [button] = cf.nu("button#submit")
    .content("Click me")
    .attr("type", "submit")
    .on("click", handleClick)
    .done();
  ```
- **Reactive Data System**: Create reactive stores with automatic UI updates:
  ```js
  // Create different types of stores
  const name = cf.store({ value: "John" });
  const reactiveList = cf.store({ type: "list", value: [1, 2, 3] });
  const reactiveMap = cf.store({ type: "map", value: { key: "value" } });

  // Use stores with reactive elements
  const [div] = cf.nu("div")
    .deps({ name, reactiveList })
    .render(({ name, reactiveList }) =>
      `Hello, ${name}! My favourite numbers are ${reactiveList.join(",")}`
      // escaped by default, re-renders whenever either name
      // or reactiveList change
    )
    .done();

  // Or do your own thing!
  name.on("change", ({ value }) => {
    greet(value);
  });
  ```
- **Enhanced DOM Helpers**: Easy-to-use DOM manipulation utilities:
  ```js
  // Select elements (always returns an array)
  const [button] = cf.select({ s: "#submit-button" });
  const allButtons = cf.select({ s: "button", all: true });

  // Insert elements
  cf.insert([elt], { into: container });
  cf.insert([elt], { into: container, at: "start" });
  cf.insert([elt], { before: sibling });
  ```
- **TypeScript Support**: First-class TypeScript integration with type inference
  for HTML elements

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

With the new children API in v4, you can also use cf-slot elements to create
composable components:

```js
const Card = (title) => {
  const [card] = cf.nu("div.card")
    .html(`
      <h2>${title}</h2>
      <cf-slot name="content"></cf-slot>
    `)
    .done();

  return card;
};

// Usage
const [content] = cf.nu("p").content("Card content").done();
const [wrapper] = cf.nu("div")
  .html(`<cf-slot name="card"></cf-slot>`)
  .children({ card: [Card("My Card")] })
  .done();
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
