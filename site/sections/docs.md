### using campfire 4.0.0

View the [full API reference](/site/docs/modules/campfire.html) for detailed
descriptions of the methods and classes provided by Campfire.

#### quick reference

Campfire provides the following methods and classes:

<details>
<summary><code>nu()</code> - element creation helper</summary>

Creates a new DOM element with a fluent builder API.

##### Create a simple element

```js
const [div] = cf.nu("div")
  .content("Hello World")
  .attr("id", "greeting")
  .done();
```

##### Button with click handler

```js
const [button] = cf.nu("button#submit.primary")
  .content("Submit")
  .attr("type", "submit")
  .on("click", () => console.log("Clicked!"))
  .style("backgroundColor", "blue")
  .done();
```

##### Element with classes

```js
const [card] = cf.nu(".card.shadow") // Creates div by default
  .content("Card content")
  .done();
```

##### Element with reactive template using NuBuilder::html()

```js
const name = cf.store({ value: "John" });
const role = cf.store({ value: "User" });

const [profile] = cf.nu("div.profile")
  .deps({ name, role })
  // render function runs again whenever name/role change
  .render(({ name, role }, { b, first }) =>
    b
      .html`<h2>${name}</h2><p>Role: ${role}</p>`
      .style("color", role === "Admin" ? "red" : "blue")
      // can detect if this is first render or a re-render
      .attr("data-initialized", first ? "initializing" : "updated")
  )
  .done();
```

##### Reactive content with builder pattern

```js
const name = cf.store({ value: "John" });
const admin = cf.store({ value: false });

const [greeting] = cf.nu("h1")
  .deps({ name, admin })
  .render(({ name, admin }, { b }) => b
    .content(`Hello, ${name}!`)
    .style("color", admin ? "red" : "black")
    .attr("title", admin ? "Administrator" : "User");
  )
  .done();
```

##### Direct HTML templating in render function

```js
const name = cf.store({ value: "John" });

const renderGreeting = (name: string) => 
  cf.html`<span>Hello, ${name}</span>`

const [greeting] = cf.nu("h1")
  .deps({ name })
  // b.html() sets innerHTML without escaping
  // use b.content() to do it safely
  .render(({ name }, { b }) => b.html(renderGreeting(name)))
  .done();

// or you can disable escaping with nu(...).raw(true).done()
```

##### Select multiple created elements with `.gimme()`

```js
const [card, title, desc] = cf.nu("div.card")
  .html(`
    <h2 class="title">Card Title</h2>
    <p class="desc">Description</p>
  `)
  .gimme(".title", ".desc") // Variadic - pass any number of selectors
  .done();
```

##### Compose elements with reactive children

```js
const parentData = cf.store({ value: "Parent content" });
const childData = cf.store({ value: "Child content" });
// Parent with slots for child components
const [parent] = cf.nu("section", {
  deps: { data: parentData },
  render: ({ data }) => `
    <h3>${data}</h3>
    <cf-slot name="child"></cf-slot>
  `,
  children: {
    // Child components maintain independent reactivity
    // and are preserved between re-renders of the parent
    child: cf.nu("div")
      .deps({ data: childData })
      .render(({ data }) => data)
      .done(),
  },
}).done();
```

##### Compose with multiple reactive children in a single slot

```js
const items = cf.store({ type: "list", value: ["Item 1", "Item 2", "Item 3"] });

// Create multiple listItem components
const listItems = items.value.map((text) =>
  cf.nu("li")
    .content(text)
    .done()
);

// Create container and insert children
const [container] = cf.nu("div")
  .html`
    <h3>Item List</h3>
    <ul><cf-slot name="items"></cf-slot></ul>
  `
  .children({ listItems })
  .done();
```

##### Clearing attributes and styles conditionally

```js
const disabled = cf.store({ value: false });
const theme = cf.store({ value: "light" });

const themes = {
  dark: { backgroundColor: "#303030", color: "white" },
  light: { backgroundColor: "#f5f4f0", color: "#202020" },
};

const [button] = cf.nu("button")
  .content("Click me")
  .deps({ disabled, theme })
  .render(({ disabled, theme }, { b }) => {
    // Conditionally set or clear attributes (empty string clears)
    b.attr("disabled", disabled ? "disabled" : "");

    b.style("backgroundColor", themes[theme].backgroundColor);
    b.style("color", themes[theme].color);
    return b;
  })
  // assign click listener
  .on("click", () => theme.update(theme.value === "light" ? "dark" : "light"))
  .done();
```

##### Track elements for global access (see track() and untrack() below)

