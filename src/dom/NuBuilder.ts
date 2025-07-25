import type { Store } from "../stores/mod.ts";
import type {
    DOMEventHandlers,
    ElementProperties,
    RenderFunction,
    StringStyleProps,
    TagStringParseResult,
} from "../types.ts";
import { extend } from "./nu.ts";
import { CfDom } from "./config.ts";
import { html } from "../templating/html.ts";
import type { RawHtml } from "../templating/html.ts";

/**
 * Creates a typed HTML element based on the tag name.
 *
 * @param name - The HTML tag name.
 * @returns A newly created HTML element of the specified type.
 * @internal
 */
const createTypedElement = <K extends keyof HTMLElementTagNameMap>(name: K) => {
    return CfDom.createElement(name);
};

/** Creates a typed HTML element from an info string. */
const createElemFromInfo = (info: string) => {
    let { tag, id, classes = [] } = parseEltString(info);

    if (classes?.some((itm) => itm.includes("#"))) {
        throw new Error(
            "Error: Found # in a class name. " +
                "Did you mean to do elt#id.classes instead of elt.classes#id?",
        );
    }

    if (!tag) tag = "div";
    const elem = createTypedElement(tag as keyof HTMLElementTagNameMap);

    if (id) elem.id = id;
    if (classes?.length) classes.forEach((cls) => elem.classList.add(cls));

    return elem;
};

/**
 * Parses a tag string into its component parts.
 *
 * @param str A string to parse, of the form tag#id.classes[.classes].
 * @returns A `TagStringParseResult` object containing the parsed information.
 * @internal
 */
