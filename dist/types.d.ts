import { Store } from "./stores/mod.ts";
export type StoreEvent = {
    type: "change";
    value: any;
    key?: string;
    idx?: number;
} | {
    type: "deletion";
    value: any;
} & ({
    key: string;
} | {
    idx: number;
}) | {
    type: "clear";
} | {
    type: "append";
    value: any;
    idx: any;
};
/** A signature for a subscriber type. */
export type Subscriber = (event: StoreEvent) => void;
/** The function signature for a function returned by `template()`. */
export type Template = (e: Record<string, any>) => string;
export type UnwrapStore<D> = {
    [K in keyof D]: D[K] extends Store<infer V> ? V extends Map<any, any> ? Record<string, any> : V : never;
};
export type RenderFunction<T extends HTMLElement, D> = (props: UnwrapStore<D>, opts: {
    event?: StoreEvent & {
        triggeredBy: string;
    };
    elt: T;
}) => string | undefined;
export type StringStyleProps = keyof {
    [K in keyof CSSStyleDeclaration as CSSStyleDeclaration[K] extends string ? K : never]: true;
};
export type DOMEventHandlers = {
    [K in keyof HTMLElementEventMap]?: (event: HTMLElementEventMap[K]) => void;
};
/**
 * Properties for the HTML element to be created.
 */
export interface ElementProperties<T extends HTMLElement, D extends Record<string, Store<any>> = {}> {
    /**
     * String that will be set as the inner HTML of the created element. By default,
     * this is escaped using cf.escape() - however, if you supply `raw: true` in
     * the args object passed as nu's second argument, escaping is disabled.
     */
    contents?: RenderFunction<T, D> | string;
    /**
     * Whether or not to escape the `contents` string. If `raw` is true, the
     * string is not escaped.
     */
    raw?: boolean;
    /** Miscellaneous properties to set on the created element,
     * for example, `type: "button"` or `checked: true`
     */
    misc?: Record<string, unknown>;
    /**
     * Contains styles that will be applied to the new element. Property names
     * must be the same as those in `CSSStyleDeclaration`.
     */
    style?: Partial<Record<StringStyleProps, string | number>>;
    /**
     * An object containing event handlers that will be applied using addEventListener.
     * For example: `{'click': (e) => console.log(e)}`
     */
    on?: DOMEventHandlers;
    /** Attributes that will be set on the element using `Element.setAttribute`. */
    attrs?: Record<string, string | number | boolean>;
    /**
     * A list of elements to query from the element. Will be returned as
     * subsequent members of the returned Array after the element itself.
     * Returns null when a selector isn't found to preserve order of returned
     * elements.
     */
    gimme?: string[];
    /**
     * A Record<string, Store> of the element's dependencies. The element's
     * content function will be called every time any of the deps change.
     */
    deps?: D;
    /**
     *  Children of the element to mount. They will be mounted into `cf-slot`s
     * corresponding to the Record's keys and preserved between re-renders of
     * the parent. Only the first element returned by nu() will be appended.
     */
    children?: Record<string, HTMLElement[]>;
}
/**
 * An interface to store data parsed from an element descriptor string passed to `nu`.
 * @internal
 */
export interface TagStringParseResult {
    /** The tagName parsed from the info string. */
    tag?: string | undefined;
    /** The id parsed from the info string. */
    id?: string | undefined;
    /** An array of classes parsed from the info string. */
    classes?: string[] | undefined;
}
export type ElementPosition = {
    before: HTMLElement;
} | {
    after: HTMLElement;
} | {
    into: HTMLElement;
    at?: "start";
};
type TagName = keyof HTMLElementTagNameMap;
export type EltInfoToTag<T extends string> = T extends `${infer Tag extends TagName}#${string}.${string}` ? Tag : T extends `${infer Tag extends TagName}#${string}` ? Tag : T extends `${infer Tag extends TagName}.${string}` ? Tag : T extends `${infer Tag extends TagName}` ? Tag : 'div';
export type InferElementType<T extends string> = HTMLElementTagNameMap[EltInfoToTag<T>];
export {};