```js
// Create and globally track an element by ID
const [modal] = cf.nu("div.modal")
  .content("Modal Content")
  .track("app-modal") // Register with global tracking system
  .done();

// Later, retrieve the element from anywhere
const elt = cf.tracked("app-modal");
if (elt) {
  elt.style.display = "block";
}

// when done
cf.untrack("app-modal");
```

</details>

<details>
<summary><code>store()</code> - reactive data stores</summary>

Creates reactive data stores to manage state with automatic UI updates.

##### A simple value store

```js
const counter = cf.store({ value: 0 });
counter.update(5); // Sets value to 5
counter.current(); // Gets current value (5)
```

##### Subscribe to changes

```js
counter.on("change", (event) => {
  console.log(`Value changed to ${event.value}`);
});

// Optionally trigger the callback immediately with current value
counter.on("change", (event) => {
  console.log(`Value changed to ${event.value}`);
}, true); // Pass true to call immediately
```

##### List store for arrays

```js
const todoList = cf.store({ type: "list", value: ["Buy milk"] });
todoList.push("Walk dog"); // Adds to the end
todoList.remove(0); // Removes first item
todoList.clear(); // Empties the list
```

##### Map store for key-value data

```js
const user = cf.store({
  type: "map",
  value: { name: "John", age: 30 },
});
user.set("location", "New York"); // Add/update a property
user.delete("age"); // Remove a property
user.clear(); // Empty the map
```

##### Subscribe to all events with any()

```js
todoList.any((event) => {
  console.log(`Event type: ${event.type}`);
});
```

##### Update values with a transform function

```js
const counter = cf.store({ value: 10 });

// Using a value directly
counter.update(20);

// Using a transform function
counter.update((currentValue) => currentValue + 5); // Increments by 5

// More complex transformations
const user = cf.store({
  type: "map",
  value: { name: "John", visits: 0, lastVisit: null },
});

// Update multiple properties based on current value
user.update((current) => ({
  ...current,
  visits: current.visits + 1,
  lastVisit: new Date(),
}));
```

</details>

<details>
<summary><code>select()</code> - element selection</summary>

Selects elements from the DOM with a unified API.

##### Select a single element (returns an array with one item)

```js
const [header] = cf.select({ s: "#page-header" });
// or if you need the ref for passing somewhere:
const header = cf.select({ s: "#page-header", single: true });
```

##### Select from a specific parent element

```js
const [submitButton] = cf.select({
  s: 'button[type="submit"]',
  from: formElement,
});
```

##### Select multiple elements

```js
const paragraphs = cf.select({
  s: "p",
  all: true,
});
```

##### Combining with other operations

```js
cf.select({ s: ".cards", all: true }).forEach((card) => {
  cf.extend(card, { style: { border: "1px solid black" } });
});
```

</details>

<details>
<summary><code>insert()</code> - element insertion</summary>

Inserts elements into the DOM at specific positions.

##### Insert at the end of a container

```js
cf.insert([elt], { into: container });
```

##### Insert at the start of a container

```js
cf.insert([elt], { into: container, at: "start" });
```

##### Insert before (as siblings of) another element

```js
cf.insert([elt], { before: referenceElement });
```

##### Insert multiple elements after (as siblings of) another element

```js
cf.insert([elt1, elt2], { after: referenceElement });
```

##### Create and insert in one step

```js
cf.insert(cf.nu().content("New content").done(), { into: document.body });
```

</details>

<details>
<summary><code>html()</code> - auto-escaping template literal and element builder method</summary>

Creates HTML strings with automatic escaping of interpolated values.

##### Basic usage with automatic escaping

```js
const username = '<script>alert("XSS")</script>';
const greeting = cf.html`Hello, ${username}!`;
// Result: "Hello, &lt;script&gt;alert("XSS")&lt;/script&gt;!"
```

##### Use r() to disable escaping for trusted content

```js
const trusted = cf.r('"<b>Bold text</b>"');
const message = cf.html`Safe message: ${trusted}`;
// Result: "Safe message: "<b>Bold text</b>""
```

##### Use with element creation

```js
const [div] = cf.nu("div")
  .deps({ user })
  // .html() is equivalent to .content().raw(true)
  .html(({ user }) => cf.html`<h1>Title</h1><p>${user}</p>`)
  .done();
```

</details>

<details>
<summary><code>mustache()</code> and <code>template()</code> - reusable and composable string templates</summary>

A lightweight implementation of the Mustache templating system for string
interpolation.

##### Basic variable interpolation (escaped by default)

```js
const result = cf.mustache("Hello, {{ name }}!", { name: "John" });
// Result: "Hello, John!"
```

##### Unescaped HTML content

