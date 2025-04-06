import { Store } from '../stores/mod.ts';
import { ElementProperties, TagStringParseResult, InferElementType, StoreEvent, RenderFunction } from '../types.ts';
import { escape } from '../utils.ts';
import { NuBuilder } from './NuBuilder.ts';

const unwrapDeps = <D extends Record<string, Store<any>>>(
    deps: D
): {
        [K in keyof D]: D[K] extends Store<infer V> ? V : never;
    } => {
    const result: any = {};
    for (const key in deps) {
        result[key] = deps[key].value;
    }
    return result;
};


const isValidRenderFn = <T extends HTMLElement>(fn: ElementProperties<T, any>['contents']): fn is RenderFunction<T, any> => {
    if (!fn) return false;
    if (typeof fn !== 'function') return false;
    return true;
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
    D extends Record<string, Store<any>> = {}
>(
    elt: T,
    args: ElementProperties<T, D> = {}
): [T, ...HTMLElement[]] => {
    let { contents, misc, style, on = {}, attrs = {}, raw, gimme = [], deps = ({} as D) } = args;

    if (isValidRenderFn<T>(contents)) {
        Object.entries(deps).forEach(([name, dep]) => {
            dep.any(evt => {
                const res = contents(unwrapDeps(deps), { event: { ...evt, triggeredBy: name }, elt });
                if (res && res.length) elt.innerHTML = res;
            })
        });
    }
    const depIds = Object.values(deps).map(dep => dep.id);
    elt.setAttribute('data-cf-reacting-to', depIds.join(','));
    let content = (typeof contents === 'function' ? contents(unwrapDeps(deps), { elt }) : contents) || '';
    content = raw ? content : escape(content);

    if (content.trim()) elt.innerHTML = content;

    Object.assign(elt, misc);
    Object.assign(elt.style, style);

    Object.entries(on).forEach(([evt, listener]) =>
        elt.addEventListener(evt, listener)
    );

    Object.entries(attrs).forEach(([attr, value]) =>
        elt.setAttribute(attr, value)
    );

    const extras: HTMLElement[] = [];
    for (const selector of gimme) {
        const found = elt.querySelector(selector);
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
    T extends string,
    E extends InferElementType<T>,
    D extends Record<string, Store<any>> = {}
>(
    info: T,
    args?: ElementProperties<E, D>
): NuBuilder<T, E, D> => {
    return new NuBuilder(info, args)
};