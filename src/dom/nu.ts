import type { Store } from "../stores/mod.ts";
import type { ElementProperties, InferElementType, RenderBuilder, RenderFunction, UnwrapStore } from "../types.ts";
import type { CfHTMLElementInterface } from "./config.ts";
import { escape } from "../utils.ts";
import { select } from "./mod.ts";
import { NuBuilder } from "./NuBuilder.ts";
import { CfDom } from "./config.ts";
import type { StoreEventFromObject } from "../types.ts";
import * as tracking from "./tracking.ts";

const unwrap = <D extends Record<string, Store<any>>>(
    deps: D,
): UnwrapStore<D> => {
    const result: any = {};
    for (const key in deps) {
        result[key] = deps[key].current();
    }
    return result;
};

const isValidRenderFn = <
    T extends HTMLElement,
    D extends Record<string, Store<any>>,
>(
    fn: ElementProperties<T, D>["render"],
): fn is RenderFunction<T, any> => {
    if (!fn) return false;
    if (typeof fn !== "function") return false;
    return true;
};

const reconcileClasses = (
    elt: HTMLElement,
    changed: Record<string, boolean>,
) => {
    return Object.keys(changed).forEach(
        (key) => changed[key] ? elt.classList.add(key) : elt.classList.remove(key),
    );
};

const reconcileAttrs = (
    elt: HTMLElement,
    attrs: Record<string, string | number | boolean>,
) => {
    Object.entries(attrs).forEach(([name, value]) => {
        const current = elt.getAttribute(name);
        if (["boolean", "string"].includes(typeof value) && !value) return elt.removeAttribute(name);
        const str = String(value);
        if (current === str) return;
        elt.setAttribute(name, String(value));
    });
};

/**
 * Reconciles the properties from a NuBuilder to an existing element.
 * This applies the builder's properties to the element without replacing it.
 *
 * @param elt The target element to update
 * @param builder The NuBuilder whose properties will be applied
 */
const reconcile = <
    T extends HTMLElement,
    D extends Record<string, Store<any>>,
>(elt: T, builder: RenderBuilder<T, D>) => {
    const { style = {}, attrs = {}, misc = {}, classes = {} } = builder.props;
    reconcileClasses(elt, classes);
    Object.assign(elt.style, style);
    if (attrs) reconcileAttrs(elt, attrs);
    if (misc) Object.assign(elt, misc);
    return elt;
};

const extractReactiveChildren = (elt: HTMLElement) =>
    select({ s: "[data-cf-slot]", all: true, from: elt })
        .map((elt) => [elt.getAttribute("data-cf-slot"), elt] as [string, HTMLElement])
        .reduce((prev, [slot, elt]) => {
            prev[slot] ??= [];
            prev[slot].push(elt);
            return prev;
        }, {} as Record<string, HTMLElement[]>);

const setupDeps = <
    T extends HTMLElement,
    D extends Record<string, Store<any>>,
>({ elt, render, deps }: {
    elt: T;
    render: RenderFunction<T, D>;
    deps: D;
}) => {
    Object.entries(deps).forEach(([name, dep]) =>
        dep.any((evt) => {
            const builder = new NuBuilder<T, D, string>(elt);
            const res = render(unwrap(deps), {
                elt,
                event: { ...(evt as StoreEventFromObject<D>), triggeredBy: name },
                b: builder as NuBuilder<T, any, string>,
                first: false,
            });

            const children = extractReactiveChildren(elt);
            if (typeof res === "string") {
                elt.innerHTML = res;
            } else if (res instanceof NuBuilder) {
                const c = res.props.contents || "";
                elt.innerHTML = res.props.raw ? c : escape(c);
                reconcile(elt, res);
            } else return;

            for (const key in children) {
                const [slot] = select({ s: `cf-slot[name='${key}']`, from: elt });
                if (!slot) continue;
                const list = children[key] || [];
                const fragment = CfDom.createDocumentFragment();
                list.forEach((elt) => fragment.appendChild(elt));
                slot.replaceWith(fragment);
            }
        })
    );
};

