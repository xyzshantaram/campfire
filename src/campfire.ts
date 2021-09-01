import { ElementProperties, Subscriber } from './types';

const create = (args: ElementProperties) => {
    let { parent, type, className, id, innerHTML, misc, children, style, on: handlers, attrs } = args;

    if (!type) type = 'div';
    let elem = document.createElement(type);

    if (className) elem.className = className;
    if (id) elem.id = id;
    if (innerHTML) elem.innerHTML = innerHTML;
    if (misc) Object.assign(elem, misc);

    if (children) {
        if (children instanceof HTMLCollection) {
            children = Array.from(children);
        }
        children.forEach((child) => elem.appendChild(child));
    }

    if (style) Object.assign(elem.style, style);
    if (parent) parent.appendChild(elem);

    if (handlers) {
        for (const handler in handlers) {
            elem.addEventListener(handler, handlers[handler]);
        }
    }

    if (attrs) {
        for (const attr in attrs) {
            elem.setAttribute(attr, attrs[attr]);
        }
    }

    return elem;
}

class Store {
    value: unknown = null;
    subscribers: Record<string, Subscriber> = {};
    subscriberCount = 0;
    dead = false;

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

    update(value: unknown) {
        if (this.dead) return;

        this.value = value;
        for (const subscriber of Object.keys(this.subscribers)) {
            this.subscribers[subscriber](this.value);
        }
    }

    dispose() {
        this.dead = true;
    }
}

export default {
    Store, create
}