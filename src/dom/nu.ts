import type { Store } from "../stores/mod.ts";
import type { ElementProperties, InferElementType, RenderFunction, UnwrapStore } from "../types.ts";
import { escape, initMutationObserver } from "../utils.ts";
import { select } from "./mod.ts";
import { NuBuilder } from "./NuBuilder.ts";
import { CfDom } from "./config.ts";

if ("MutationObserver" in globalThis) initMutationObserver();
else {
    console.warn(
        "MutationObserver was not found in your browser. Campfire will",
        "not be able to warn you of destructive mutations!",
    );
}

const unwrapDeps = <D extends Record<string, Store<any>>>(
    deps: D
): UnwrapStore<D> => {
    const result: any = {};
    for (const key in deps) {
        const value = deps[key].value;
        if (value instanceof Map) {
            result[key] = Object.fromEntries(value.entries());
        } else {
            result[key] = value.valueOf();
        }
    }
    return result;
};

const isValidRenderFn = <T extends HTMLElement>(
    fn: ElementProperties<T, any>["contents"],
): fn is RenderFunction<T, any> => {
    if (!fn) return false;
    if (typeof fn !== "function") return false;
    return true;
};

/**
 * Takes an existing element and modifies its properties.
 * Refer ElementProperties documentation for details on
 * what can be changed.
 * @param elt The element to modify.
 * @param args Properties to set on the element.
 */
export const extend = <
    T extends HTMLElement,
    D extends Record<string, Store<any>>,
>(
    elt: T,
    args: ElementProperties<T, D> = {},
): [T, ...HTMLElement[]] => {
    const { contents, misc, style, on = {}, attrs = {}, raw, gimme = [], deps = ({} as D), children = {} } = args;

    let content = "";
    if (isValidRenderFn<T>(contents)) {
        Object.entries(deps).forEach(([name, dep]) => {
            dep.any((evt) => {
                const res = contents(unwrapDeps(deps), { event: { ...evt, triggeredBy: name }, elt });

                if (res !== undefined) {
                    const reactiveChildren = select({ s: '[data-cf-slot]', all: true, from: elt })
                        .map(elt => [CfDom.getAttribute(elt, 'data-cf-slot'), elt]) as [string, HTMLElement][];
                    CfDom.setInnerHTML(elt, res);
                    reactiveChildren.forEach(([slot, ref]) => {
                        const slotElement = CfDom.querySelector(`cf-slot[name='${slot}']`, elt);
                        if (slotElement) CfDom.replaceWith(slotElement, ref);
                    })
                }
            });
        });

        const result = contents(unwrapDeps(deps), { elt });

        if (typeof result === "undefined") CfDom.setAttribute(elt, "data-cf-fg-updates", "true");
        else CfDom.removeAttribute(elt, "data-cf-fg-updates");

        content = result || "";
    } else if (typeof contents === "string") {
        content = contents;
    }

    if (content?.trim()) {
        CfDom.setInnerHTML(elt, raw ? content : escape(content));
        CfDom.querySelectorAll('cf-slot[name]', elt).forEach(itm => {
            const name = CfDom.getAttribute(itm, 'name');
            if (!name) return;
            if (name in children) {
                const val = children[name];
                const [child] = Array.isArray(val) ? val : [val];
                if (!child) return;
                CfDom.replaceWith(itm, child);
                CfDom.setAttribute(child, 'data-cf-slot', name);
            }
        })
    }

    const depIds = Object.values(deps).map((dep) => dep.id);
    if (depIds.length) CfDom.setAttribute(elt, "data-cf-reactive", "true");
    else CfDom.removeAttribute(elt, "data-cf-reactive");

    if (misc) Object.assign(elt, misc);
    if (style) CfDom.setStyles(elt, style);

    Object.entries(on)
        .forEach(([evt, listener]) => CfDom.addElEventListener(elt, evt, listener as (evt: Event) => void));

    Object.entries(attrs).forEach(([attr, value]) => CfDom.setAttribute(elt, attr, String(value)));

    const extras: HTMLElement[] = [];
    for (const selector of gimme) {
        const found = CfDom.querySelector(selector, elt);
        // This is on purpose.
        // The user will expect the items to be at the same indices
        // as the selectors they supplied.
        extras.push(found as HTMLElement);
    }

    return [elt, ...extras];
};

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
export const nu = <
    const T extends string,
    E extends InferElementType<T>,
    D extends Record<string, Store<any>>,
>(
    info: T = 'div' as T,
    args: ElementProperties<E, D> = {},
): NuBuilder<T, E, D> => {
    return new NuBuilder<T, E, D>(info, args);
};