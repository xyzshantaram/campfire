import type { Store } from "../stores/mod.ts";
import type { ElementProperties, InferElementType, RenderFunction, UnwrapStore } from "../types.ts";
import { escape, initMutationObserver } from "../utils.ts";
import { select } from "./mod.ts";
import { NuBuilder } from "./NuBuilder.ts";
import { CfDom } from "./config.ts";

if (CfDom.isBrowser()) {
    if ("MutationObserver" in globalThis) initMutationObserver();
    else {
        console.warn(
            "MutationObserver was not found in your browser. Campfire will",
            "not be able to warn you of destructive mutations!",
        );
    }
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

const isValidRenderFn = <T extends HTMLElement, D extends Record<string, Store<any>>>(
    fn: ElementProperties<T, D>["render"],
): fn is RenderFunction<T, any> => {
    if (!fn) return false;
    if (typeof fn !== "function") return false;
    return true;
};

/**
 * Reconciles the properties from a NuBuilder to an existing element.
 * This applies the builder's properties to the element without replacing it.
 * 
 * @param elt The target element to update
 * @param builder The NuBuilder whose properties will be applied
 */
const reconcileBuilderProps = <
    T extends HTMLElement,
    D extends Record<string, Store<any>>
>(elt: T, builder: NuBuilder<T, D>) => {
    const { style = {}, attrs = {}, misc = {} } = builder.props;

    Object.assign(elt.style, style);
    if (attrs) {
        Object.entries(attrs || {}).forEach(([key, value]) => {
            if (typeof value !== 'number' && !value) {
                elt.removeAttribute(key)
            }
            else if (elt.getAttribute(key) !== String(value)) {
                elt.setAttribute(key, String(value));
            }
        });
    }
    if (misc) Object.assign(elt, misc);
    return elt;
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
    const {
        contents,
        render,
        misc,
        style,
        on = {},
        attrs = {},
        raw: r,
        gimme = [],
        deps = ({} as D),
        children = {}
    } = args;
    let raw = r;

    let content = "";
    if (isValidRenderFn<T, D>(render)) {
        Object.entries(deps).forEach(([name, dep]) => {
            dep.any((evt) => {
                const builder = new NuBuilder<T, D, string>(elt);
                const res = render(unwrapDeps(deps), {
                    event: { ...evt, triggeredBy: name },
                    elt,
                    builder: builder as NuBuilder<T, any, string>
                });

                if (res !== undefined) {
                    const reactiveChildren = select({ s: '[data-cf-slot]', all: true, from: elt })
                        .map(elt => [elt.getAttribute('data-cf-slot'), elt]) as [string, HTMLElement][];
                    if (typeof res === 'string') {
                        elt.innerHTML = res;
                    }
                    else {
                        elt.innerHTML = res.props.contents || '';
                        // Reconcile other builder properties with the element
                        reconcileBuilderProps(elt, res);
                    }
                    reactiveChildren.forEach(([slot, ref]) => {
                        elt.querySelector(`cf-slot[name='${slot}']`)?.replaceWith(ref);
                    });
                }
            });
        });

        const result = render(unwrapDeps(deps), {
            elt,
            builder: new NuBuilder<T, D, string>(elt) as any
        });

        if (typeof result === "undefined") elt.setAttribute("data-cf-fg-updates", "true");
        else {
            elt.removeAttribute("data-cf-fg-updates");
            raw = true;
        }

        if (result instanceof NuBuilder) {
            content = result.props.contents || '';
            reconcileBuilderProps(elt, result);
        }
        else {
            content = result;
        }
    } else if (typeof contents === "string") {
        content = contents;
    }

    if (content?.trim()) {
        elt.innerHTML = raw ? content : escape(content);
        elt.querySelectorAll('cf-slot[name]').forEach(itm => {
            const name = itm.getAttribute('name');
            if (!name) return;
            if (name in children) {
                const val = children[name];
                const [child] = Array.isArray(val) ? val : [val];
                if (!child) return;
                itm.replaceWith(child);
                child.setAttribute('data-cf-slot', name);
            }
        });
    }

    const depIds = Object.values(deps).map((dep) => dep.id);
    if (depIds.length) elt.setAttribute("data-cf-reactive", "true");
    else elt.removeAttribute("data-cf-reactive");

    if (misc) Object.assign(elt, misc);
    if (style) Object.assign(elt.style, style);

    Object.entries(on)
        .forEach(([evt, listener]) => CfDom.addElEventListener(elt, evt, listener as (evt: Event) => void));

    Object.entries(attrs).forEach(([attr, value]) => elt.setAttribute(attr, String(value)));

    const extras: HTMLElement[] = [];
    for (const selector of gimme) {
        const found = elt.querySelector(selector);
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
    const Info extends string,
    Elem extends InferElementType<Info>,
    Deps extends Record<string, Store<any>>,
>(
    elt = 'div' as Info | Elem,
    args: ElementProperties<Elem, Deps> = {},
): NuBuilder<Elem, Deps, Info> => {
    return new NuBuilder<Elem, Deps, Info>(elt, args);
};