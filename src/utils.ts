import { CfDom } from "./dom/config.ts";
import type { CfHTMLElementInterface } from './dom/config.ts';

/**
 * a simple HTML sanitizer. Escapes `&`, `<`, `>`, `'`, and `"` by 
 * replacing them with their corresponding HTML escapes 
 * (`&amp;`,`&gt;`, `&lt;`, `&#39;`, and `&quot`).
 * @param str A string to escape.
 * @returns The escaped string.
 * No characters other than the ones mentioned above are escaped.
 * `escape` is only provided for basic protection against XSS and if you need more
 * robust functionality consider using another HTML escaper (such as
 * [he](https://github.com/mathiasbynens/he) or 
 * [sanitize-html](https://github.com/apostrophecms/sanitize-html)).
 */
export const escape = (str: string) => {
    if (!str) return '';

    return str.replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

/**
 * Unescapes the output of escape() by replacing `&amp;`, `&gt;`, `&lt;`,
 * `&#39;`, and `&quot` with `&`, `<`, `>`, `'`, and `"` respectively.
 * @param str A string to unescape.
 * @returns The string, with its character references replaced by the characters it references.
 * No characters other than the ones mentioned above are unescaped.
 */
export const unescape = (str: string) => {
    if (!str) return '';
    const expr = /&(?:amp|lt|gt|quot|#(0+)?39);/g;

    const entities: Record<string, string> = {
        '&amp;': '&',
        '&lt;': '<',
        '&gt;': '>',
        '&quot;': '"',
        '&#39;': "'"
    };

    return str.replace(expr, (entity) => entities[entity] || '\'');
}

export const seq = (...args: number[]) => {
    let start = 0, stop = args[0], step = 1;
    if (typeof args[1] !== 'undefined') {
        start = args[0];
        stop = args[1];
    }

    if (args[2]) step = args[2];
    const result = [];
    for (let i = start; i < stop; i += step) {
        result.push(i);
    }

    return result;
}

const fmtNode = (node: CfHTMLElementInterface) => {
    const result = ['<'];
    result.push(node.tagName.toLowerCase());
    if (node.id) result.push(`#${node.id}`);
    if (node.className.trim()) result.push(`.${node.className.split(' ').join('.')}`);
    result.push(...Array.from(node.attributes)
        .map(attr => `${attr.name}="${attr.value}"`)
        .slice(0, 3) // limit to 3 attributes
        .join(' '));
    return result.join('');
}

export const initMutationObserver = () => {
    if (!CfDom.isBrowser()) return;
    const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            mutation.addedNodes.forEach(node => {
                if (!CfDom.isHTMLElement(node)) return;

                // Check parent is reactive
                const parent = mutation.target as HTMLElement;
                console.log(parent, node);
                if (!parent.hasAttribute('data-cf-deps')) return;
                if (parent.hasAttribute('data-cf-fg-updates')) return;

                // Check if added node (or its children) are also reactive
                const reactiveChildren = node.querySelectorAll?.('[data-cf-deps]').length ?? 0;
                if (!node.hasAttribute('data-cf-deps') && reactiveChildren === 0) return;

                console.warn(`[Campfire] ⚠️ A reactive node ${fmtNode(node)} was inserted into a reactive ` +
                    `container ${fmtNode(parent)} This may cause it to be wiped on re-render.`);
            });
        }
    });

    if (!CfDom.body.hasAttribute('cf-disable-mo'))
        observer.observe(CfDom.body, { childList: true, subtree: true });
}

type Callback<U, E> = (err: E | null, res: U | null) => void;
type Callbackified<T extends any[], U, E> = (cb: Callback<U, E>, ...args: T) => void;

export const callbackify = <T extends any[], U = unknown, E = any>(
    fn: (...args: T) => Promise<U>
): Callbackified<T, U, E> => {
    return (cb, ...args) => {
        fn(...args)
            .then((v) => cb(null, v))
            .catch(err => cb(err, null));
    };
}

export const poll = (fn: () => void, interval: number, callNow = false) => {
    let timeout: number | null = null;
    const handler = () => {
        try {
            fn();
        }
        finally {
            timeout = setTimeout(handler, interval);
        }
    }
    if (callNow) handler();
    else timeout = setTimeout(handler, interval);
    return () => {
        if (timeout !== null) clearTimeout(timeout);
    }
}