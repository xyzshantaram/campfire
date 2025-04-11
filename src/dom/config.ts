// deno-lint-ignore-file no-window
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
  addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
}

/**
 * Define minimally required interface for HTMLElement constructor
 */
export interface CfHTMLElementConstructor {
  new(): CfHTMLElementInterface;
  prototype: CfHTMLElementInterface;
}

/**
 * Only the properties of HTMLElement that are actually used in Campfire.
 */
export type CfHTMLElementInterface = Pick<
  HTMLElement,
  'innerHTML' |
  'classList' |
  'setAttribute' |
  'getAttribute' |
  'hasAttribute' |
  'removeAttribute' |
  'addEventListener' |
  'style' |
  'id' |
  'tagName' |
  'className' |
  'attributes'
> & Node;

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
export class CfDom {
  // Use a different name for the private field to avoid naming conflicts with getter
  private static _document: CfDocumentInterface | null = null;
  private static _window: CfWindowInterface | null = null;
  private static _HTMLElement: CfHTMLElementConstructor | null = null;
  private static _initialized = false;
  static ssr: boolean = false;

  // Public accessor for document
  public static get document(): CfDocumentInterface | null {
    return CfDom._document;
  }

  /**
   * Initialize the shim by attempting to detect browser environment.
   * If in a browser, use the native DOM objects; otherwise, leave them unset.
   */
  public static initialize(): void {
    if (CfDom._initialized) return;

    try {
      // Check if we're in a browser environment
      if (typeof window !== 'undefined' && window.document) {
        CfDom._document = window.document;
        CfDom._window = window;
        CfDom._HTMLElement = window.HTMLElement;
      }
    } catch {
      // We're likely in a non-browser environment
    }

    CfDom._initialized = true;
  }

  /**
   * Configure the shim with custom DOM implementation.
   */
  public static configure(options: {
    document?: CfDocumentInterface;
    window?: CfWindowInterface;
    HTMLElement?: CfHTMLElementConstructor;
    ssr?: boolean;
  }): void {
    if (options.document) CfDom._document = options.document;
    if (options.window) CfDom._window = options.window;
    if (options.HTMLElement) CfDom._HTMLElement = options.HTMLElement;
    if (typeof options.ssr !== 'undefined') this.ssr = options.ssr;
    CfDom._initialized = true;
  }

  /**
   * Check if shim is properly configured.
   */
  private static ensureInitialized(): void {
    if (!CfDom._initialized) {
      CfDom.initialize();
    }

    CfDom.ensureAvailable(CfDom._document, 'document');
    CfDom.ensureAvailable(CfDom._window, 'window');
    CfDom.ensureAvailable(CfDom._HTMLElement, 'HTMLElement');
  }

  /**
   * Throws an error if the specified object is not available.
   */
  private static ensureAvailable(obj: any, name: string): void {
    if (!obj) {
      throw new Error(`CfDom: ${name} is not available.` +
        'Please configure CfDom with a valid DOM implementation.');
    }
  }

  // Document methods
  public static createElement(tagName: string): HTMLElement {
    CfDom.ensureInitialized();
    return CfDom._document!.createElement(tagName);
  }

  public static createDocumentFragment(): DocumentFragment {
    CfDom.ensureInitialized();
    return CfDom._document!.createDocumentFragment();
  }

  public static querySelector(selector: string, node?: ParentNode): Element | null {
    CfDom.ensureInitialized();
    const n = node ?? CfDom._document!;
    return n.querySelector(selector);
  }

  public static querySelectorAll(selector: string, node?: ParentNode): NodeListOf<Element> {
    CfDom.ensureInitialized();
    const n = node ?? CfDom._document!;
    return n.querySelectorAll(selector);
  }

  public static get body(): HTMLElement {
    CfDom.ensureInitialized();
    return CfDom._document!.body;
  }

  /**
   * Add event listener with SSR protection
   * This is one of the few element methods we keep as it has special SSR handling
   */
  public static addElEventListener(
    el: EventTarget,
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void {
    CfDom.ensureInitialized();
    if (this.isSsr()) throw new Error("Event listeners are not available in SSR contexts!");
    el.addEventListener(type, listener, options);
  }

  // Additional helpers
  public static isHTMLElement(obj: any): obj is HTMLElement {
    CfDom.ensureInitialized();
    return obj instanceof CfDom._HTMLElement!;
  }

  /**
   * Check if code is running in a browser environment.
   * This can be useful for conditional logic based on environment.
   */
  public static isBrowser(): boolean {
    return typeof window !== 'undefined' && !!window.document;
  }

  /**
   * Check if DOM shim is using a custom (non-browser) implementation.
   */
  public static isUsingCustomDOMImplementation(): boolean {
    CfDom.ensureInitialized();
    return CfDom._document !== null &&
      (typeof window === 'undefined' || CfDom._document !== window.document);
  }

  public static isSsr(value?: boolean): boolean {
    if (typeof value !== 'undefined') return this.ssr = value;
    return this.ssr;
  }

  public static addGlobalEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void {
    this.ensureInitialized();
    if (this.isSsr()) throw new Error("Event listeners are not available in SSR contexts!");
    return CfDom._window!.addEventListener(type, listener, options);
  }
}

// Initialize on import
CfDom.initialize();