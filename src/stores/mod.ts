import { ListStore } from "./ListStore.ts";
import { MapStore } from "./MapStore.ts";
import { Store } from "./Store.ts";

export type StoreInitializer<T> = {
    type: 'list',
    value?: Array<T>,
} | {
    type: 'map',
    value?: Record<string, T>
} | {
    value?: T
}

export const store = <T>(opts: StoreInitializer<T>) => {
    if ('type' in opts) {
        if (opts.type === 'list') return new ListStore(opts.value);
        else if (opts.type === 'map') return new MapStore(opts.value);
    }
    return new Store<T>(opts.value);
}

export { MapStore, ListStore, Store };