```js
const result = cf.mustache("Welcome, {{{ userHtml }}}!", {
  userHtml: "<b>Admin</b>",
});
// Result: "Welcome, <b>Admin</b>!"
```

##### Sections - conditionally show content

```js
const result = cf.mustache(
  "{{#loggedIn}}Welcome back!{{/loggedIn}}{{^loggedIn}}Please log in.{{/loggedIn}}",
  { loggedIn: true },
);
// Result: "Welcome back!"
```

##### Array iteration with sections

```js
const result = cf.mustache(
  "<ul>{{#items}}<li>{{name}}</li>{{/items}}</ul>",
  { items: [{ name: "Item 1" }, { name: "Item 2" }] },
);
```

##### Working with primitive arrays

```js
const result = cf.mustache(
  "Numbers: {{#numbers}}{{.}}, {{/numbers}}",
  { numbers: [1, 2, 3] },
);
// Result: "Numbers: 1, 2, 3, "
```

##### Context changes with object values

```js
const result = cf.mustache(
  "{{#user}}Name: {{name}}, Age: {{age}}{{/user}}",
  { user: { name: "John", age: 30 } },
);
// Result: "Name: John, Age: 30"
```

##### Nested sections

```js
const result = cf.mustache(
  "{{#user}}{{name}} {{#admin}}(Admin){{/admin}}{{^admin}}(User){{/admin}}{{/user}}",
  { user: { name: "John", admin: true } },
);
// Result: "John (Admin)"
```

##### Escaping mustache syntax

```js
const result = cf.mustache(
  "This is not a variable: \\{{ name }}",
  { name: "John" },
);
// Result: "This is not a variable: {{ name }}"
```

##### Create reusable template function (compile once, render many times)

```js
// Compile template once
const greet = cf.template("Hello, {{ name }}!");

// Use multiple times with different data
const aliceGreeting = greet({ name: "Alice" }); // "Hello, Alice!"
const bobGreeting = greet({ name: "Bob" }); // "Hello, Bob!"
```

</details>

<details>
<summary><code>extend()</code> - element modification</summary>

Modifies existing DOM elements with the same options as `nu()`.\
New in v4.0.0-rc17: x(), an alias for nu() that uses the same builder API.

##### Basic usage

```js
const element = document.querySelector("#my-element");
cf.extend(element, {
  contents: "New content",
  style: { color: "red", fontSize: "16px" },
});

// or
cf.x(element)
  .content("New content")
  .style({ color: "red", fontSize: "16px" })
  .done();
```

##### With reactive data

```js
const title = cf.store({ value: "Initial Title" });

cf.extend(header, {
  render: ({ title }) => `Page: ${title}`,
  deps: { title },
});

// or

cf.x(header)
  .deps({ title })
  .render(({ title }) => `Page: ${title}`)
  .done();
```

</details>

<details>
<summary><code>empty()</code> and <code>rm()</code> - element cleanup</summary>

Remove elements or their contents from the DOM.

##### Empty an element (removes all children)

```js
cf.empty(container);
```

##### Remove element entirely

```js
cf.rm(element);
```

</details>

<details>
<summary><code>escape()</code> and <code>unescape()</code> - string sanitization</summary>

Simple HTML escaping and unescaping utilities. These are the bare minimum for
inserting text into the DOM - you should look to a different library for more
complex needs.

```js
escape("<script>alert('XSS')</script>"); // "&lt;script&gt;alert('XSS')&lt;/script&gt;"

// Unescape previously escaped strings
unescape("&lt;script&gt;alert('XSS')&lt;/script&gt;"); // "<script>alert('XSS')</script>"
```

</details>

<details>
<summary><code>onload()</code> - DOM ready handler</summary>

Executes code when the DOM is fully loaded.

```js
cf.onload(() => {
  // Initialize application
  const [app] = cf.nu("div#app").done();
  cf.insert(app, { into: document.body });
});
```

</details>

<details>
<summary><code>seq()</code> - sequence generator</summary>

Generates numerical sequences for iteration.

##### Range from 0 to 5 (exclusive)

```js
cf.seq(5); // [0, 1, 2, 3, 4]
```

##### Range from 2 to 7 (exclusive)

```js
cf.seq(2, 7); // [2, 3, 4, 5, 6]
```

##### Range with custom step

```js
cf.seq(1, 10, 2); // [1, 3, 5, 7, 9]
```

##### Creating multiple elements with seq

```js
cf.seq(5).forEach((i) => {
  const [item] = cf.nu("li")
    .content(`Item ${i + 1}`)
    .done();
  cf.insert(item, { into: listElement });
});
```

</details>

<details>
<summary><code>ids()</code> - unique ID generator</summary>

Generates unique IDs with an optional prefix. Useful for creating HTML element
IDs.

