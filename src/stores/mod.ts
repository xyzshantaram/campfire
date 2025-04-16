import { ListStore } from "./ListStore.ts";
import { MapStore } from "./MapStore.ts";
import { Store } from "./Store.ts";

export type StoreInitializer<T> =
    | { type: "list"; value?: Array<T> }
    | { type: "map"; value?: Record<string, T> }
    | { value?: T };

export function store<T>(opts: { type: "list"; value?: T[] }): ListStore<T>;
export function store<T>(
    opts: { type: "map"; value?: Record<string, T> },
): MapStore<T>;
export function store<T>(opts: { value: T }): Store<T>;
export function store<T>(opts: { value?: T }): Store<T | undefined>;
export function store<T>(opts: StoreInitializer<T>): Store<any> {
    if ("type" in opts) {
        if (opts.type === "list") return new ListStore(opts.value);
        if (opts.type === "map") return new MapStore(opts.value);
    }
    return new Store(opts.value);
}

export { ListStore, MapStore, Store };
