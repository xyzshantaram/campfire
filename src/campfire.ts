import { ElementProperties, Subscriber } from './types';

function createElement(args: ElementProperties) {
    let { parent, type, className, id, innerHTML, misc, children, style, on: handlers } = args;
    
    if (!type) type = 'div';
    let elem = document.createElement(type);
    
    if (className) elem.className = className;
    if (id) elem.id = id;
    if (innerHTML) elem.innerHTML = innerHTML;
    if (misc) Object.assign(elem, misc);
    
    if (children) {
        for (const child of children) {
            elem.appendChild(child);
        }
    }
    
    if (style) Object.assign(elem.style, style);
    if (parent) parent.appendChild(elem);
    
    if (handlers) {
        for (const handler in handlers) {
            elem.addEventListener(handler, handlers[handler]);
        }
    }

    return elem;
}

class Store {
    value: unknown = null;
    subscribers: Record<string, Subscriber> = {};
    subscriberCount = 0;

    constructor(value: unknown) {
        this.value = value;
    }

    subscribe(fn: Subscriber): number {
        this.subscribers[this.subscriberCount] = fn;
        return ++this.subscriberCount;
    }

    unsubscribe(idx: number) {
        const str = idx.toString();
        if (Object.keys(this.subscribers).includes(str)) {
            delete this.subscribers[str];
        }
    }

    set(value: unknown) {
        this.value = value;
        for (const subscriber of Object.keys(this.subscribers)) {
            this.subscribers[subscriber](this.value);
        }
    }
}

export default {
    createElement, Store
}