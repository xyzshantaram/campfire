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
export declare const escape: (str: string) => string;
/**
 * Unescapes the output of escape() by replacing `&amp;`, `&gt;`, `&lt;`,
 * `&#39;`, and `&quot` with `&`, `<`, `>`, `'`, and `"` respectively.
 * @param str A string to unescape.
 * @returns The string, with its character references replaced by the characters it references.
 * No characters other than the ones mentioned above are unescaped.
 */
export declare const unescape: (str: string) => string;
export declare const seq: (...args: number[]) => number[];
export declare const initMutationObserver: () => void;
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
export type Callbackified<T extends any[], U, E> = (cb: Callback<U, E>, ...args: T) => void;
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
export declare const callbackify: <T extends any[], U = unknown, E = any>(fn: (...args: T) => Promise<U>) => Callbackified<T, U, E>;
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
export declare const poll: (fn: () => void, interval: number, callNow?: boolean) => () => void;
