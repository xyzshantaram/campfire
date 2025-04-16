import type { Store } from "../stores/mod.ts";
import type { ElementProperties, InferElementType } from "../types.ts";
import { NuBuilder } from "./NuBuilder.ts";
/**
 * Takes an existing element and modifies its properties.
 * Refer ElementProperties documentation for details on
 * what can be changed.
 * @param elt The element to modify.
 * @param args Properties to set on the element.
 */
export declare const extend: <T extends HTMLElement, D extends Record<string, Store<any>>>(elt: T, args?: ElementProperties<T, D>) => [T, ...HTMLElement[]];
/**
 * An element creation helper.
 * @param info Basic information about the element.
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
export declare const nu: <const Info extends string, Elem extends InferElementType<Info>, Deps extends Record<string, Store<any>>>(elt?: Info | Elem, args?: ElementProperties<Elem, Deps>) => NuBuilder<Elem, Deps, Info>;
export declare const x: <Elem extends InferElementType<Info>, Deps extends Record<string, Store<any>>, Info extends string = "div">(elt: Elem, args?: ElementProperties<Elem, Deps>) => NuBuilder<Elem, Deps, Info>;
