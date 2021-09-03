export type Subscriber = (value: unknown) => void;
export type EventHandler = (e: Event) => unknown;

export interface ElementProperties {
    tag?: string,
    className?: string,
    id?: string,
    innerHTML?: string,
    misc?: Record<string, unknown>,
    style?: Record<string, unknown>,
    on?: Record<string, EventHandler>,
    attrs?: Record<string, string>
}