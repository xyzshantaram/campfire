import { Store } from "../stores/mod.ts";
import type { ElementProperties, RenderFunction, StringStyleProps } from "../types.ts";
import type { RawHtml } from "../templating/html.ts";
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
export declare class NuBuilder<Elem extends HTMLElement, Deps extends Record<string, Store<any>>, Info = string> {
    /** Element properties configuration object */
    props: ElementProperties<Elem, Deps>;
    /** Element info string (tag, id, classes) */
    private elem;
    /**
     * Creates a new NuBuilder instance.
     *
     * @param info - A string describing the element in the format 'tag#id.class1.class2'
     * @param props - Optional initial properties for the element
     */
    constructor(elt: Elem, props?: ElementProperties<Elem, Deps>);
    constructor(elt: Info, props?: ElementProperties<Elem, Deps>);
    constructor(elt: Info | Elem, props?: ElementProperties<Elem, Deps>);
    /**
     * Set a class name. Pass on with a falsy value to not apply the class.
     *
     * @param name - The class name to add/remove
     * @param on - Whether the class should be applied (true) or removed (false/falsy)
     * @returns The builder instance for chaining
     */
    cls(name: string, on?: '' | boolean | 0 | null): this;
    /**
     * Finalizes the builder and creates the actual DOM element with all configured properties.
     *
     * @returns A tuple containing the created element as the first item, followed by any child elements
     * @throws Error if a class name contains a '#' character
     */
    done(): [Elem, ...HTMLElement[]];
    ref(): Elem;
    /**
     * Sets the content of the element as a string, escaped by default.
     * Useful for quick and safe interpolation of strings into DOM content.
     *
     * @param value - String content to set
     * @returns The builder instance for chaining
     */
    content(value: string): this;
    /**
     * Sets a render function that will be called to generate content
     * whenever dependencies change.
     *
     * @param fn - The render function that returns content
     * @returns The builder instance for chaining
     */
    render(fn: RenderFunction<Elem, Deps>): this;
    /**
     * Sets a single attribute on the element.
     *
     * @param name - The attribute name
     * @param value - The attribute value. Set to empty string ('') to clear/reset an attribute.
     * @returns The builder instance for chaining
     */
    attr(name: string, value: string | boolean | number): this;
    /**
     * Sets multiple attributes on the element at once.
     *
     * @param value - An object containing attribute name-value pairs
     * @returns The builder instance for chaining
     */
    attrs(value: ElementProperties<Elem, Deps>['attrs']): this;
    /**
     * Sets whether the content value should be treated as raw HTML.
     *
     * @param value - If true, content will not be escaped before setting innerHTML
     * @returns The builder instance for chaining
     */
    raw(value: boolean): this;
    /**
     * Sets miscellaneous properties on the element (e.g. `input.checked`).
     *
     * @param obj - Either a property name or an object containing multiple properties
     * @param value - The value for the property if obj is a property name
     * @returns The builder instance for chaining
     */
    misc(obj: string, value: unknown): NuBuilder<Elem, Deps, Info>;
    misc(obj: Record<string, unknown>): NuBuilder<Elem, Deps, Info>;
    /**
     * Sets a single CSS style property on the element.
     *
     * @param prop - The CSS property name
     * @param value - The CSS property value. Set to empty string ('') to clear a style.
     * @returns The builder instance for chaining
     */
    style(prop: StringStyleProps, value: string): this;
    /**
     * Sets multiple CSS style properties on the element at once.
     *
     * @param value - An object containing style name-value pairs
     * @returns The builder instance for chaining
     */
    styles(value: ElementProperties<Elem, Deps>['style']): this;
    /**
     * Attaches an event handler to the element.
     *
     * @param type - The event type to listen for (e.g., 'click', 'submit')
     * @param handler - The event handler function
     * @returns The builder instance for chaining
     */
    on<K extends keyof HTMLElementEventMap>(type: K, handler: (event: HTMLElementEventMap[K]) => void): this;
    /**
     * Specifies selectors for elements that should be retrieved after building the element.
     *
     * @param selectors - A single selector string or an array of selector strings
     * @returns The builder instance for chaining
     */
    gimme(...selectors: string[]): this;
    deps<ND extends Record<string, Store<any>>>(obj: ND): NuBuilder<Elem, Deps & ND, Info>;
    /**
     * Unsafely set the html of the object. This is equivalent to calling
     * .content(...).raw(true) and is meant to be used with a templating function
     * like `cf.html`.
     * @param value The content function / string to set.
     * @returns The builder for chaining.
     */
    html(value: string): NuBuilder<Elem, Deps, Info>;
    html(arr: TemplateStringsArray, ...values: (string | number | boolean | RawHtml)[]): NuBuilder<Elem, Deps, Info>;
    /**
     * Mount reactive children into a parent element. The children are preserved
     * across re-renders and can be independently reactive.
     * @param children An object whose keys correspond to the `name` attributes
     * of cf-slot elements in the parent's innerHTML.
     * @returns The builder object for chaining.
     */
    children(children: Record<string, HTMLElement>): this;
}
