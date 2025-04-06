import { ElementProperties, TagStringParseResult, InferElementType } from '../types.ts';
import { escape } from '../utils.ts';

/**
 * 
 * @param str A string to parse, of the form tag#id.classes[.classes].
 * @returns A `TagStringParseResult` object containing the parsed information.
 * @internal
 */
const _parseEltString = (str: string | undefined): TagStringParseResult => {
    const matches = str ? str.match(/([0-9a-zA-Z\-]*)?(#[0-9a-zA-Z\-]*)?((.[0-9a-zA-Z\-]+)*)/) : undefined;
    const results = matches ? matches.slice(1, 4)?.map((elem) => elem ? elem.trim() : undefined) : Array(3).fill(undefined);

    if (results && results[1]) results[1] = results[1].replace(/#*/g, "");

    return matches ? {
        tag: results[0] || undefined,
        id: results[1] || undefined,
        classes: results[2] ? results[2].split('.').filter((elem: string) => elem.trim()) : undefined
    } : {};
};

/**
 * Takes an existing element and modifies its properties.
 * Refer ElementProperties documentation for details on
 * what can be changed.
 * @param elem The element to modify.
 * @param args Properties to set on the element.
 */
export const extend = <T extends HTMLElement>(
    elem: T,
    args: ElementProperties = {}
): [T, ...HTMLElement[]] => {
    let { contents, c, misc, m, style, s, on, attrs, a, raw, g, gimme } = args;

    contents = contents || c || '';
    contents = raw ? contents : escape(contents);
    if (contents) elem.innerHTML = contents;

    Object.assign(elem, misc || m);
    Object.assign(elem.style, style || s);

    Object.entries(on || {}).forEach(([evt, listener]) =>
        elem.addEventListener(evt, listener)
    );

    Object.entries(attrs || a || {}).forEach(([attr, value]) =>
        elem.setAttribute(attr, value)
    );

    const extras: HTMLElement[] = [];
    for (const selector of gimme || g || []) {
        const found = elem.querySelector(selector);
        extras.push(found as HTMLElement);
    }

    return [elem, ...extras];
};

const createTypedElement = <K extends keyof HTMLElementTagNameMap>(name: K) => {
    return document.createElement(name);
}

/**
 * An element creation helper.
 * @param eltInfo Basic information about the element.
 * `eltInfo` should be a string of the format `tagName#id.class1.class2`.
 * Each part (tag name, id, classes) is optional, and an infinite number of
 * classes is allowed. When `eltInfo` is an empty string, the tag name is assumed to be
 * `div`.
 * @param args Optional extra properties for the created element.
 * @returns The newly created DOM element and any other elements requested in the
 * `gimme` parameter specified in args.
 * @example
 * ```
 * cf.nu(`elt#id.class1`, {
 *  raw: true,
 *  c: html`<span class=some-span>foo bar</span>`,
 *  gimme: ['.some-span']
 * }) // Output: [<elt#id.class1>, <the span some-span>]
 * ```
 * @example
 * ```
 * cf.nu(`span.some-span`, {
 *  // properties...
 *  // no gimme specified
 * }) // Output is still a list [<span.some-span>]
 * ```
 */
export const nu = <T extends string>(
    eltInfo: T,
    args: ElementProperties = {}
): [InferElementType<T>, ...HTMLElement[]] => {
    let { tag, id, classes } = _parseEltString(eltInfo);

    if (classes?.some((itm) => itm.includes('#'))) {
        throw new Error(
            "Error: Found # in a class name. " +
            "Did you mean to do elt#id.classes instead of elt.classes#id?"
        );
    }

    if (!tag) tag = 'div';
    const elem = createTypedElement(tag as keyof HTMLElementTagNameMap);

    if (id) elem.id = id;
    (classes || []).forEach((cls) => elem.classList.add(cls));

    return extend(elem as InferElementType<T>, args);
};