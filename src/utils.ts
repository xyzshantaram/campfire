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
export const escape = (str: string): string => {
    if (!str) return "";

    return str.replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
};

/**
 * Unescapes the output of escape() by replacing `&amp;`, `&gt;`, `&lt;`,
 * `&#39;`, and `&quot` with `&`, `<`, `>`, `'`, and `"` respectively.
 * @param str A string to unescape.
 * @returns The string, with its character references replaced by the characters it references.
 * No characters other than the ones mentioned above are unescaped.
 */
export const unescape = (str: string): string => {
    if (!str) return "";
    const expr = /&(?:amp|lt|gt|quot|#(0+)?39);/g;

    const entities: Record<string, string> = {
        "&amp;": "&",
        "&lt;": "<",
        "&gt;": ">",
        "&quot;": '"',
        "&#39;": "'",
    };

    return str.replace(expr, (entity) => entities[entity] || "'");
};

/**
 * Generates a range of numbers as an array, similar to Python's `range()`.
 *
 * @example
 * ```ts
 * import { seq } from "@/campfire.ts";
 * seq(3) // [0, 1, 2]
 * seq(1, 5) // [1, 2, 3, 4]
 * seq(0, 10, 2) // [0, 2, 4, 6, 8]
 * ```
 *
 * @param startOrStop Either the stop (if single argument) or start of the range
 * @param stop If provided, the end (exclusive) of the range
 * @param step Optional step to increment by, default is 1
 * @returns Array of numbers forming the range
 */
export const seq = (...args: number[]): Array<number> => {
    let start = 0, stop = args[0], step = 1;
    if (typeof args[1] !== "undefined") {
        start = args[0];
        stop = args[1];
    }

    if (args[2]) step = args[2];
    const result = [];
    for (let i = start; i < stop; i += step) {
        result.push(i);
    }

    return result;
};

/**
 * Represents a Node-style callback function that receives either an error or a result.
 * @template U The type of the successful result
 * @template E The type of the error
 */
export type Callback<U, E> = (err: E | null, res: U | null) => void;

/**
 * Represents a function that accepts a callback as its first argument, followed by any other arguments.
 * @template T The types of the function arguments (excluding the callback)
 * @template U The type of the successful result passed to the callback
 * @template E The type of the error that might be passed to the callback
 */
export type Callbackified<T extends any[], U, E> = (
    cb: Callback<U, E>,
    ...args: T
) => void;

/**
 * Converts a function that returns a Promise into a function that accepts a Node-style callback.
 *
 * This utility helps integrate Promise-based code with callback-based APIs, including
 * using async operations in synchronous contexts like Store event handlers.
 *
 * @template T The types of the function arguments
 * @template U The type of the value that the Promise resolves to (default: unknown)
 * @template E The type of the error that might be caught (default: any)
 *
 * @param fn A function that returns a Promise
 * @returns A function that accepts a Node-style callback as its first argument
 *
 * @example
 * ```
 * // Using with Store event handlers (which expect synchronous functions)
 * // Instead of this (which uses async in a non-async context):
 * myStore.on('update', async (event) => {
 *   const data = await fetchDataFromApi(event.value);
 *   // Do something with data...
 * });
 *
 * // Do this instead:
 * const handleUpdateAsync = async (event) => {
 *   const data = await fetchDataFromApi(event.value);
 *   // Do something with data...
 * };
 *
 * myStore.on('update', (event) => {
 *   callbackify(handleUpdateAsync)(
 *     (err, _) => { if (err) console.error('Error:', err); },
 *     event
 *   );
 * });
 * ```
 */
export const callbackify = <T extends any[], U = unknown, E = any>(
    fn: (...args: T) => Promise<U>,
): Callbackified<T, U, E> => {
    return (cb, ...args) => {
        fn(...args)
            .then((v) => cb(null, v))
            .catch((err) => cb(err, null));
    };
};

/**
 * Repeatedly executes a function at specified intervals.
 *
 * This utility provides a continuous polling mechanism with proper cleanup.
 * The function always schedules the next execution even if the current one throws an error.
 *
 * @param fn The function to execute repeatedly
 * @param interval Time in milliseconds between each execution
 * @param callNow Whether to execute the function immediately (default: false)
 * @returns A cancel function that stops the polling when called
 *
 * @example
 * ```
 * // Check for updates every 5 seconds
 * const stopPolling = poll(() => {
 *   checkForNewMessages();
 * }, 5000, true); // Start immediately
 *
 * // Later, when you want to stop polling:
 * stopPolling();
 * ```
 */
export const poll = (fn: () => void, interval: number, callNow = false): () => void => {
    let timeout: ReturnType<typeof setTimeout> | null = null;
    const handler = () => {
        try {
            fn();
        } finally {
            timeout = setTimeout(handler, interval);
        }
    };
    if (callNow) handler();
    else timeout = setTimeout(handler, interval);
    return () => {
        if (timeout !== null) clearTimeout(timeout);
    };
};

const generateId = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 8)}`;

/**
 * Returns a function that generates random alphanumeric IDs with an optional prefix.
 * Each generated ID is unique within the scope of the returned function.
 *
 * Useful for creating unique HTML element IDs, form field IDs, or any scenario
 * where you need to generate multiple unique identifiers.
 *
 * Note: This function is not suitable for generating IDs that require
 * high entropy or cryptographic security.
 *
 * @example
 * ```ts
 * import { ids } from "@campfire/core";
 * const genId = ids();
 * console.log(genId()) // cf-k9yh28
 * const todoId = ids('todo');
 * console.log(todoId()) // todo-hv9p4y
 * ```
 * @param prefix The prefix to use. Defaults to 'cf-'.
 * @returns A function that generates a unique ID.
 */
export const ids = <T extends string>(prefix: T = "cf" as T): () => `${T}-${string}` => {
    const existing = new Set<string>();
    return (() => {
        let id = generateId(prefix);
        while (existing.has(id)) id = generateId(prefix);
        existing.add(id);
        return id;
    }) as () => `${T}-${string}`;
};

/**
 * Creates a deeply-cloned version of a value, but only for plain objects and arrays.
 *
 * - Functions, Dates, RegExps, Maps, Sets etc. are not cloned—references are returned for these, as are primitives.
 * - Cyclic references are preserved via a WeakMap (safe for objects/arrays).
 * - This is **not** a full/robust deep clone (for edge cases, use a specialized library).
 *
 * @example
 * ```ts
 * import { deepishClone } from "@/campfire.ts";
 * const original = { a: [1, { b: 2 }] };
 * const copy = deepishClone(original);
 * copy.a[1].b = 33;
 * console.log(original.a[1].b); // 2
 * ```
 *
 * @param value The value to deep-clone (array or plain object recommended)
 * @returns A recursively cloned copy, or original for non-objects/functions.
 */
export const deepishClone = <T>(value: T, seen = new WeakMap()): T => {
    // Handle primitives and functions (can't/shouldn't clone)
    if (value === null || typeof value !== "object") return value;
    if (typeof value === "function") return value;

    // Handle cyclic references
    if (seen.has(value)) return seen.get(value);

    try {
        if (Array.isArray(value)) {
            const copy: any[] = [];
            seen.set(value, copy);
            for (const item of value) {
                copy.push(deepishClone(item, seen));
            }
            return copy as T;
        }

        // Plain objects
        if (Object.getPrototypeOf(value) === Object.prototype) {
            const copy: Record<string, any> = {};
            seen.set(value, copy);
            for (const key in value) {
                if (Object.hasOwn(value, key)) {
                    copy[key] = deepishClone(value[key], seen);
                }
            }
            return copy as T;
        }

        // Date, RegExp, Map, Set, etc — skip cloning, return reference
        return value;
    } catch (_) {
        // Fallback on error (e.g., circular refs, DOM nodes, etc.)
        return value;
    }
};
