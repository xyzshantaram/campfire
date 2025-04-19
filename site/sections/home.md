### campfire: a cozy web framework

**Campfire** helps you write crisp, reactive UI with vanilla JS/TS—no build step, no boilerplate, no
magic.

#### Why Campfire?

- **Tiny (5KB!) footprint** you can read and fit in your head.
- **Fluent builder API** Create and configure DOM elements with a chainable syntax:
  ```ts
  import { nu } from "@campfire/core";
  const [button] = nu("button#go")
      .content("Open!")
      .on("click", () => open("https://campfire.js.org"))
      .done();
  ```
- **Reactive state** that connects to the DOM in just one line:
  ```ts
  import { nu, store } from "@campfire/core";

  const name = store({ value: "Sandy" });
  const [greeting] = nu("div")
      .deps({ name })
      // render is called every time one of the deps changes
      .render(({ name }, { b }) => b.html`Hello <b>${name}</b>!`)
      .done();
  ```
- **Just functions for components:**
  ```ts
  import { nu, store } from "@campfire/core";

  // A name badge component
  const NameBadge = () => {
      const name = store({ value: "" });
      return nu("div.badge")
          .deps({ name })
          .render(({ name }, { b }) => b.content(`Hi, ${name}`));
  };
  ```

#### FAQ

- **Is this a framework?** Nope—just tools that make vanilla JS delightful.

- **How do I make components?** Return an element (or a function that returns one). That's it.

- **Why are escape/unescape so simple?** They’re for basic safety; bring your own sanitizer for
  anything fancy.

[Get campfire today!](/?tab=get)
