import type { AnySubscriber, EventSubscriber, EventType, StoreEvent } from "../types.ts";
import { deepishClone, ids } from "../utils.ts";

const storeId: ReturnType<typeof ids<"cf-store">> = ids("cf-store");

/**
 * The primitive observable container. Store is the base class for all reactive state in Campfire.
 *
 * Stores emit events when changed and support granular subscriptions. There are helpers for updating,
 * transforming, cloning, and explicit disposal. See also: ListStore, MapStore for array/object variants.
 *
 * Example:
 * ```ts
 * import { store } from "campfire";
 * const state = store({ value: { open: false } });
 * state.on("update", e => console.log(e.value.open)); // Subscribe
 * state.update(x => ({ ...x, open: true }));
 * const snapshot = state.current();
 * state.dispose(); // Free resources & stop all events
 * ```
 *
 * Supported events:
 * - `update`: When value changes (all Stores)
 * - `append`, `deletion`, `clear`, `change`: ListStore/MapStore only (see their docs)
 *
 * Subscribing: Use `.on(event, fn)` for one event, `.any(fn)` for all, and `.unsubscribe()` to remove listeners.
 * Disposing: `.dispose()` shuts down event delivery and clears all subscribers.
 */
export class Store<T> {
    /**
     * A unique ID for the store, to track nested reactive elements to warn the user.
     * @internal
     */
    id: ReturnType<typeof storeId> = storeId();

    /**
     * The value of the store.
     * @private As of 4.0.0-rc15, direct access is protected. Use current() instead.
     */
    protected value: T;
    /**
     * The subscribers currently registered to the store.
     * @internal
     */
    _subscribers: {
        [K in EventType]?: Record<number, EventSubscriber<K, Store<T>>>;
    } = {};
    /**
     * The subscribers currently registered to the store.
     * @internal
     */
    _subscriberCounts: Record<string, number> = {};
    /**
     * A value describing whether or not the store has been disposed of.
     * @internal
     */
    _dead = false;

    /**
     * Creates an instance of Store.
     * @param value - The initial value of the store.
     */
    constructor(value: T) {
        this.value = value;
    }

    /**
     * Add an event listener to the store.
     * @param type The type of event to listen for.
     *   Supported event types include:
     *   - `update`: Triggered when the store's value is updated via `update()`.
     *   - `append`: For `ListStore` - Triggered when an item is added to the list.
     *   - `deletion`: For `ListStore`/`MapStore` - Triggered when an item is removed.
     *   - `change`: For `ListStore`/`MapStore`: Triggered when an item at an index/key
     *     has its value set via the corresponding store's set() method.
     *   - 'clear': Triggered when the store is cleared.
     * @param fn A callback function that will be invoked when the specified event occurs.
     *   The function receives a `StoreEvent` object with details about the event.
     * @param callNow Optional parameter to immediately trigger the callback with current value
     * @returns A unique subscriber ID that can be used to unsubscribe the listener.
     * @example
     * ```ts
     * // Subscribe to updates
     * const counter = store({ value: 0 });
     * counter.on("update", (event) => {
     *   console.log(`Counter updated to: ${event.value}`);
     * });
     *
     * // Subscribe and trigger immediately with current value
     * counter.on("update", (event) => {
     *   console.log(`Current value: ${event.value}`);
     * }, true);
     * ```
     */
    on<K extends EventType>(
        type: K,
        fn: EventSubscriber<K, Store<T>>,
        callNow?: true,
    ): number {
        this._subscriberCounts[type] ??= 0;
        this._subscribers[type] ??= {};
        const id = this._subscriberCounts[type]++;
        this._subscribers[type][id] = fn;
        // @ts-ignore this is not a problem
        if (type === "update" && callNow) fn({ type: "update", value: this.value });
        return this._subscriberCounts[type]++;
    }

    /**
     * Subscribes the provided function to all store events.
     * This is a convenience method that registers the function for 'change',
     * 'append', 'clear', and 'deletion' events.
     *
     * @param fn A callback function that will be called for all store events
     * @returns void
     */
    any(fn: AnySubscriber<Store<T>>) {
        this.on("append", fn);
        this.on("change", fn);
        this.on("clear", fn);
        this.on("deletion", fn);
        this.on("update", fn);
    }

    /**
     * Removes a specific event listener from the store.
     * @param type The type of event from which to unsubscribe.
     * @param id The subscriber ID returned by the `on()` method when the listener was registered.
     * @throws Will throw an error if the subscriber ID is invalid or not found.
     */
    unsubscribe(type: EventType, id: number) {
        delete this._subscribers[type]?.[id];
    }

    /**
     * Utility method to check if a value is a transform function
     * @internal
     */
    static isUpdater<T>(val: unknown): val is (arg: T) => T {
        return typeof val === "function";
    }

    /**
     * Updates the store's value and notifies all subscribers.
     *
     * As of 4.0.0-rc15, this method can also accept a transform function that
     * receives the current value and returns a new value.
     *
     * @param value The new value to set for the store, or a transform function
     * that takes the current value and returns a new value.
     * @returns The updated value, or null if the store has been disposed.
     * @emits 'update' event with the new value when successfully updated.
     * @example
     * ```ts
     * // Direct update
     * counter.update(5);
     *
     * // Update using a transform function
     * counter.update(current => current + 1);
     *
     * // Complex transform
     * userStore.update(user => ({
     *   ...user,
     *   visits: user.visits + 1,
     *   lastVisit: new Date()
     * }));
     * ```
     */
    update(value: (arg: T) => T): T | null;
    update(value: T): T | null;
    update(value: T | ((arg: T) => T)): T | null {
        if (this._dead) return null;
        let updated: T;
        if (Store.isUpdater<T>(value)) {
            updated = value(this.value);
        } else {
            updated = value;
        }
        this.value = updated;
        this._sendEvent({ type: "update", value: Object.freeze(updated) });
        return updated;
    }

    /**
     * Sends an event to all subscribers if the store has not been disposed of.
     * @internal
     */
    _sendEvent(event: StoreEvent<Store<T>>) {
        if (this._dead) return;
        const subs = this._subscribers[event.type] as Record<
            number,
            EventSubscriber<typeof event.type, Store<T>>
        >;
        if (!subs) return;

        for (const idx in subs) {
            subs[idx](event);
        }
    }

    /**
     * Close the store so it no longer sends events.
     */
    dispose() {
        this._dead = true;
        this._subscribers = {};
        this._subscriberCounts = {};
    }

    /**
     * Get a deep clone of the current store value.
     *
     * Added in 4.0.0-rc15 as the recommended way to access store values
     * since the value property is now protected.
     *
     * @returns A deep clone of the store's current value
     * @example
     * ```ts
     * const user = store({ value: { name: "John", age: 30 } });
     * const userData = user.current();  // { name: "John", age: 30 }
     * ```
     */
    current(): T {
        return deepishClone(this.value);
    }

    /**
     * @deprecated Use current() instead
     */
    valueOf(): T {
        return deepishClone(this.value);
    }
}
