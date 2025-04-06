import { Store } from "./stores/mod.ts";

export type StoreEvent =
    | {
        type: "change";
        value: any;
        key?: string;
        idx?: number;
    }
    | {
        type: "deletion";
        value: any;
    } & ({ key: string } | { idx: number })
    | {
        type: "clear";
    }
    | {
        type: "append";
        value: any;
        idx: any;
    };


/** A signature for a subscriber type. */
export type Subscriber = (event: StoreEvent) => void;

/** A generic signature for an event handler type. */
export type DomEventHandler = (e: Event) => unknown;

/** The function signature for a function returned by `template()`. */
export type Template = (e: Record<string, any>) => string;

export type RenderFunction<T, D> = (props: {
    [K in keyof D]: D[K] extends Store<infer V> ? V : never;
}, opts: { event?: StoreEvent & { triggeredBy: string }, elt: T }) => string | undefined;

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

    /** Contains styles that will be applied to the new element. Property names must be the same as those in `CSSStyleDeclaration`. */
    style?: Partial<CSSStyleDeclaration>;

    /** An object containing event handlers that will be applied using addEventListener.
     * For example: `{'click': (e) => console.log(e)}`
     */
    on?: Record<string, DomEventHandler>;

    /** Attributes that will be set on the element using `Element.setAttribute`. */
    attrs?: Record<string, string>;

    /** A list of elements to query from the element. Will be returned as subsequent members of the returned Array after the element itself. */
    gimme?: string[];
    deps?: D;
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

export type ElementPosition =
    | { before: HTMLElement }
    | { after: HTMLElement }
    | { into: HTMLElement; at?: "start" };

type TagName = keyof HTMLElementTagNameMap;

export type EltInfoToTag<T extends string> =
    // Case 4: Tag#id.class
    T extends `${infer Tag extends TagName}#${string}.${string}` ? Tag :
    // Case 2: Tag#id
    T extends `${infer Tag extends TagName}#${string}` ? Tag :
    // Case 3: Tag.class
    T extends `${infer Tag extends TagName}.${string}` ? Tag :
    // Case 1: Tag only
    T extends `${infer Tag extends TagName}` ? Tag :
    'div';


export type InferElementType<T extends string> =
    HTMLElementTagNameMap[EltInfoToTag<T>];