const setupReactiveChildren = <T extends HTMLElement>(
    elt: T,
    children: Record<string, CfHTMLElementInterface | CfHTMLElementInterface[]>,
) => {
    elt.querySelectorAll("cf-slot[name]").forEach((itm) => {
        const name = itm.getAttribute("name");
        if (!name) return;
        if (Object.hasOwn(children, name)) {
            const val = children[name];
            const replacement: Node = Array.isArray(val) ? CfDom.createDocumentFragment() : val;
            if (Array.isArray(val)) {
                val.forEach((item) => {
                    replacement.appendChild(item);
                    item.setAttribute("data-cf-slot", name);
                });
            } else val.setAttribute("data-cf-slot", name);
            itm.replaceWith(replacement);
        }
    });
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
        classes = {},
        gimme = [],
        deps = ({} as D),
        children = {},
        track,
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
            first: true,
        });

        if (typeof result === "undefined") {
            elt.setAttribute("data-cf-fg-updates", "true");
        } else {
            elt.removeAttribute("data-cf-fg-updates");
            if (typeof result === "string") {
                setHtml(result);
            }
            if (result instanceof NuBuilder) {
                raw = !!result.props.raw;
                setHtml(result.props.contents || "");
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

    reconcileAttrs(elt, attrs);

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
 * Element creation/build helper. Creates a new DOM element (optionally with tag, id, and classes)
 * and returns a chainable NuBuilder for ergonomic Campfire props and child/slot/reactivity management.
 *
 * Accepts a tag string like `div#main.foo.bar`, or just `div`, `#id`, or `.classA`.
 *
 * @example
 * ```ts
 * import { nu, html } from "@/campfire.ts";
 * // Using builder API for a div with classes and content
 * const [first] = nu("div.my-class").content("Hello!").done();
 * // Using builder API to create a div with raw HTML content
 * const [second] = nu("div").raw(true).content(html`<b>bold!</b>`).done();
 *
 * // Store reactivity, builder API style:
 * import { store } from "@/campfire.ts";
 * const count = store({ value: 1 });
 * const reactiv = nu("span")
 *   .render(({ count }) => `The count is ${count}`)
 *   .deps({ count })
 *   .ref(); // .ref() returns the element directly instead of an array.
 *           // Helpful for when you want to pass the result of a nu()
 *           // call to another function.
 * count.update((n) => n + 1); // the span updates automatically!
 * ```
 * @example
 * ```ts
 * // Creating multiple sub-elements with gimme:
 * const [container, child] = nu("div", {
 *   contents: html`<span class='foo'>hi!</span>`,
 *   gimme: [".foo"]
 * }).done();
 * // Now 'child' is the inner .foo element.
 * ```
 *
 * @param info String describing the element. Format: `tag#id.class1.class2` or variant.
 * @param args Optional Campfire props/config.
 * @returns A NuBuilder instance for fluid/chained configuration.
 */
export const nu = <
    const Info extends string,
    Elem extends InferElementType<Info>,
    Deps extends Record<string, Store<any>>,
>(
    elt = "div" as Info | Elem,
    args: ElementProperties<Elem, Deps> = {},
): NuBuilder<Elem, Deps, Info> => {
    return new NuBuilder<Elem, Deps, Info>(elt, args);
};

/**
 * Like `nu()`, but for existing elements—make any element reactive and
 * ergonomic.
 *
 * `x()` allows you to enhance any pre-existing DOM element with Campfire's props,
 * reactivity, and child management API, using the builder interface.
 * Use this instead of `nu()` when you already have an element, such as
 * one you created yourself, fetched from a library, or selected from the DOM.
 *
 * @example
 * ```ts
 * // Enhance a DOM-created element with Campfire's reactive/class/attr API:
 * import * as cf from "@/campfire.ts";
 * const btn = document.createElement('button');
 * const count = cf.store({ value: 0 });
 * cf.x(btn)
 *  .cls('text-lg')
 *  .on('click', () => count.update(n => n + 1))
 *  .misc('type', 'button') // set btn.type = 'button'. Different from attr()
 *  .render(({ count }, { b }) => b.content(`Clicked ${count} times`))
 *  .done();
 * // The button is still a plain HTML element, but reactive as long as
 * // `count` is in scope!
 * ```
 *
 * @param elt An *existing* HTMLElement instance to enhance
 * @param args Campfire props/children/render/etc. to apply
 * @returns A NuBuilder instance wrapping the same element
 */

export const x = <
    Elem extends InferElementType<Info>,
    Deps extends Record<string, Store<any>>,
    Info extends string = "div",
>(
    elt: Elem,
    args: ElementProperties<Elem, Deps> = {},
): NuBuilder<Elem, Deps, Info> => {
    return nu(elt, args);
};
