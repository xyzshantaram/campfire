import { escape } from '../utils.ts';

export interface RawHtml {
    raw: true,
    contents: string
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
        contents: Array.isArray(val) ?
            val.join(options?.joiner ?? ' ') :
            val.toString()
    }
}

/**
 * 
 * @param strings The constant portions of the template string.
 * @param values The templated values.
 * @returns The built HTML.
 * @example
 * ```
 * const unsafe = `oops <script>alert(1)</script>`;
 * testing.innerHTML = html`foo bar baz ${unsafe}`;
 * console.assert(testing === "foo bar baz oops%20%3Cscript%3Ealert%281%29%3C/script%3E");
 * ```
 */
export const html = (strings: TemplateStringsArray, ...values: (string | number | RawHtml)[]) => {
    const built = [];
    for (let i = 0; i < strings.length; i++) {
        built.push(strings[i] || '');
        let val = values[i];
        if (typeof val !== 'undefined' && typeof val !== 'object') {
            built.push(escape((val || '').toString()));
        }
        else {
            built.push(val?.contents || '');
        }
    }
    return built.join('');
}
