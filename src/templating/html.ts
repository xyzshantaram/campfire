import { escape } from "../utils.ts";

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
export const r = (val: any, options?: RawHtmlOptions): RawHtml => {
    return {
        raw: true,
        contents: Array.isArray(val) ? val.join(options?.joiner ?? " ") : val.toString(),
    };
};

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
export const html = (
    strings: TemplateStringsArray,
    ...values: (string | boolean | number | RawHtml | undefined)[]
): string => {
    const built = [];
    for (let i = 0; i < strings.length; i++) {
        built.push(strings[i] || "");
        const val = values[i];
        if (typeof val !== "undefined" && typeof val !== "object") {
            built.push(escape((val ?? "").toString()));
        } else {
            built.push(val?.contents || "");
        }
    }
    return built.join("");
};
