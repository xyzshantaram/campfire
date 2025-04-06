export interface RawHtml {
    raw: true;
    contents: string;
}
/**
 * Options for r()
 */
export interface RawHtmlOptions {
    joiner?: string;
}
/**
 * Prevent values from being escaped by html``.
 * @param val Any value.
 * @returns An object that tells html`` to not escape `val` while building the HTML string.
 */
export declare const r: (val: any, options?: RawHtmlOptions) => RawHtml;
/**
 * Creates an HTML string with automatic escaping of interpolated values.
 * Use r() to prevent escaping specific values.
 * @param strings The constant portions of the template string.
 * @param values The dynamic values to be interpolated (automatically escaped unless wrapped with r()).
 * @returns The built HTML string with all values properly escaped.
 * @example
 * ```
 * const unsafe = `oops <script>alert(1)</script>`;
 * testing.innerHTML = html`foo bar baz ${unsafe}`; // Values are automatically escaped
 * const safeHtml = html`<div>${r("<b>Bold</b>")}</div>`; // Using r() to prevent escaping
 * ```
 */
export declare const html: (strings: TemplateStringsArray, ...values: (string | number | RawHtml)[]) => string;
