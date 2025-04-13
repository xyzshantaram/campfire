import { NuBuilder } from "./campfire.ts";
import { CfHTMLElementInterface } from "./dom/config.ts";
import { Store } from "./stores/mod.ts";

type StoreValue<ST> =
    ST extends Store<infer T> ?
    (T extends Map<string, infer M> ? M
        : (T extends (infer L)[] ? L : T))
    : never;

export interface UpdateEvent<ST> {
    type: "update";
    value: ST extends Store<infer T> ? T : never;
}

export type AppendEvent<ST> =
    ST extends Store<infer T> ?
    (T extends Array<infer L> ? { type: "append"; value: L; idx: number }
        : { type: "append"; value: T })
    : never;

export type ChangeEvent<ST> =
    ST extends Store<infer T> ? (
        T extends Map<string, infer M> ?
        { type: "change"; value: M; key: string }
        : (
            T extends Array<infer L> ?
            { type: "change"; value: L; idx: number }
            : { type: "change"; value: T }
        )
    ) : never;

export type DeletionEvent<ST> =
    ST extends Store<infer T>
    ? T extends Map<string, infer M>
    ? { type: "deletion"; value: M; key: string }
    : T extends Array<infer L>
    ? { type: "deletion"; value: L; idx: number }
    : { type: "deletion"; value: T }
    : never;

export interface ClearEvent {
    type: "clear";
}

export type StoreEvent<ST> =
    | ChangeEvent<ST>
    | DeletionEvent<ST>
    | AppendEvent<ST>
    | UpdateEvent<ST>
    | ClearEvent;

export type EventType = StoreEvent<any>["type"];

export type SubscriberTypeMap<ST> = {
    [K in EventType]: Extract<StoreEvent<ST>, { type: K }>;
};

/** A signature for a subscriber function. */
export type AnySubscriber<ST> = (event: StoreEvent<ST>) => void;

/** A signature for a subscriber of a specific event. */
export type EventSubscriber<K extends EventType, ST> = (event: SubscriberTypeMap<ST>[K]) => void;

/** The function signature for a function returned by `template()`. */
export type Template = (e: Record<string, any>) => string;

export type UnwrapStore<D> = {
    [K in keyof D]: D[K] extends Store<infer V>
    ? V extends Map<any, any>
    ? Record<string, any> // Loosen Map to a plain object
    : V
    : never;
};

export type StoreEventFromObject<D> = {
    [K in keyof D]: D[K] extends Store<any> ? StoreEvent<D[K]> : never;
}[keyof D];

export type RenderFunction<Elem extends HTMLElement, Deps extends Record<string, Store<any>>> = (
    props: UnwrapStore<Deps>,
    opts: {
        event?: StoreEventFromObject<Deps> & { triggeredBy: string },
        builder: Omit<NuBuilder<Elem, Deps>, "children" | "done" | "ref" | "on" | "gimme" | "deps">,
        elt: Elem
    }
) => string | NuBuilder<Elem, Deps>;

export type StringStyleProps = keyof {
    [K in keyof CSSStyleDeclaration as CSSStyleDeclaration[K] extends string ? K : never]: true
};

export type DOMEventHandlers = {
    [K in keyof HTMLElementEventMap]?: (event: HTMLElementEventMap[K]) => void;
};

/**
 * Properties for the HTML element to be created.
 */
export interface ElementProperties<T extends HTMLElement, D extends Record<string, Store<any>>> {
    /**
     * String that will be set as the inner HTML of the created element. By default,
     * this is escaped using cf.escape() - however, if you supply `raw: true` in
     * the args object passed as nu's second argument, escaping is disabled.
     */

    contents?: string;

    render?: RenderFunction<T, D>;

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
    children?: Record<string, CfHTMLElementInterface>;
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
    | { before: CfHTMLElementInterface }
    | { after: CfHTMLElementInterface }
    | { into: CfHTMLElementInterface; at?: "start" };

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
    T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[EltInfoToTag<T>] : HTMLElement;