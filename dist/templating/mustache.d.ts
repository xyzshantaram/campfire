/**
 * Renders a mustache template with the provided context data.
 *
 * @param template - The template string to render
 * @param ctx - The context object containing data for rendering
 * @returns The rendered string result
 *
 * @example
 * ```js
 * const result = mustache("Hello, {{ name }}!", { name: "World" });
 * // result: "Hello, World!"
 * ```
 *
 * @example Using sections
 * ```js
 * const result = mustache(
 *   "{{#show}}Visible{{/show}} {{^hide}}Also Visible{{/hide}}",
 *   { show: true, hide: false }
 * );
 * // result: "Visible Also Visible"
 * ```
 *
 * @example Using array iteration
 * ```js
 * const result = mustache(
 *   "Items: {{#items}}{{name}}{{/items}}",
 *   { items: [{ name: "one" }, { name: "two" }] }
 * );
 * // result: "Items: onetwo"
 * ```
 */
export declare const mustache: <T extends Record<string, any> = Record<string, any>>(template: string, ctx: T) => string;
/**
 * Creates a reusable template function from a mustache template string.
 *
 * @param template - The template string to compile
 * @returns A function that accepts a context object and returns the rendered string
 *
 * @example
 * ```js
 * const greet = template("Hello, {{ name }}!");
 * const result1 = greet({ name: "Alice" }); // "Hello, Alice!"
 * const result2 = greet({ name: "Bob" });   // "Hello, Bob!"
 * ```
 */
export declare const template: <T extends Record<string, any> = Record<string, any>>(template: string) => (ctx: T) => string;
