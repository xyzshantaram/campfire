/**
 * Define minimally required interface for Document implementation
 * This includes only the methods and properties we actually use
 */
export interface CfDocumentInterface {
    createElement(tagName: string): HTMLElement;
    createDocumentFragment(): DocumentFragment;
    querySelector(selectors: string): Element | null;
    querySelectorAll(selectors: string): NodeListOf<Element>;
    body: HTMLElement;
}
/**
 * Define minimally required interface for Window implementation
 * This includes only the methods and properties we actually use
 */
export interface CfWindowInterface {
    document: Document;
}
/**
 * Define minimally required interface for HTMLElement constructor
 */
export interface CfHTMLElementConstructor {
    new (): CfHTMLElementInterface;
    prototype: CfHTMLElementInterface;
}
/**
 * Only the properties of HTMLElement that are actually used in Campfire.
 */
export type CfHTMLElementInterface = Pick<HTMLElement, 'innerHTML' | 'classList' | 'setAttribute' | 'getAttribute' | 'hasAttribute' | 'removeAttribute' | 'addEventListener' | 'style' | 'id' | 'tagName' | 'className' | 'attributes'> & Node;
/**
 * DOMShim provides a configurable interface for core DOM operations.
 *
 * This allows Campfire to work in both browser environments
 * (using native DOM) and server environments (using a DOM implementation
 * like jsdom or happy-dom).
 *
 * Usage examples:
 *
 * 1. Browser environment (automatic initialization):
 *    ```ts
 *    import { CfDom } from './dom/config';
 *
 *    // Methods are already initialized with browser DOM
 *    const element = CfDom.createElement('div');
 *    element.innerHTML = 'Hello world';
 *    ```
 *
 * 2. Server-side rendering with custom DOM implementation:
 *    ```ts
 *    import { CfDom } from './dom/config';
 *    import { JSDOM } from 'jsdom';
 *
 *    // Setup a custom DOM environment
 *    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
 *
 *    // Configure CfDom to use jsdom
 *    CfDom.configure({
 *      document: dom.window.document,
 *      window: dom.window,
 *      HTMLElement: dom.window.HTMLElement
 *    });
 *
 *    // Now use the shim methods with jsdom backing
 *    const element = CfDom.createElement('div');
 *    ```
 *
 * Note: This implementation uses a "minimal API" approach, where only document-level
 * methods (createElement, querySelector, etc.) are provided by CfDom, and element-level
 * operations are performed directly on the elements themselves.
 */
export declare class CfDom {
    private static _document;
    private static _window;
    private static _HTMLElement;
    private static _initialized;
    static ssr: boolean;
    static get document(): CfDocumentInterface | null;
    /**
     * Initialize the shim by attempting to detect browser environment.
     * If in a browser, use the native DOM objects; otherwise, leave them unset.
     */
    static initialize(): void;
    /**
     * Configure the shim with custom DOM implementation.
     */
    static configure(options: {
        document?: CfDocumentInterface;
        window?: CfWindowInterface;
        HTMLElement?: CfHTMLElementConstructor;
        ssr?: boolean;
    }): void;
    /**
     * Check if shim is properly configured.
     */
    private static ensureInitialized;
    /**
     * Throws an error if the specified object is not available.
     */
    private static ensureAvailable;
    static createElement(tagName: string): HTMLElement;
    static createDocumentFragment(): DocumentFragment;
    static querySelector(selector: string, node?: ParentNode): Element | null;
    static querySelectorAll(selector: string, node?: ParentNode): NodeListOf<Element>;
    static get body(): HTMLElement;
    /**
     * Add event listener with SSR protection
     * This is one of the few element methods we keep as it has special SSR handling
     */
    static addElEventListener(el: EventTarget, type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
    static isHTMLElement(obj: any): obj is HTMLElement;
    /**
     * Check if code is running in a browser environment.
     * This can be useful for conditional logic based on environment.
     */
    static isBrowser(): boolean;
    /**
     * Check if DOM shim is using a custom (non-browser) implementation.
     */
    static isUsingCustomDOMImplementation(): boolean;
    static isSsr(value?: boolean): boolean;
}
