### using campfire 4.0.0

View the [full API reference](/site/docs/modules/campfire.html) for detailed descriptions of the
methods and classes provided by Campfire.

#### quick reference

Campfire provides the following methods and classes:

<details>
<summary><code>nu()</code> - element creation helper</summary>

Create DOM elements with a readable, chainable builder pattern.

```ts
import cf from "@campfire/core";

const [greeting] = cf.nu("h1")
    .content("Hello, world!")
    .attr("id", "greeting")
    .done();

const name = cf.store({ value: "User" });
const [info] = cf.nu("div.info")
    .deps({ name })
    .render(({ name }, { b }) => b.html`Logged in as: <strong>${name}</strong>`)
    .done();
```

</details>

<details>
<summary><code>store()</code> - reactive data stores</summary>

Store state in a reactive scalar, array, or map.

```ts
import cf from "@campfire/core";

const counter = cf.store({ value: 0 });
counter.update((n) => n + 1);
counter.on("update", (e) => console.log(e.value));

const todos = cf.store({ type: "list", value: ["A"] });
todos.push("B");

const users = cf.store({ type: "map", value: { sid: true } });
users.set("alex", false);
```

</details>

<details>
<summary><code>select()</code> - element selection</summary>

Select DOM elements with a unified API.

```ts
import cf from "@campfire/core";

const [header] = cf.select({ s: "header" });
const buttons = cf.select({ s: "button", all: true });
```

</details>

<details>
<summary><code>insert()</code> - element insertion</summary>

Insert elements anywhere in the DOM.

```ts
import cf from "@campfire/core";

const [greeting] = cf.nu("h1")
    .content("Hello, world!")
    .done();

const info = cf.nu("p")
    .content("This element was generated using Campfire v4")
    .done();

// insert a single HTMLElement...
cf.insert(greeting, { into: document.body });
// or insert the result of nu() directly
cf.insert(info, { after: greeting });
```

</details>

<details>
<summary><code>html()</code> - HTML templating</summary>

Escape content for the DOM and compose structured HTML.

```ts
import cf from "@campfire/core";

const user = "<script>alert('xss')</script>";
const text = cf.html`A message for <b>${user}</b>`; // user is escaped safely
```

</details>

<details>
<summary><code>mustache()</code> & <code>template()</code> - string templates</summary>

```ts
import cf from "@campfire/core";

// Basic interpolation (auto-escaped)
cf.mustache("Hello, {{name}}!", { name: "<b>Alex</b>" }); // "Hello, &lt;b&gt;Alex&lt;/b&gt;!"

// Unescaped HTML (triple braces)
cf.mustache("Raw: {{{html}}}", { html: "<b>bold</b>" }); // "Raw: <b>bold</b>"

// Sections (conditional, loop)
cf.mustache(
    "{{#items}}<li>{{.}}</li>{{/items}}{{^items}}No items{{/items}}",
    { items: ["Red", "Green"] },
); // "<li>Red</li><li>Green</li>"

// Reusable (compiled) templates
const hello = cf.template("Hello, {{who}}!");
hello({ who: "World" }); // "Hello, World!"
hello({ who: "<x>" }); // "Hello, &lt;x&gt;!"
```

</details>

<details>
<summary><code>extend()</code> & <code>x()</code> - element modification</summary>

Modify or enhance any DOM element with props, reactivity, and more. Use the builder for clarity.

```ts
import cf from "@campfire/core";

const header = document.createElement("header");

cf.x(header)
    .content("Page Header")
    .style("fontWeight", "bold")
    .done();
```

</details>

<details>
<summary><code>empty()</code> and <code>rm()</code> - element cleanup</summary>

Clear an element or remove it from the DOM.

```ts
import cf from "@campfire/core";

const header = cf.nu("header").content("foo").ref();
cf.empty(header);
cf.rm(header);
```

</details>

<details>
<summary><code>seq()</code> & <code>ids()</code> - ranges and unique ids</summary>

```ts
import cf from "@campfire/core";

cf.seq(3).forEach((i) => {
    const id = cf.ids("item")();
    cf.nu("div.item").attr("id", id).content(`Item #${i + 1}`).done();
});
```

</details>