const parseEltString = (str: string | undefined): TagStringParseResult => {
    const matches = str
        ? str.match(/([0-9a-zA-Z\-]*)?(#[0-9a-zA-Z\-]*)?((.[0-9a-zA-Z\-]+)*)/)
        : undefined;
    const results = matches
        ? matches.slice(1, 4)?.map((elem) => elem ? elem.trim() : undefined)
        : Array(3).fill(undefined);

    if (results && results[1]) results[1] = results[1].replace(/#*/g, "");

    return matches
        ? {
            tag: results[0] || undefined,
            id: results[1] || undefined,
            classes: results[2]
                ? results[2].split(".").filter((elem: string) => elem.trim())
                : undefined,
        }
        : {};
};

/**
 * Builder class for creating and configuring HTML elements using a fluent API.
 *
 * This class provides a chainable interface for configuring element properties
 * before creating the actual DOM element with the `done()` method.
 *
 * @example
 * ```ts
 * import { nu } from "@campfire/core";
 * // Create a button with multiple options
 * const [button] = nu('button#submit.primary')
 *   .content('Submit')
 *   .attr('type', 'submit')
 *   .on('click', () => console.log('Clicked!'))
 *   .style('backgroundColor', 'blue')
 *   .done();
 * ```
 */
export class NuBuilder<
    Elem extends HTMLElement,
    Deps extends Record<string, Store<any>>,
    Info = string,
> {
    /** Element properties configuration object */
    props: ElementProperties<Elem, Deps> = {};

    /** Element info string (tag, id, classes) */
    private elem: Elem;

    /**
     * Creates a new NuBuilder instance.
     *
     * @param info - A string describing the element in the format 'tag#id.class1.class2'
     * @param props - Optional initial properties for the element
     */
    constructor(elt: Elem, props?: ElementProperties<Elem, Deps>);
    constructor(elt: Info, props?: ElementProperties<Elem, Deps>);
    constructor(elt: Info | Elem, props?: ElementProperties<Elem, Deps>);
    constructor(elt: Info | Elem, props?: ElementProperties<Elem, Deps>) {
        this.elem = (typeof elt === "string" ? createElemFromInfo(elt) : elt) as Elem;
        this.props = props || {};
    }

    /**
     * Set a class name. Pass on with a falsy value to not apply the class.
     *
     * @param name - The class name to add/remove
     * @param on - Whether the class should be applied (true) or removed (false/falsy)
     * @returns The builder instance for chaining
     */
    cls(name: string, on: "" | boolean | 0 | null = true): typeof this {
        this.props.classes ??= {};
        this.props.classes[name] = !!on;
        return this;
    }

    /**
     * Finalizes the builder and creates the actual DOM element with all configured properties.
     *
     * @returns A tuple containing the created element as the first item, followed by any child elements
     * @throws Error if a class name contains a '#' character
     */
    done(): [Elem, ...HTMLElement[]] {
        return extend(this.elem as any as Elem, this.props);
    }

    ref(): Elem {
        return this.done()[0];
    }

    /**
     * Sets the content of the element as a string, escaped by default.
     * Useful for quick and safe interpolation of strings into DOM content.
     *
     * @param value - String content to set
     * @returns The builder instance for chaining
     */
    content(value: string): typeof this {
        this.props.contents = value;
        return this;
    }

    /**
     * Sets a render function that will be called to generate content
     * whenever dependencies change.
     *
     * @param fn - The render function that returns content
     * @returns The builder instance for chaining
     */
    render(fn: RenderFunction<Elem, Deps>): typeof this {
        this.props.render = fn;
        return this;
    }

    /**
     * Sets a single attribute on the element.
     *
     * @param name - The attribute name
     * @param value - The attribute value. Set to empty string ('') to clear/reset an attribute.
     * @returns The builder instance for chaining
     */
    attr(name: string, value: string | boolean | number): typeof this {
        this.props.attrs ||= {};
        this.props.attrs[name] = value;
        return this;
    }

    /**
     * Sets multiple attributes on the element at once.
     *
     * @param value - An object containing attribute name-value pairs
     * @returns The builder instance for chaining
     */
    attrs(value: ElementProperties<Elem, Deps>["attrs"]): typeof this {
        this.props.attrs = value;
        return this;
    }

    /**
     * Sets whether the content value should be treated as raw HTML.
     *
     * @param value - If true, content will not be escaped before setting innerHTML
     * @returns The builder instance for chaining
     */
    raw(value: boolean): typeof this {
        this.props.raw = value;
        return this;
    }

    /**
     * Sets miscellaneous properties on the element (e.g. `input.checked`).
     *
     * @param obj - Either a property name or an object containing multiple properties
     * @param value - The value for the property if obj is a property name
     * @returns The builder instance for chaining
     */
    misc(obj: string, value: unknown): typeof this;
    misc(obj: Record<string, unknown>): typeof this;
    misc(
        obj: string | Record<string, unknown>,
        value?: unknown,
    ): typeof this {
        this.props.misc ||= {};
        if (typeof obj === "object") this.props.misc = obj;
        else this.props.misc[obj] = value;
        return this;
    }

    /**
     * Sets a single CSS style property on the element.
     *
     * @param prop - The CSS property name
     * @param value - The CSS property value. Set to empty string ('') to clear a style.
     * @returns The builder instance for chaining
     */
    style(prop: StringStyleProps, value: string): typeof this {
        this.props.style ||= {};
        this.props.style[prop] = value;
        return this;
    }

    /**
     * Sets multiple CSS style properties on the element at once.
     *
     * @param value - An object containing style name-value pairs
     * @returns The builder instance for chaining
     */
    styles(value: ElementProperties<Elem, Deps>["style"]): typeof this {
        this.props.style = value ?? {};
        return this;
    }

    /**
     * Attaches an event handler to the element.
     *
     * @param type - The event type to listen for (e.g., 'click', 'submit')
     * @param handler - The event handler function
     * @returns The builder instance for chaining
     */
    on<K extends keyof HTMLElementEventMap>(
        type: K,
        handler: (event: HTMLElementEventMap[K]) => void,
    ): typeof this {
        this.props.on ||= {};
        this.props.on[type] = handler as DOMEventHandlers[K];
        return this;
    }

    /**
     * Specifies selectors for elements that should be retrieved after building the element.
     *
     * @param selectors - A single selector string or an array of selector strings
     * @returns The builder instance for chaining
     */
    gimme(...selectors: string[]): typeof this {
        this.props.gimme ||= [];
        this.props.gimme = selectors;
        return this;
    }

    deps<ND extends Record<string, Store<any>>>(
        obj: ND,
    ): NuBuilder<Elem, Deps & ND, Info> {
        this.props.deps = { ...(this.props.deps as Deps), ...obj };
        return this as unknown as NuBuilder<Elem, Deps & ND, Info>;
    }

    /**
     * Unsafely set the html of the object. This is equivalent to calling
     * .content(...).raw(true) and is meant to be used with a templating function
     * like `cf.html`.
     *
     * Can also be used as a templating function: nu().html`<b>${name}</b>` will
     * cause name to be escaped and interpolated.
     * @param value The string to set.
     * @returns The builder for chaining.
     */
    html(value: string): typeof this;
    html(
        arr: TemplateStringsArray,
        ...values: (string | number | boolean | RawHtml)[]
    ): typeof this;
    html(
        value: string | TemplateStringsArray,
        ...args: (string | boolean | number | RawHtml)[]
    ): typeof this {
        this.props.raw = true;
        if (typeof value === "string") {
            this.props.contents = value;
        } else if (Array.isArray(value)) {
            this.props.contents = html(value, ...args);
        }
        return this;
    }

    /**
     * Mount reactive children into a parent element. The children are preserved
     * across re-renders and can be independently reactive.
     * @param children An object whose keys correspond to the `name` attributes
     * of cf-slot elements in the parent's innerHTML.
     * @returns The builder object for chaining.
     */
    children(children: Record<string, HTMLElement | HTMLElement[]>): typeof this {
        this.props.children = children;
        return this;
    }

    /**
     * Mark the element for tracking, so it can be retrieved later by calling
     * `cf.tracked(id)`.
     * @param id The id to track the element by.
     */
    track(id: string): typeof this {
        this.props.track = id;
        return this;
    }
}
