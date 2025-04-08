import { Store } from "../stores/mod.ts";
import type { ElementProperties, InferElementType, RenderFunction, StringStyleProps } from "../types.ts";
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
export declare class NuBuilder<T extends string, E extends InferElementType<T>, D extends Record<string, Store<any>>> {
    /** Element properties configuration object */
    props: ElementProperties<E, D>;
    /** Element info string (tag, id, classes) */
    info: T;
    /**
     * Creates a new NuBuilder instance.
     *
     * @param info - A string describing the element in the format 'tag#id.class1.class2'
     * @param props - Optional initial properties for the element
     */
    constructor(info: T, props?: ElementProperties<E, D>);
    /**
     * Finalizes the builder and creates the actual DOM element with all configured properties.
     *
     * @returns A tuple containing the created element as the first item, followed by any child elements
     * @throws Error if a class name contains a '#' character
     */
    done(): [E, ...HTMLElement[]];
    /**
     * Sets the content of the element.
     *
     * @param value - Either a string of content or a render function that returns content
     * @returns The builder instance for chaining
     */
    content(value: string | RenderFunction<E, D>): this;
    /**
     * Sets a single attribute on the element.
     *
     * @param name - The attribute name
     * @param value - The attribute value
     * @returns The builder instance for chaining
     */
    attr(name: string, value: string | boolean | number): this;
    /**
     * Sets multiple attributes on the element at once.
     *
     * @param value - An object containing attribute name-value pairs
     * @returns The builder instance for chaining
     */
    attrs(value: ElementProperties<E, D>['attrs']): this;
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
    misc(obj: string, value: unknown): NuBuilder<T, E, D>;
    misc(obj: Record<string, unknown>): NuBuilder<T, E, D>;
    /**
     * Sets a single CSS style property on the element.
     *
     * @param prop - The CSS property name
     * @param value - The CSS property value
     * @returns The builder instance for chaining
     */
    style(prop: StringStyleProps, value: string): this;
    /**
     * Sets multiple CSS style properties on the element at once.
     *
     * @param value - An object containing style name-value pairs
     * @returns The builder instance for chaining
     */
    styles(value: ElementProperties<E, D>['style']): this;
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
    deps<ND extends Record<string, Store<any>>>(obj: ND): NuBuilder<T, E, D & ND>;
    /**
     * Unsafely set the html of the object. This is equivalent to calling
     * .content(...).raw(true) and is meant to be used with a templating function
     * like `cf.html`.
     * @param value The content function / string to set.
     * @returns The builder for chaining.
     */
    html(value: string | RenderFunction<E, D>): this;
    /**
     * Mount reactive children into a parent element. The children are preserved
     * across re-renders and can be independently reactive.
     * @param children An object whose keys correspond to the `name` attributes
     * of cf-slot elements in the parent's innerHTML.
     * Only the first child for each key will be appended.
     * @returns The builder object for chaining.
     */
    children(children: Record<string, HTMLElement[]>): this;
}
