// deno-lint-ignore-file no-window
/**
 * DOMShim provides a configurable interface for DOM operations.
 * 
 * This allows Campfire to work in both browser environments 
 * (using native DOM) and server environments (using a DOM implementation
 * like jsdom or happy-dom).
 * 
 * Usage examples:
 * 
 * 1. Browser environment (automatic initialization):
 *    ```ts
 *    import { DOMShim } from './dom/config';
 *    
 *    // Methods are already initialized with browser DOM
 *    const element = DOMShim.createElement('div');
 *    DOMShim.setInnerHTML(element, 'Hello world');
 *    ```
 * 
 * 2. Server-side rendering with custom DOM implementation:
 *    ```ts
 *    import { DOMShim } from './dom/config';
 *    import { JSDOM } from 'jsdom';
 *    
 *    // Setup a custom DOM environment
 *    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
 *    
 *    // Configure DOMShim to use jsdom
 *    DOMShim.configure({
 *      document: dom.window.document,
 *      window: dom.window,
 *      HTMLElement: dom.window.HTMLElement
 *    });
 *    
 *    // Now use the shim methods with jsdom backing
 *    const element = DOMShim.createElement('div');
 *    ```
 */
export class CfDom {
  private static _document: Document | null = null;
  private static _window: Window | null = null;
  private static _HTMLElement: typeof HTMLElement | null = null;
  private static _initialized = false;
  static ssr: boolean = false;

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
    document?: Document;
    window?: Window;
    HTMLElement?: typeof HTMLElement;
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
      throw new Error(`DOMShim: ${name} is not available.` +
        'Please configure DOMShim with a valid DOM implementation.');
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

  // Element methods
  public static setInnerHTML(el: Element, html: string): void {
    CfDom.ensureInitialized();
    el.innerHTML = html;
  }

  public static getInnerHTML(el: Element): string {
    CfDom.ensureInitialized();
    return el.innerHTML;
  }

  public static addClasses(el: Element, ...classNames: string[]): void {
    CfDom.ensureInitialized();
    classNames.forEach(cls => el.classList.add(cls));
  }

  public static appendChild(parent: Node, child: Node): Node {
    CfDom.ensureInitialized();
    return parent.appendChild(child);
  }

  public static getElParentNode(el: Node): Node | null {
    CfDom.ensureInitialized();
    return el.parentNode;
  }

  public static insertBefore(parent: Node, newNode: Node, referenceNode: Node | null): Node {
    CfDom.ensureInitialized();
    return parent.insertBefore(newNode, referenceNode);
  }

  public static getElFirstChild(el: Node): Node | null {
    CfDom.ensureInitialized();
    return el.firstChild;
  }

  public static getElNextSibling(el: Node): Node | null {
    CfDom.ensureInitialized();
    return el.nextSibling;
  }

  public static remove(el: Element): void {
    CfDom.ensureInitialized();
    el.remove();
  }

  public static replaceWith(el: Element, ...nodes: (Node | string)[]): void {
    CfDom.ensureInitialized();
    el.replaceWith(...nodes);
  }

  public static setAttribute(el: Element, name: string, value: string): void {
    CfDom.ensureInitialized();
    el.setAttribute(name, value);
  }

  public static getAttribute(el: Element, name: string): string | null {
    CfDom.ensureInitialized();
    return el.getAttribute(name);
  }

  public static hasAttribute(el: Element, name: string): boolean {
    CfDom.ensureInitialized();
    return el.hasAttribute(name);
  }

  public static removeAttribute(el: Element, name: string): void {
    CfDom.ensureInitialized();
    el.removeAttribute(name);
  }

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

  public static setStyle(el: HTMLElement, property: string, value: string): void {
    CfDom.ensureInitialized();
    (el.style as any)[property] = value;
  }

  public static setStyles(el: HTMLElement, styles: Record<string, string>): void {
    CfDom.ensureInitialized();
    Object.assign(el.style, styles);
  }

  public static setId(el: Element, id: string): void {
    CfDom.ensureInitialized();
    (el as HTMLElement).id = id;
  }

  public static getId(el: Element): string {
    CfDom.ensureInitialized();
    return (el as HTMLElement).id;
  }

  public static getTagName(el: Element): string {
    CfDom.ensureInitialized();
    return el.tagName;
  }

  public static getClassName(el: Element): string {
    CfDom.ensureInitialized();
    return (el as HTMLElement).className;
  }

  public static setClassName(el: Element, className: string): void {
    CfDom.ensureInitialized();
    (el as HTMLElement).className = className;
  }

  public static getAttributes(el: Element): NamedNodeMap {
    CfDom.ensureInitialized();
    return el.attributes;
  }

  // Additional helpers
  public static isHTMLElement(obj: any): boolean {
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