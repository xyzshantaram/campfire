import { Store } from "../stores/mod.ts";
import { ElementProperties, InferElementType, RenderFunction, StringStyleProps, TagStringParseResult, DOMEventHandlers } from "../types.ts";
import { extend } from "./nu";


const createTypedElement = <K extends keyof HTMLElementTagNameMap>(name: K) => {
    return document.createElement(name);
}

/**
 * 
 * @param str A string to parse, of the form tag#id.classes[.classes].
 * @returns A `TagStringParseResult` object containing the parsed information.
 * @internal
 */
const parseEltString = (str: string | undefined): TagStringParseResult => {
    const matches = str ? str.match(/([0-9a-zA-Z\-]*)?(#[0-9a-zA-Z\-]*)?((.[0-9a-zA-Z\-]+)*)/) : undefined;
    const results = matches ? matches.slice(1, 4)?.map((elem) => elem ? elem.trim() : undefined) : Array(3).fill(undefined);

    if (results && results[1]) results[1] = results[1].replace(/#*/g, "");

    return matches ? {
        tag: results[0] || undefined,
        id: results[1] || undefined,
        classes: results[2] ? results[2].split('.').filter((elem: string) => elem.trim()) : undefined
    } : {};
};

export class NuBuilder<T extends string, E extends InferElementType<T>, D extends Record<string, Store<any>>> {
    props: ElementProperties<E, D>;
    info: T;

    constructor(info: T, props?: ElementProperties<E, D>) {
        if (props) this.props = props;
        this.info = info;
    }

    done(): [E, ...HTMLElement[]] {
        let { tag, id, classes = [] } = parseEltString(this.info);

        if (classes?.some((itm) => itm.includes('#'))) {
            throw new Error(
                "Error: Found # in a class name. " +
                "Did you mean to do elt#id.classes instead of elt.classes#id?"
            );
        }

        if (!tag) tag = 'div';
        const elem = createTypedElement(tag as keyof HTMLElementTagNameMap);

        if (id) elem.id = id;
        classes.forEach((cls) => elem.classList.add(cls));

        return extend(elem as E, this.props);
    }

    content(value: string | RenderFunction<E, D>) {
        this.props.contents = value;
        return this;
    }

    attr(name: string, value: string | boolean | number) {
        this.props.attrs ||= {};
        this.props.attrs[name] = value.toString();
        return this;
    }

    attrs(value: Required<ElementProperties<E, D>['attrs']>) {
        this.props.attrs = value;
        return this;
    }

    raw(value: boolean) {
        this.props.raw = value;
        return this;
    }

    misc(obj: string, value: unknown): NuBuilder<T, E, D>;
    misc(obj: Record<string, unknown>): NuBuilder<T, E, D>;
    misc(obj: string | Record<string, unknown>, value?: unknown): NuBuilder<T, E, D> {
        this.props.misc ||= {};
        if (typeof obj === 'object') this.props.misc = obj;
        else this.props.misc[obj] = value;
        return this;
    }

    style(prop: StringStyleProps, value: string) {
        this.props.style ||= {};
        this.props.style[prop] = value;
        return this;
    }

    styles(value: Required<ElementProperties<E, D>['style']>) {
        this.props.style = value;
        return this;
    }

    on<K extends keyof HTMLElementEventMap>(type: K, handler: (event: HTMLElementEventMap[K]) => void) {
        this.props.on ||= {};
        this.props.on[type] = handler as DOMEventHandlers[K];
        return this;
    }

    gimme(selectors: string | string[]) {
        this.props.gimme ||= [];
        if (Array.isArray(selectors)) this.props.gimme = selectors;
        else this.props.gimme.push(selectors);
        return this;
    }
}