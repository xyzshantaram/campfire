# Campfire.js Changelog

## 4.0.0-rc17

- Added x() method for updating elements in an idiomatic way.

## 4.0.0-rc16

- Stores now use a hybrid cloning approach and freeze values. They try to clone primitives and simple objects/arrays but
  fall back to copying references otherwise.

## 4.0.0-rc15

- Add `ids()` generator function
- Allow passing an array with multiple sibling reactive children to .children() and have them all be stably mounted to
  the parent in the slot.
- add .track() system to NuBuilder - can now call .track(id) on an element being built and get it back later with
  cf.tracked(id).
- Store::update() now optionally accepts a function to transform a store's existing value.
- Store::value is now protected - use .current() to get the value.
- Render functions now receive a boolean `first` argument in the `opts` parameter, so they can conditionally change
  their output depending on if the component is mounting or just re-rendering

## 4.0.0-rc14

- Added new `render()` method to NuBuilder for more flexible reactive content generation:
  - Render functions can return either strings or builder instances
  - Automatic reconciliation of styles, attributes, and properties during re-renders
  - Improved property clearing with empty string values for styles and attributes
- Can now use `nu(existingElement, props)` to add reactive behavior to existing elements
- Added NuBuilder::html overload for it to be used as a string templating function
- remove enumerate() - TIL Array::entries() exists
- Enhanced mustache templating system with:
  - Support for triple braces `{{{ var }}}` for unescaped HTML content
  - section functionality (`{{#section}}content{{/section}}`) for conditional rendering
  - inverted sections (`{{^section}}content when false{{/section}}`)
  - array iteration with automatic context switching
  - support for nested sections
- Add NuBuilder::cls

## 4.0.0-rc13

- Added enumerate() function, exported callbackify and poll (lol)

## 4.0.0-rc12

- Added callbackify function to make doing async ops inside stores easier.
- Added poll() function.

## 4.0.0-rc11

- Added CfDom, a DOM shim so campfire can be used in server environments etc. Also makes testing easier.

## 4.0.0-rc10

- 'change' events are now fired only for MapStore and ListStore - this is so whole-value replacements are possible for
  these types. Store&lt;T&gt; now therefore fires a 'update' event when .update() is called.
- Store .on() and related functionality is now strongly typed.

## 4.0.0-rc9

- select now optionally accepts a `single: true` arg to only return a single element
- Added NuBuilder::ref() to return the element directly

## 4.0.0-rc8

- Both insert() and children() now accept either a single HTMLElement or HTMLElement[], providing greater flexibility
  when working with DOM elements.
- Fixed insert() validation to properly handle { into: element, at: 'start' } case.

## 4.0.0-rc7

- Make .children() accept HTMLElement[] instead of HTMLElement so you can directly pass the output of nu() into
  .children().

## 4.0.0-rc6

- Added `.html()` method to NuBuilder to make building elements slightly more ergonomic
- Made `.gimme()` be a variadic function
- Added functionality to preserve reactive children to extend() / NuBuilder. This should greatly improve composability
  of elements.

## 4.0.0-rc5

`cf.insert()` now accepts `HTMLElement[]` instead of a single element, to make it easier to use with `cf.nu`.

## 4.0.0-rc4

- Retire CJS versions of modules

## 4.0.0-rc3 (Release Candidate 3)

- Fix mis-exported module file

## 4.0.0-rc2 (Release Candidate 2)

This release includes substantial architectural improvements, better TypeScript integration, and modern tooling updates.

### Breaking Changes

- **Module System Overhaul**:
  - Converted to ES Modules (ESM) by default
  - Changed package.json `type` to `"module"`
  - Updated import/export paths to use `.ts` extensions

- **File Structure Reorganization**:
  - Moved functionality into separate modules:
    - `dom/`: Contains DOM manipulation utilities
    - `stores/`: Contains reactive data store implementations
    - `templating/`: Contains templating utilities
    - `utils.ts`: Common utility functions

