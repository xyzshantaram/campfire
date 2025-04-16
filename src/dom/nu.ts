import type { Store } from "../stores/mod.ts";
import type { ElementProperties, InferElementType, RenderBuilder, RenderFunction, UnwrapStore } from "../types.ts";
import type { CfHTMLElementInterface } from "./config.ts";
import { escape } from "../utils.ts";
import { select } from "./mod.ts";
import { NuBuilder } from "./NuBuilder.ts";
import { CfDom } from "./config.ts";
import type { StoreEventFromObject } from "../types.ts";
import * as tracking from './tracking.ts';

const unwrap = <D extends Record<string, Store<any>>>(
    deps: D
): UnwrapStore<D> => {
    const result: any = {};
    for (const key in deps) {
        result[key] = deps[key].current();
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

const reconcileClasses = (elt: HTMLElement, changed: Record<string, boolean>) => {
    return Object.keys(changed).forEach(
        key => changed[key] ? elt.classList.add(key) : elt.classList.remove(key)
    );
}

/**
 * Reconciles the properties from a NuBuilder to an existing element.
 * This applies the builder's properties to the element without replacing it.
 * 
 * @param elt The target element to update
 * @param builder The NuBuilder whose properties will be applied
 */
const reconcile = <
    T extends HTMLElement,
    D extends Record<string, Store<any>>
>(elt: T, builder: RenderBuilder<T, D>) => {
    const { style = {}, attrs = {}, misc = {}, classes = {} } = builder.props;
    reconcileClasses(elt, classes);
    Object.assign(elt.style, style);
    if (attrs) {
        Object.entries(attrs || {}).forEach(([key, value]) => {
            if (typeof value === 'string' && value.length === 0) {
                elt.removeAttribute(key);
            }
            else if (elt.getAttribute(key) !== String(value)) {
                elt.setAttribute(key, String(value));
            }
        });
    }
    if (misc) Object.assign(elt, misc);
    return elt;
};

const extractReactiveChildren = (elt: HTMLElement) =>
    select({ s: '[data-cf-slot]', all: true, from: elt })
        .map(elt => [elt.getAttribute('data-cf-slot'), elt] as [string, HTMLElement])
        .reduce((prev, [slot, elt]) => {
            prev[slot] ??= [];
            prev[slot].push(elt);
            return prev;
        }, {} as Record<string, HTMLElement[]>)

const setupDeps = <
    T extends HTMLElement, D extends Record<string, Store<any>>
>({ elt, render, deps }: {
    elt: T,
    render: RenderFunction<T, D>,
    deps: D
}) => {
    Object.entries(deps).forEach(([name, dep]) => dep.any((evt) => {
        const builder = new NuBuilder<T, D, string>(elt);
        const res = render(unwrap(deps), {
            elt,
            event: { ...(evt as StoreEventFromObject<D>), triggeredBy: name },
            b: builder as NuBuilder<T, any, string>,
            first: false
        });

        const children = extractReactiveChildren(elt);
        if (typeof res === 'string') {
            elt.innerHTML = res;
        }
        else if (res instanceof NuBuilder) {
            const c = res.props.contents || '';
            elt.innerHTML = res.props.raw ? c : escape(c);
            reconcile(elt, res);
        }
        else return;

        for (const key in children) {
            const [slot] = select({ s: `cf-slot[name='${key}']`, from: elt });
            if (!slot) continue;
            const list = children[key] || [];
            const fragment = CfDom.createDocumentFragment();
            list.forEach(elt => fragment.appendChild(elt))
            slot.replaceWith(fragment);
        }
    })
    );
}

const setupReactiveChildren = <T extends HTMLElement>(
    elt: T,
    children: Record<string, CfHTMLElementInterface | CfHTMLElementInterface[]>
) => {
    elt.querySelectorAll('cf-slot[name]').forEach(itm => {
        const name = itm.getAttribute('name');
        if (!name) return;
        if (Object.hasOwn(children, name)) {
            const val = children[name];
            const replacement: Node = Array.isArray(val) ?
                CfDom.createDocumentFragment() : val;
            if (Array.isArray(val)) val.forEach(item => {
                replacement.appendChild(item);
                item.setAttribute('data-cf-slot', name);
            });
            else val.setAttribute('data-cf-slot', name);
            itm.replaceWith(replacement);
        }
    });
}

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
        classes = {},
        gimme = [],
        deps = ({} as D),
        children = {},
        track
    } = args;
    let raw = !!r;

    if (track) tracking.track(track, elt);
    reconcileClasses(elt, classes);

    const setHtml = (str: string) => elt.innerHTML = raw ? str : escape(str);

    if (isValidRenderFn<T, D>(render)) {
        setupDeps({ elt, render, deps });
        const result = render(unwrap(deps), {
            elt,
            b: new NuBuilder<T, D, string>(elt),
            first: true
        });

        if (typeof result === "undefined") elt.setAttribute("data-cf-fg-updates", "true");
        else {
            elt.removeAttribute("data-cf-fg-updates");
            if (typeof result === 'string') {
                setHtml(result);
            }
            if (result instanceof NuBuilder) {
                raw = !!result.props.raw;
                setHtml(result.props.contents || '');
                reconcile(elt, result);
            }
        }
    } else if (typeof contents === "string") {
        setHtml(contents);
    }

    setupReactiveChildren(elt, children);

    if (misc) Object.assign(elt, misc);
    if (style) Object.assign(elt.style, style);

    Object.entries(on)
        .forEach(([evt, listener]) => CfDom.addElEventListener(elt, evt, listener as (evt: Event) => void));

    Object.entries(attrs).forEach(([attr, value]) => {
        const current = elt.getAttribute(attr);
        const str = String(value);
        if (current === str) return;
        if (typeof value === 'string' && value.length === 0) elt.removeAttribute(attr);
        else elt.setAttribute(attr, String(value));
    });

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

export const x = <
    Elem extends InferElementType<Info>,
    Deps extends Record<string, Store<any>>,
    Info extends string = 'div',
>(
    elt: Elem,
    args: ElementProperties<Elem, Deps> = {},
): NuBuilder<Elem, Deps, Info> => {
    return nu(elt, args);
}