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

/**
 * Properties for the HTML element to be created.
 */
export interface ElementProperties {
    /**
     * String that will be set as the inner HTML of the created element. By default,
     * this is escaped using cf.escape() - however, if you supply `raw: true` in
     * the args object passed as nu's second argument, escaping is disabled.
     */
    contents?: string;
    /** Alias for `contents` */
    c?: ElementProperties["contents"];

    /**
     * Whether or not to escape the `contents` string. If `raw` is true, the
     * string is not escaped.
     */
    raw?: boolean;

    /** Miscellaneous properties to set on the created element,
     * for example, `type: "button"` or `checked: true`
     */
    misc?: Record<string, unknown>;
    /** Alias for `ElementProperties.misc`. */
    m?: ElementProperties["misc"];

    /** Contains styles that will be applied to the new element. Property names must be the same as those in `CSSStyleDeclaration`. */
    style?: Partial<CSSStyleDeclaration>;
    /** Alias for `ElementProperties.style`. */
    s?: ElementProperties["style"];

    /** An object containing event handlers that will be applied using addEventListener.
     * For example: `{'click': (e) => console.log(e)}`
     */
    on?: Record<string, DomEventHandler>;

    /** Attributes that will be set on the element using `Element.setAttribute`. */
    attrs?: Record<string, string>;
    /** Alias for `ElementProperties.attrs`. */
    a?: ElementProperties["contents"];

    /** A list of elements to query from the element. Will be returned as subsequent members of the returned Array after the element itself. */
    gimme?: string[];
    /** Alias for `ElementProperties.gimme` */
    g?: ElementProperties["gimme"];
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

type EltInfoToTag<T extends string> =
    T extends `${infer TagNameOnly extends TagName}${string}` ? TagNameOnly : 'div';

export type InferElementType<T extends string> =
    HTMLElementTagNameMap[EltInfoToTag<T>];