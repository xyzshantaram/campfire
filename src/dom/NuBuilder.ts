import { Store } from "../stores/mod.ts";
import { ElementProperties, InferElementType, TagStringParseResult } from "../types.ts";
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
}