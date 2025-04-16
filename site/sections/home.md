### campfire: a cozy web framework

**Campfire** helps you write crisp, reactive UI with vanilla JS/TS—no build step, no boilerplate, no magic.

#### Why Campfire?

- **Tiny (5KB!) footprint** you can read and fit in your head.
- **Fluent builder API** Create and configure DOM elements with a chainable syntax:
  ```js
  const [button] = cf.nu("button#go")
      .content("Open!")
      .on("click", launch)
      .done();
  ```
- **Reactive state** that connects to the DOM in just one line:
  ```js
  const name = cf.store({ value: "Sandy" });
  const [greeting] = cf.nu("div")
      .deps({ name })
      .render(({ name }, { b }) => b.html`Hello <b>${name}</b>!`)
      .done();
  ```
- **Just functions for components:**
  ```js
  // A name badge component
  const NameBadge = () => {
      const name = cf.store({ value: "" });
      return cf.nu("div.badge")
          .deps({ name })
          .render(({ name }, { b }) => b.content(`Hi, ${name}`));
  };
  ```

#### FAQ

- **Is this a framework?** Nope—just tools that make vanilla JS delightful.

- **How do I make components?** Return an element (or a function that returns one). That's it.

- **Why are escape/unescape so simple?** They’re for basic safety; bring your own sanitizer for anything fancy.

[Get campfire today!](/?tab=get)