##### Basic usage

```js
const generateId = cf.ids(); // Default prefix is 'cf-'
const id1 = generateId(); // e.g. "cf-a1b2c3"

// With custom prefix
const generateButtonId = cf.ids("btn");
const buttonId = generateButtonId(); // e.g. "btn-g7h8i9"
```

##### Creating elements with unique IDs

```js
const idGenerator = cf.ids("form-field");

cf.seq(3).forEach(() => {
  const fieldId = idGenerator();
  const [field, label] = cf.nu("div.form-field")
    .html`
      <label for="${fieldId}">Field</label>
      <input id="${fieldId}" type="text">
    `
    .gimme("label", "input")
    .done();
});
```

##### Connected form elements with unique IDs

```js
const getId = cf.ids("profile");

const LabeledInput = (labelText, type = "text") => {
  const fieldId = getId();
  return cf.nu("div.form-group")
    .html`
      <label for="${fieldId}">${labelText}</label>
      <input id="${fieldId}" type="${type}">
    `
    .done();
};

const [emailGroup] = LabeledInput("Username", "email");
```

</details>

<details>
<summary><code>track()</code>, <code>tracked()</code>, and <code>untrack()</code> - element tracking</summary>

Provides a global registry to track and retrieve elements by custom IDs.

##### Track elements for later use

```js
// Create and track elements
const [header] = cf.nu("header")
  .content("App Header")
  .done();

// Track the element with a custom ID
cf.track("main-header", header);

// Later retrieve the element from anywhere in your code
const retrievedHeader = cf.tracked("main-header");
```

##### Cleanup tracked elements

```js
// Remove tracking when it's no longer needed
function removeComponent() {
  const component = cf.tracked("my-component");
  if (component) {
    cf.rm(component);
    cf.untrack("my-component");
  }
}
```

</details>

<details>
<summary><code>callbackify()</code> - convert Promise-based functions to callback style</summary>

Converts a function that returns a Promise into a function that accepts a
Node-style callback. Especially useful for using async operations in Store event
handlers.

##### Using with Store event handlers

```js
// Store event handlers are expected to be synchronous
// This pattern enables async operations without marking the handler as async

// Define an async operation
const loadEditorAsync = async (postId) => {
  const content = await fetchPostContent(postId);
  const [element, editor] = await createEditor(content);
  return { element, editor };
};

// In a store subscription:
postStore.on("update", (event) => {
  // Launch the async operation properly
  callbackify(loadEditorAsync)(
    (err, result) => {
      if (err) {
        console.error("Failed to load editor:", err);
        return;
      }

      // Handle the result when the async operation completes
      const { element, editor } = result;
      cf.insert(element, { into: container });
      postStore.set("editor", editor);
    },
    event.value,
  );
});
```

##### Integrating with callback-based APIs

```js
// Original async function
const getUser = async (userId) => {
  const response = await fetch(`/api/users/${userId}`);
  return response.json();
};

// Convert to callback style
const getUserCb = cf.callbackify(getUser);

// Use with a callback
getUserCb((err, data) => {
  if (err) {
    console.error("Error:", err);
    return;
  }
  console.log("User data:", data);
}, "12345");
```

##### Error handling with callbackify

```js
const processItems = async (items) => {
  // This might throw errors
  const results = await Promise.all(items.map(processItem));
  return results;
};

// Safe error handling with callbackify
cf.store({ value: [] }).on("update", (event) => {
  cf.callbackify(processItems)(
    (error, results) => {
      if (error) {
        errorStore.update(`Processing failed: ${error.message}`);
        return;
      }
      resultStore.update(results);
    },
    event.value,
  );
});
```

</details>

<details>
<summary><code>poll()</code> - execute a function at regular intervals</summary>

Repeatedly executes a function at specified intervals with proper cleanup.

##### Basic polling example

```js
// Check for updates every 5 seconds, starting 5 seconds from now
const stopPolling = cf.poll(() => checkMessages(user), 5000);

// Or call immediately:
const stopPolling = cf.poll(
  () => checkMessages(user),
  5000,
  /* callNow */ true,
);

// Later, when you want to stop polling:
stopPolling();
```

##### Passing messages out of poll()

You can use stores to pass messages out of the poll function, aside from just
using good old-fashioned closures:

```js
const messages = cf.store({ type: "list", value: [] });

const stopMessagePolling = cf.poll(
  () => {
    fetch("/api/messages")
      .then((response) => response.json())
      .then((data) => messages.update(data));
  },
  10000,
  true,
);

// Cancel polling when component is removed
const cleanup = () => {
  stopMessagePolling();
  messages.dispose();
};
```

</details>
