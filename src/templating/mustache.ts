import { escape } from '../utils.ts';

/**
 * Represents a plain text token in a mustache template
 */
interface TextToken {
    type: 'text',
    value: string
};

/**
 * Represents a section token (opening or closing) in a mustache template
 */
type SectionToken = { key: string } & ({
    type: 'section-open';
    inverted: boolean;
} | {
    type: 'section-close';
});

/**
 * Represents a variable token in a mustache template
 */
interface VariableToken {
    type: 'var',
    key: string,
    unescaped: boolean;
}

/**
 * Union type for all possible mustache token types
 */
type MustacheToken = (SectionToken | TextToken | VariableToken);

/**
 * Tokenizes a mustache template string into individual tokens
 * 
 * @param template - The template string to tokenize
 * @returns An array of tokens representing the template
 */
const tokenize = (template: string) => {
    const re = /\\?({{{\s*([^}]+)\s*}}}|{{[#^/]?\s*([^}]+)\s*}})/g;
    let index = 0;
    const tokens: MustacheToken[] = [];
    let match = re.exec(template);

    while (match !== null) {
        const [chunk, mustache, unsafeKey, key] = match;
        const escaped = chunk.startsWith('\\');
        const tag = chunk.length > 2 ? chunk[2] : null;

        if (index < match.index) {
            tokens.push({ type: 'text', value: template.slice(index, match.index) });
        }
        if (escaped) {
            tokens.push({ type: 'text', value: mustache });
        }
        else if (tag === '/') {
            tokens.push({ type: 'section-close', key });
        }
        else if (tag === '#' || tag === '^') {
            tokens.push({ type: 'section-open', key: key?.trim(), inverted: tag === '^' });
        }
        else {
            tokens.push({ type: 'var', key: (unsafeKey || key)?.trim(), unescaped: !!unsafeKey });
        }

        index = re.lastIndex;
        match = re.exec(template);
    }

    if (index < template.length) {
        tokens.push({ type: 'text', value: template.slice(index) });
    }

    return tokens;
}

/**
 * Represents a compiled section in a mustache template
 */
interface CompiledSection {
    type: 'section';
    inverted: boolean;
    key: string;
    children: CompiledToken[]
}

/**
 * Union type for all compiled token types
 */
type CompiledToken = TextToken | VariableToken | CompiledSection

/**
 * Transforms a flat array of tokens into a nested structure with proper section hierarchy
 * 
 * @param tokens - The flat array of tokens to nest
 * @returns A nested token tree representing the template structure
 * @throws Error if sections are improperly nested or unclosed
 */
function nest(tokens: MustacheToken[]) {
    const root: CompiledToken[] = [];
    const stack = [root];

    for (const token of tokens) {
        if (token.type === 'section-open') {
            const section: CompiledSection = {
                type: 'section',
                key: token.key,
                inverted: token.inverted,
                children: []
            };

            stack.at(-1)?.push(section);
            stack.push(section.children);
        }
        else if (token.type === 'section-close') {
            if (stack.length === 1) throw new Error(`Unexpected closing tag ${token.key}`);
            stack.pop();
        }
        else {
            stack.at(-1)?.push(token);
        }
    }

    if (stack.length > 1) {
        throw new Error(`Unclosed section(s) found`);
    }

    return root;
}

/**
 * Compiles a mustache template string into a token tree
 * 
 * @param template - The template string to compile
 * @returns A compiled token tree representing the template
 */
const compile = (template: string) => nest(tokenize(template));

/**
 * Renders a compiled token tree with the provided context data
 * 
 * @param tokens - The compiled token tree to render
 * @param ctx - The context object containing data for rendering
 * @param parentCtx - Optional parent context for nested rendering
 * @returns The rendered string result
 */
const render = <
    T extends Record<string, any>
>(tokens: CompiledToken[], ctx: T, parentCtx?: Record<string, any>): string => tokens.map(token => {
    switch (token.type) {
        case "text":
            return token.value;
        case "var": {
            if (token.key === '.' && '.' in ctx) {
                return token.unescaped
                    ? String(ctx['.'])
                    : escape(String(ctx['.']));
            }

            if (!(token.key in ctx)) {
                return token.unescaped ? `{{{ ${token.key} }}}` : `{{ ${token.key} }}`;
            }

            const val = String(ctx[token.key]);
            return token.unescaped ? val : escape(val);
        }
        case "section": {
            const v = ctx[token.key];
            let visible = !!v;

            if (token.inverted) {
                visible = (v === null || v === false || typeof v === 'undefined' ||
                    (Array.isArray(v) && v.length === 0));
            }

            if (!visible) return '';
            if (token.inverted) return render(token.children, ctx, parentCtx);

            if (Array.isArray(v)) return v
                .map(item => render(token.children, typeof item === 'object' ? item : { '.': item }, ctx)
                ).join('');

            else if (typeof v === 'object' && v !== null)
                return render(token.children, v, ctx);
            else
                return render(token.children, ctx, parentCtx);
        }
    }
}).join('');

/**
 * Renders a mustache template with the provided context data.
 * 
 * @param template - The template string to render
 * @param ctx - The context object containing data for rendering
 * @returns The rendered string result
 * 
 * @example
 * ```js
 * const result = mustache("Hello, {{ name }}!", { name: "World" });
 * // result: "Hello, World!"
 * ```
 * 
 * @example Using sections
 * ```js
 * const result = mustache(
 *   "{{#show}}Visible{{/show}} {{^hide}}Also Visible{{/hide}}",
 *   { show: true, hide: false }
 * );
 * // result: "Visible Also Visible"
 * ```
 * 
 * @example Using array iteration
 * ```js
 * const result = mustache(
 *   "Items: {{#items}}{{name}}{{/items}}",
 *   { items: [{ name: "one" }, { name: "two" }] }
 * );
 * // result: "Items: onetwo"
 * ```
 */
export const mustache = <
    T extends Record<string, any> = Record<string, any>
>(template: string, ctx: T): string => {
    return render<T>(compile(template), ctx);
}

/**
 * Creates a reusable template function from a mustache template string.
 * 
 * @param template - The template string to compile
 * @returns A function that accepts a context object and returns the rendered string
 * 
 * @example
 * ```js
 * const greet = template("Hello, {{ name }}!");
 * const result1 = greet({ name: "Alice" }); // "Hello, Alice!"
 * const result2 = greet({ name: "Bob" });   // "Hello, Bob!"
 * ```
 */
export const template = <
    T extends Record<string, any> = Record<string, any>
>(template: string): (ctx: T) => string => {
    const compiled = compile(template);
    return (ctx) => render<T>(compiled, ctx);
}
