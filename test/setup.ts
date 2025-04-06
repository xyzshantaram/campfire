// test/setup.ts
import { use } from 'chai';
import chaiDom from 'chai-dom';
import { DOMSelector } from '@asamuzakjp/dom-selector';

use(chaiDom);

// Extend global JSDOM window with DOMSelector shortcuts
if (typeof window !== 'undefined') {
    const domSelector = new DOMSelector(window, window.document);
    globalThis.$ = domSelector.querySelector;
    globalThis.$$ = domSelector.querySelectorAll;
    globalThis.closest = domSelector.closest;
    globalThis.matches = domSelector.matches;
}
