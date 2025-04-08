import { insert, empty, rm, select, onload } from "./dom/mod.ts";
import { extend, nu } from "./dom/nu.ts";
import { NuBuilder } from "./dom/NuBuilder.ts";
import { ListStore, MapStore, Store, store } from "./stores/mod.ts";
import { html, r } from "./templating/html.ts";
import { mustache, template } from "./templating/mustache.ts";
import { seq, escape, unescape } from './utils.ts';
import type { SelectParams } from "./dom/mod.ts";
import type { RawHtmlOptions } from "./templating/html.ts";
import type { ElementPosition, ElementProperties, Subscriber, Template } from "./types.ts";
declare const _default: {
    ListStore: typeof ListStore;
    MapStore: typeof MapStore;
    Store: typeof Store;
    store: typeof store;
    nu: <const T extends string, E extends import("./types.ts").InferElementType<T>, D extends Record<string, Store<any>> = {}>(info?: T, args?: ElementProperties<E, D>) => NuBuilder<T, E, D>;
    mustache: (string: string, data?: Record<string, string>, shouldEscape?: boolean) => string;
    template: (str: string, shouldEscape?: boolean) => Template;
    escape: (str: string) => string;
    unescape: (str: string) => string;
    extend: <T extends HTMLElement, D extends Record<string, Store<any>> = {}>(elt: T, args?: ElementProperties<T, D>) => [T, ...HTMLElement[]];
    insert: (els: Element | Element[], where: ElementPosition) => Element | Element[];
    empty: (elt: Element) => void;
    rm: (elt: Element) => void;
    select: ({ s, all, from }: SelectParams) => HTMLElement[];
    onload: (cb: (ev: Event) => void) => void;
    html: (strings: TemplateStringsArray, ...values: (string | number | import("./templating/html.ts").RawHtml)[]) => string;
    r: (val: any, options?: RawHtmlOptions) => import("./templating/html.ts").RawHtml;
    seq: (...args: number[]) => number[];
};
export default _default;
export { ListStore, MapStore, Store, store, nu, mustache, template, escape, unescape, extend, insert, empty, rm, select, onload, html, r, seq };
export type { ElementPosition, ElementProperties, Subscriber, Template, NuBuilder, SelectParams, RawHtmlOptions };
