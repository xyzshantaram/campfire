import { JSDOM } from 'jsdom';
import { use } from 'chai';
import chaiDom from 'chai-dom';

const dom = new JSDOM(`<!DOCTYPE html><body></body>`, {
    url: "http://localhost/",
    pretendToBeVisual: true,
});

const { window } = dom;

// Define globals if they don't exist or are writable
function defineGlobal(name: string, value: unknown) {
    if (!(name in globalThis)) {
        (globalThis as any)[name] = value;
    } else {
        try {
            Object.defineProperty(globalThis, name, {
                value,
                configurable: true,
                writable: true,
            });
        } catch {
            // Read-only global, can't redefine — ignore
        }
    }
}

defineGlobal('window', window);
defineGlobal('document', window.document);
defineGlobal('HTMLElement', window.HTMLElement);
defineGlobal('Event', window.Event);
defineGlobal('getComputedStyle', window.getComputedStyle);
defineGlobal('MouseEvent', window.MouseEvent);
defineGlobal('MutationObserver', window.MutationObserver);

use(chaiDom);
