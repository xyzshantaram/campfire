import { Store } from "../stores/mod.ts";
import type {
    ElementProperties,
    InferElementType,
    RenderFunction,
    StringStyleProps,
    TagStringParseResult,
    DOMEventHandlers
} from "../types.ts";
import { extend } from "./nu.ts";


/**
 * Creates a typed HTML element based on the tag name.
 * 
 * @param name - The HTML tag name.
 * @returns A newly created HTML element of the specified type.
 * @internal
 */
const createTypedElement = <K extends keyof HTMLElementTagNameMap>(name: K) => {
    return document.createElement(name);
}

/**
 * Parses a tag string into its component parts.
 * 
 * @param str A string to parse, of the form tag#id.classes[.classes].
 * @returns A `TagStringParseResult` object containing the parsed information.
 * @internal
 */
const parseEltString = (str: string | undefined): TagStringParseResult => {
    const matches = str ? str.match(/([0-9a-zA-Z\-]*)?(#[0-9a-zA-Z\-]*)?((.[0-9a-zA-Z\-]+)*)/) : undefined;
    const results = matches ? matches.slice(1, 4)?.map((elem) => elem ? elem.trim() : undefined) : Array(3).fill(undefined);

    if (results && results[1]) results[1] = results[1].replace(/#*/g, "");

    return matches ? {
        tag: results[0] || undefined,
        id: results[1] || undefined,
        classes: results[2] ? results[2].split('.').filter((elem: string) => elem.trim()) : undefined
    } : {};
};

/**
 * Builder class for creating and configuring HTML elements using a fluent API.
 * 
 * This class provides a chainable interface for configuring element properties
 * before creating the actual DOM element with the `done()` method.
 * 
 * @example
 * ```typescript
 * // Create a button with multiple options
 * const [button] = nu('button#submit.primary')
 *   .content('Submit')
 *   .attr('type', 'submit')
 *   .on('click', () => console.log('Clicked!'))
 *   .style('backgroundColor', 'blue')
 *   .done();
 * ```
 */
export class NuBuilder<T extends string, E extends InferElementType<T>, D extends Record<string, Store<any>>> {
    /** Element properties configuration object */
    props: ElementProperties<E, D> = {};

    /** Element info string (tag, id, classes) */
    info: T;

    /**
     * Creates a new NuBuilder instance.
     * 
     * @param info - A string describing the element in the format 'tag#id.class1.class2'
     * @param props - Optional initial properties for the element
     */
    constructor(info: T, props?: ElementProperties<E, D>) {
        if (props) this.props = props;
        this.info = info;
    }

    /**
     * Finalizes the builder and creates the actual DOM element with all configured properties.
     * 
     * @returns A tuple containing the created element as the first item, followed by any child elements
     * @throws Error if a class name contains a '#' character
     */
    done(): [E, ...HTMLElement[]] {
        let { tag, id, classes = [] } = parseEltString(this.info);

        if (classes?.some((itm) => itm.includes('#'))) {
            throw new Error(
                "Error: Found # in a class name. " +
                "Did you mean to do elt#id.classes instead of elt.classes#id?"
            );
        }

        if (!tag) tag = 'div';
        const elem = createTypedElement(tag as keyof HTMLElementTagNameMap);

        if (id) elem.id = id;
        classes.forEach((cls) => elem.classList.add(cls));

        return extend(elem as E, this.props);
    }

    ref() {
        return this.done()[0];
    }

    /**
     * Sets the content of the element.
     * 
     * @param value - Either a string of content or a render function that returns content
     * @returns The builder instance for chaining
     */
    content(value: string | RenderFunction<E, D>) {
        this.props.contents = value;
        return this;
    }

    /**
     * Sets a single attribute on the element.
     * 
     * @param name - The attribute name
     * @param value - The attribute value
     * @returns The builder instance for chaining
     */
    attr(name: string, value: string | boolean | number) {
        this.props.attrs ||= {};
        this.props.attrs[name] = value.toString();
        return this;
    }

    /**
     * Sets multiple attributes on the element at once.
     * 
     * @param value - An object containing attribute name-value pairs
     * @returns The builder instance for chaining
     */
    attrs(value: ElementProperties<E, D>['attrs']) {
        this.props.attrs = value;
        return this;
    }

    /**
     * Sets whether the content value should be treated as raw HTML.
     * 
     * @param value - If true, content will not be escaped before setting innerHTML
     * @returns The builder instance for chaining
     */
    raw(value: boolean) {
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
    misc(obj: string, value: unknown): NuBuilder<T, E, D>;
    misc(obj: Record<string, unknown>): NuBuilder<T, E, D>;
    misc(obj: string | Record<string, unknown>, value?: unknown): NuBuilder<T, E, D> {
        this.props.misc ||= {};
        if (typeof obj === 'object') this.props.misc = obj;
        else this.props.misc[obj] = value;
        return this;
    }

    /**
     * Sets a single CSS style property on the element.
     * 
     * @param prop - The CSS property name
     * @param value - The CSS property value
     * @returns The builder instance for chaining
     */
    style(prop: StringStyleProps, value: string) {
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
    styles(value: ElementProperties<E, D>['style']) {
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
    on<K extends keyof HTMLElementEventMap>(type: K, handler: (event: HTMLElementEventMap[K]) => void) {
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
    gimme(...selectors: string[]) {
        this.props.gimme ||= [];
        this.props.gimme = selectors;
        return this;
    }

    deps<ND extends Record<string, Store<any>>>(obj: ND): NuBuilder<T, E, D & ND> {
        this.props.deps = { ...(this.props.deps as D), ...obj };
        return this as unknown as NuBuilder<T, E, D & ND>;
    }

    /**
     * Unsafely set the html of the object. This is equivalent to calling
     * .content(...).raw(true) and is meant to be used with a templating function
     * like `cf.html`.
     * @param value The content function / string to set.
     * @returns The builder for chaining.
     */
    html(value: string | RenderFunction<E, D>) {
        return this.content(value).raw(true);
    }

    /**
     * Mount reactive children into a parent element. The children are preserved
     * across re-renders and can be independently reactive.
     * @param children An object whose keys correspond to the `name` attributes 
     * of cf-slot elements in the parent's innerHTML.
     * Only the first child for each key will be appended.
     * @returns The builder object for chaining.
     */
    children(children: Record<string, HTMLElement | HTMLElement[]>) {
        this.props.children = children;
        return this;
    }
}