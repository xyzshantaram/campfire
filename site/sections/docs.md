### using campfire 4.0.0

View the [full API reference](/site/docs/modules/campfire.html) for detailed
descriptions of the methods and classes provided by Campfire.

#### quick reference

Campfire provides the following methods and classes:

<details>
<summary><code>nu()</code> - element creation helper</summary>

Creates a new DOM element with a fluent builder API.

```js
// Creating a simple element
const [div] = cf.nu("div")
    .content("Hello World")
    .attr("id", "greeting")
    .done();

// Creating a button with click handler
const [button] = cf.nu("button#submit.primary")
    .content("Submit")
    .attr("type", "submit")
    .on("click", () => console.log("Clicked!"))
    .style("backgroundColor", "blue")
    .done();

// Element with classes
const [card] = cf.nu(".card.shadow") // Creates div by default
    .content("Card content")
    .done();

// Element with reactive content
const name = cf.store({ value: "John" });

const [greeting] = cf.nu("h1")
    .content(({ name }) => `Hello, ${name}!`)
    .deps({ name })
    .done();

// Multiple element selection with gimme
const [card, title, desc] = cf.nu("div.card")
    .html(`
    <h2 class="title">Card Title</h2>
    <p class="desc">Description</p>
  `)
    .gimme(".title", ".desc") // Variadic - pass any number of selectors
    .done();

// Composing elements with reactive children
const parentData = cf.store({ value: "Parent content" });
const childData = cf.store({ value: "Child content" });

// Create a parent with slots for child components
const [parent] = cf.nu("section")
    .deps({ data: parentData })
    .html(({ data }) => `
    <h3>${data}</h3>
    <cf-slot name="child"></cf-slot>
  `)
    .children({
        // Child components maintain independent reactivity
        child: cf.nu("div")
            .deps({ data: childData })
            .content(({ data }) => data)
            .done(),
    })
    .done();

// Updates when store changes
name.update("Alice");
```

</details>

<details>
<summary><code>store()</code> - reactive data stores</summary>

Creates reactive data stores to manage state with automatic UI updates.

```js
// Simple value store
const counter = cf.store({ value: 0 });
counter.update(5); // Sets value to 5
counter.value; // Gets current value (5)

// Subscribe to changes
counter.subscribe((event) => {
    console.log(`Value changed to ${event.value}`);
});

// List store for arrays
const todoList = cf.store({ type: "list", value: ["Buy milk"] });
todoList.push("Walk dog"); // Adds to the end
todoList.remove(0); // Removes first item
todoList.clear(); // Empties the list

// Map store for key-value data
const user = cf.store({
    type: "map",
    value: { name: "John", age: 30 },
});
user.set("location", "New York"); // Add/update a property
user.delete("age"); // Remove a property
user.clear(); // Empty the map

// Subscribe to all events with any()
todoList.any((event) => {
    console.log(`Event type: ${event.type}`);
});
```

</details>

<details>
<summary><code>select()</code> - element selection</summary>

Selects elements from the DOM with a unified API.

```js
// Select a single element (returns an array with one item)
const [header] = cf.select({ s: "#page-header" });

// Select from a specific parent element
const [submitButton] = cf.select({
    s: 'button[type="submit"]',
    from: formElement,
});

// Select multiple elements
const paragraphs = cf.select({
    s: "p",
    all: true,
});

// Combining with other operations
cf.select({ s: ".cards", all: true }).forEach((card) => {
    cf.extend(card, { style: { border: "1px solid black" } });
});
```

</details>

<details>
<summary><code>insert()</code> - element insertion</summary>

Inserts elements into the DOM at specific positions.

```js
// Insert at the end of a container
cf.insert([elt], { into: container });

// Insert at the start of a container
cf.insert([elt], { into: container, at: "start" });

// Insert before (as siblings of) another element
cf.insert([elt], { before: referenceElement });

// Insert multiple elements after (as siblings of) another element
cf.insert([elt1, elt2], { after: referenceElement });

// Create and insert in one step
cf.insert(cf.nu().content("New content").done(), { into: document.body });
```

</details>

<details>
<summary><code>html()</code> - auto-escaping template literal and element builder method</summary>

