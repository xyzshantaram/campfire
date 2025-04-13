import { escape } from '../utils.ts';

interface TextToken {
    type: 'text',
    value: string
};

type SectionToken = { key: string } & ({
    type: 'section-open';
    inverted: boolean;
} | {
    type: 'section-close';
});

interface VariableToken {
    type: 'var',
    key: string,
    unescaped: boolean;
}

type MustacheToken = (SectionToken | TextToken | VariableToken);

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

interface CompiledSection {
    type: 'section';
    inverted: boolean;
    key: string;
    children: CompiledToken[]
}
type CompiledToken = TextToken | VariableToken | CompiledSection

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

const compile = (template: string) => nest(tokenize(template));

const render = <
    T extends Record<string, any>
>(tokens: CompiledToken[], ctx: T): string => tokens.map(token => {
    switch (token.type) {
        case "text":
            return token.value;
        case "var":
            if (!(token.key in ctx)) {
                return token.unescaped ? `{{{ ${token.key} }}}` : `{{ ${token.key} }}`;
            }
            return token.unescaped ? String(ctx[token.key]) : escape(ctx[token.key]);
        case "section": {
            const v = ctx[token.key];
            const visible = token.inverted ? (!v || Array.isArray(v) && v.length === 0) : !!v;
            if (!visible) return '';

            if (Array.isArray(v)) {
                return v.map(item =>
                    render(token.children, typeof item === 'object' ? item : { '.': item }))
                    .join('')
            }
            else if (typeof v === 'object') {
                return render(token.children, v);
            }
            else {
                return render(token.children, ctx);
            }
        }
    }
}).join('');

export const mustache = <
    T extends Record<string, any> = Record<string, any>
>(template: string, ctx: T): string => {
    return render<T>(compile(template), ctx);
}

export const template = <
    T extends Record<string, any> = Record<string, any>
>(template: string): (ctx: T) => string => {
    const compiled = compile(template);
    return (ctx) => render<T>(compiled, ctx);
}