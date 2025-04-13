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
  .render(({ name, role }, { b }) =>
    b
      .html`<h2>${name}</h2><p>Role: ${role}</p>`
      .style("color", role === "Admin" ? "red" : "blue")
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

##### Using an existing element with nu()

```js
// Get a reference to an existing element
const existing = document.getElementById("my-element");

// Add reactive behavior to it
cf.nu(existing, {
  deps: { message },
  render: ({ message }, { b }) => {
    return b
      .content(`Current message: ${message}`)
      .style("color", message.length > 20 ? "red" : "black");
  },
}).done();
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

</details>

<details>
<summary><code>store()</code> - reactive data stores</summary>

Creates reactive data stores to manage state with automatic UI updates.

##### A simple value store

```js
const counter = cf.store({ value: 0 });
counter.update(5); // Sets value to 5
counter.value; // Gets current value (5)
```

##### Subscribe to changes

```js
counter.on("change", (event) => {
  console.log(`Value changed to ${event.value}`);
});
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

Simple templating system for string interpolation.

##### Basic mustache templating (escaped by default)

```js
const result = cf.mustache("Hello, {{ name }}!", { name: "John" });
// Result: "Hello, John!"
```

##### With HTML content (escaped by default)

```js
const result = cf.mustache("Welcome, {{ user }}!", { user: "<b>Admin</b>" });
// Result: "Welcome, &lt;b&gt;Admin&lt;/b&gt;!"
```

##### Disable escaping for trusted content

```js
const result = cf.mustache(
  "Welcome, {{ userName }}!",
  { userName: "<b>Admin</b>" },
  false, // disable escaping
);
// Result: "<b>Admin</b>"
```

##### Create reusable template function

```js
const greet = cf.template("Hello, {{ name }}!");
const aliceGreeting = greet({ name: "Alice" }); // "Hello, Alice!"
const bobGreeting = greet({ name: "Bob" }); // "Hello, Bob!"
```

</details>

<details>
<summary><code>extend()</code> - element modification</summary>

Modifies existing DOM elements with the same options as <code>nu()</code>.

##### Basic usage

```js
const element = document.querySelector("#my-element");
cf.extend(element, {
  contents: "New content",
  style: { color: "red", fontSize: "16px" },
});
```

##### Add event handlers

```js
cf.extend(element, {
  on: {
    click: () => console.log("Clicked!"),
    mouseover: () => element.style.opacity = "0.8",
  },
});
```

##### With reactive data

```js
const titleStore = cf.store({ value: "Initial Title" });

cf.extend(pageHeader, {
  contents: ({ title }) => `Page: ${title}`,
  deps: { title: titleStore },
});
```

##### Composing elements with extend

```js
const childContent = cf.store({ value: "Child text" });

cf.extend(container, {
  contents: `<h2>Container</h2>
<cf-slot name="childSlot"></cf-slot>`,
  raw: true,
  children: {
    childSlot: cf.nu("span")
      .deps({ childContent })
      .content(({ childContent }) => childContent)
      .ref(),
  },
});
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

<details>
<summary><code>enumerate()</code> - array indexing helper</summary>

Similar to Python's `enumerate()`: returns an array of `[index, value]` tuples
to simplify for...of loops.

##### Basic usage

```js
const items = ["apple", "banana", "cherry"];

for (const [i, item] of cf.enumerate(items)) {
  console.log(`${i}. ${item}`);
}
// Logs:
// 0. apple
// 1. banana
// 2. cherry
```

##### With DOM elements

```js
const listItems = cf.select({ s: "li", all: true });

for (const [index, item] of cf.enumerate(listItems)) {
  // Add numbering or different styling based on position
  cf.extend(item, {
    contents: `${index + 1}. ${item.textContent}`,
    style: {
      backgroundColor: index % 2 === 0 ? "#f0f0f0" : "white",
    },
  });
}
```

</details>
