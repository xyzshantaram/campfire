export type Subscriber = (value: unknown) => void;
export type EventHandler = (e: Event) => unknown;

export interface ElementProperties {
    innerHTML?: string,
    i?: string,

    misc?: Record<string, unknown>,
    m?: Record<string, unknown>,

    style?: Record<string, unknown>,
    s?: Record<string, unknown>,

    on?: Record<string, EventHandler>,

    attrs?: Record<string, string>,
    a?: Record<string, string>
}