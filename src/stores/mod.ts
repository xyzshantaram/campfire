import { ListStore } from "./ListStore.ts";
import { MapStore } from "./MapStore.ts";
import { Store } from "./Store.ts";

export type StoreInitializer<T> =
    | { type: "list"; value?: Array<T> }
    | { type: "map"; value?: Record<string, T> }
    | { value?: T };

/**
 * Flexible reactive store creator.
 *
 * This function can be used to create reactive containers (stores) for values, lists, or maps. The signature
 * is overloaded to support each kind:
 *
 * @example
 * ```ts
 * // Scalar store
 * import { store } from "@/campfire.ts";
 * const n = store({ value: 42 });
 * n.update(69);
 * console.log(n.current()); // 69
 * ```
 *
 * @example
 * ```ts
 * // List store
 * import { store } from "@/campfire.ts";
 * const todos = store({ type: "list", value: ["A", "B"] });
 * todos.push("C");
 * console.log(todos.current()); // ["A", "B", "C"]
 * ```
 *
 * @example
 * ```ts
 * // Map store
 * import { store } from "@/campfire.ts";
 * const users = store({ type: "map", value: { sid: true } });
 * users.set("alex", false);
 * console.log(users.current()); // { sid: true, alex: false }
 * ```
 *
 * @param opts Options for the type of store to create. Use `{ value }` for a basic store,
 * `{ type: 'list', value }` for a ListStore, or `{ type: 'map', value }` for a MapStore.
 * @returns The corresponding store instance (Store, ListStore, or MapStore).
 */
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

/**
 * Standard reactive value store class. See implementation and class comments in `Store.ts` for all public methods.
 * @see Store (class)
 */
export { ListStore, MapStore, Store };
