import { ListStore } from "./ListStore.ts";
import { MapStore } from "./MapStore.ts";
import { Store } from "./Store.ts";
export type StoreInitializer<T> = {
    type: 'list';
    value?: Array<T>;
} | {
    type: 'map';
    value?: Record<string, T>;
} | {
    value?: T;
};
export declare function store<T>(opts: {
    type: 'list';
    value?: T[];
}): ListStore<T>;
export declare function store<T>(opts: {
    type: 'map';
    value?: Record<string, T>;
}): MapStore<T>;
export declare function store<T>(opts: {
    value?: T;
}): Store<T>;
export { Store, ListStore, MapStore };