Creates HTML strings with automatic escaping of interpolated values.

```js
// Basic usage with automatic escaping
const username = '<script>alert("XSS")</script>';
const greeting = cf.html`Hello, ${username}!`;
// Result: "Hello, &lt;script&gt;alert("XSS")&lt;/script&gt;!"

// Use r() to disable escaping for trusted content
const trusted = cf.r('"<b>Bold text</b>"');
const message = cf.html`Safe message: ${trusted}`;
// Result: "Safe message: "<b>Bold text</b>""

// Use with element creation
const [div] = cf.nu("div")
    // .html() is equivalent to .content().raw(true)
    .html(cf.html`<h1>Title</h1><p>${userName}</p>`)
    .done();
```

</details>

<details>
<summary><code>mustache()</code> and <code>template()</code> - reusable and composable string templates</summary>

Simple templating system for string interpolation.

```js
// Basic mustache templating (escaped by default)
const result = cf.mustache("Hello, {{ name }}!", { name: "John" });
// Result: "Hello, John!"

// With HTML content (escaped by default)
const result = cf.mustache("Welcome, {{ user }}!", { user: "<b>Admin</b>" });
// Result: "Welcome, &lt;b&gt;Admin&lt;/b&gt;!"

// Disable escaping for trusted content
const result = cf.mustache(
    "Welcome, {{ userName }}!",
    { userName: "<b>Admin</b>" },
    false, // disable escaping
);
// Result: "<b>Admin</b>"

// Create reusable template function
const greet = cf.template("Hello, {{ name }}!");
const aliceGreeting = greet({ name: "Alice" }); // "Hello, Alice!"
const bobGreeting = greet({ name: "Bob" }); // "Hello, Bob!"
```

</details>

<details>
<summary><code>extend()</code> - element modification</summary>

Modifies existing DOM elements with the same options as <code>nu()</code>.

```js
// Basic usage
const element = document.querySelector("#my-element");
cf.extend(element, {
    contents: "New content",
    style: { color: "red", fontSize: "16px" },
});

// Add event handlers
cf.extend(element, {
    on: {
        click: () => console.log("Clicked!"),
        mouseover: () => element.style.opacity = "0.8",
    },
});

// With reactive data
const titleStore = cf.store({ value: "Initial Title" });

cf.extend(pageHeader, {
    contents: ({ title }) => `Page: ${title}`,
    deps: { title: titleStore },
});

// Composing elements with extend
const childContent = cf.store({ value: "Child text" });

cf.extend(container, {
    contents: `<h2>Container</h2>
<cf-slot name="childSlot"></cf-slot>`,
    raw: true,
    children: {
        childSlot: cf.nu("span")
            .deps({ childContent })
            .content(({ childContent }) => childContent)
            .done(),
    },
});
```

</details>

<details>
<summary><code>empty()</code> and <code>rm()</code> - element cleanup</summary>

Remove elements or their contents from the DOM.

```js
// Empty an element (removes all children)
cf.empty(container);

// Remove element entirely
cf.rm(element);
```

</details>

<details>
<summary><code>escape()</code> and <code>unescape()</code> - string sanitization</summary>
Simple HTML escaping and unescaping utilities. These are the bare minimum for inserting text into the DOM - you should look to a different library for more complex needs.

```js
// Escape HTML characters
escape("<script>alert('XSS')</script>"); // "&lt;script&gt;alert(&#39;XSS&#39;)&lt;/script&gt;"

// Unescape previously escaped strings
unescape("&lt;script&gt;alert(&#39;XSS&#39;)&lt;/script&gt;"); // "<script>alert('XSS')</script>"
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

```js
// Range from 0 to 5 (exclusive)
cf.seq(5); // [0, 1, 2, 3, 4]

// Range from 2 to 7 (exclusive)
cf.seq(2, 7); // [2, 3, 4, 5, 6]

// Range with custom step
cf.seq(1, 10, 2); // [1, 3, 5, 7, 9]

// Creating multiple elements with seq
cf.seq(5).forEach((i) => {
    const [item] = cf.nu("li")
        .content(`Item ${i + 1}`)
        .done();
    cf.insert(item, { into: listElement });
});
```

</details>