- **API Changes**:
  - Removed shortened aliases (`c`, `s`, `a`, etc.) from `ElementProperties` interface
  - Removed `selectAll` function from exports
  - Changed `nu()` to return a builder object that must be finalized with `.done()`
  - Changed `select()` API:
    - Now always accepts an options object: `{ selector, from?, all? }`
    - Always returns an Array, even when selecting a single element
    - Use `all: true` to select multiple elements (replaces `selectAll`)
  - Changed positioning properties in `insert()` function:
    - `prependTo` is now `{ into: element, at: "start" }`
    - `appendTo` is now `{ into: element }`

- **Build System**:
  - Updated esbuild configuration
  - Changed output file structure and paths
  - Updated bundle target directories

### New Features

- **Enhanced Reactivity System**:
  - Improved store implementation with better typing
  - Added `store()` factory function for creating different store types
  - Added `any()` method to subscribe to all store events
  - Added better event handling with typed events

- **Fluent Builder API**:
  - Introduced chainable `NuBuilder` for creating elements:
    ```javascript
    // Old API
    const [button] = nu("button#submit", {
        contents: "Click me",
        attrs: { type: "submit" },
    });

    // New Fluent API
    const [button] = nu("button#submit")
        .content("Click me")
        .attr("type", "submit")
        .on("click", handleClick)
        .done();
    ```

- **Improved Type Safety**:
  - Added generic type parameters to better type store contents
  - Improved TypeScript integration with more precise types
  - Added inference for HTML element types based on tag strings

- **Reactive Content**:
  - Added support for reactive content rendering with dependencies:
    ```javascript
    const nameStore = cf.store({ value: "John" });

    const [div] = nu("div", {
        contents: (data) => `Hello, ${data.name}!`,
        deps: { name: nameStore },
    }).done();

    // Updates automatically when store changes
    nameStore.update("Alice");
    ```

- **DOM Manipulation Tools**:
  - Improved element insertion with clearer API
  - Added warning system for reactive element nesting issues
  - Added better event handling in element creation

- **Testing Framework**:
  - Switched from Jest to Mocha
  - Added Chai and Chai-DOM for assertions
  - Added Sinon for spies and mocks

### Minor Improvements

- Added template literal array joining in `html` template strings
- Added custom joiner option in `r()` for array content
- Improved error messages for common mistakes
- Added element disposal and cleanup for reactive elements
- Added better defensive programming in element manipulation
- Enhanced DOM observer for reactive rendering warnings

### Development Changes

- Updated all dependencies to latest versions
- Switched from Jest to Mocha for testing
- Added more comprehensive tests
- Improved build process
- Added TypeScript 5.7 support
- Added better documentation

### Migration Guide

1. **Update Imports**:
   ```javascript
   // Old
   import { html, nu } from "campfire.js";

   // New
   import { html, nu } from "campfire.js";
   // No change to external imports, but internal structure is different
   ```

2. **Update Element Creation**:
   ```javascript
   // Old
   const [element] = nu("div", {
       contents: "Hello",
       attrs: { id: "greeting" },
   });

   // New
   const [element] = nu("div")
       .content("Hello")
       .attr("id", "greeting")
       .done();
   ```

3. **Update Stores**:
   ```javascript
   // Old
   const store = new Store("value");

   // New
   const store = cf.store({ value: "value" });
   // or
   const listStore = cf.store({ type: "list", value: [1, 2, 3] });
   const mapStore = cf.store({ type: "map", value: { key: "value" } });
   ```

4. **Update Element Selection**:
   ```javascript
   // Old
   const element = select("#my-element");
   const elements = selectAll(".my-elements");

   // New
   const [element] = select({ selector: "#my-element" });
   const elements = select({ selector: ".my-elements", all: true });
   ```

5. **Update Element Insertion**:
   ```javascript
   // Old
   insert(element, { prependTo: container });
   insert(element, { appendTo: container });

   // New
   insert(element, { into: container, at: "start" });
   insert(element, { into: container });
   ```
