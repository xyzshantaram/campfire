export type Subscriber = (value: unknown) => void;
export type EventHandler = (e: Event) => unknown;

export interface ElementProperties {
    parent?: HTMLElement,
    type?: string,
    className?: string,
    id?: string,
    innerHTML?: string,
    innerText?: string,
    misc?: Record<string, unknown>,
    children?: Node[] | HTMLElement[] | Element[],
    style?: Record<string, unknown>,
    on?: Record<string, EventHandler>
}