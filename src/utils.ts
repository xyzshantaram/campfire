/**
 * a simple HTML sanitizer. Escapes `&`, `<`, `>`, `'`, and `"` by 
 * replacing them with their corresponding HTML escapes 
 * (`&amp;`,`&gt;`, `&lt;`, `&#39;`, and `&quot`).
 * @param str A string to escape.
 * @returns The escaped string.
 * No characters other than the ones mentioned above are escaped.
 * `escape` is only provided for basic protection against XSS and if you need more
 * robust functionality consider using another HTML escaper (such as
 * [he](https://github.com/mathiasbynens/he) or 
 * [sanitize-html](https://github.com/apostrophecms/sanitize-html)).
 */
export const escape = (str: string) => {
    if (!str) return '';

    return str.replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

/**
 * Unescapes the output of escape() by replacing `&amp;`, `&gt;`, `&lt;`,
 * `&#39;`, and `&quot` with `&`, `<`, `>`, `'`, and `"` respectively.
 * @param str A string to unescape.
 * @returns The string, with its character references replaced by the characters it references.
 * No characters other than the ones mentioned above are unescaped.
 */
export const unescape = (str: string) => {
    if (!str) return '';
    const expr = /&(?:amp|lt|gt|quot|#(0+)?39);/g;

    const entities: Record<string, string> = {
        '&amp;': '&',
        '&lt;': '<',
        '&gt;': '>',
        '&quot;': '"',
        '&#39;': "'"
    };

    return str.replace(expr, (entity) => entities[entity] || '\'');
}

export const seq = (...args: number[]) => {
    let start = 0, stop = args[0], step = 1;
    if (typeof args[1] !== 'undefined') {
        start = args[0];
        stop = args[1];
    }

    if (args[2]) step = args[2];
    const result = [];
    for (let i = start; i < stop; i += step) {
        result.push(i);
    }

    return result;
}