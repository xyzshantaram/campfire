import type { EventSubscriber, EventType, StoreEvent, AnySubscriber } from "../types.ts";
import { ids } from "../utils.ts";

const storeId = ids('cf-store');

/**
 * A simple reactive store.
 * @class Store
 * @public
 */
export class Store<T> {
    /**
     * A unique ID for the store, to track nested reactive elements to warn the user.
     * @internal
     */
    id = storeId();

    /**  The value of the store. */
    protected value: T;
    /** 
     * The subscribers currently registered to the store. 
     * @internal
    */
    _subscribers: {
        [K in EventType]?: Record<number, EventSubscriber<K, Store<T>>>
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
     * @returns A unique subscriber ID that can be used to unsubscribe the listener.
     */
    on<K extends EventType>(type: K, fn: EventSubscriber<K, Store<T>>, callNow?: true): number {
        this._subscriberCounts[type] ??= 0;
        this._subscribers[type] ??= {};
        const id = this._subscriberCounts[type]++;
        this._subscribers[type][id] = fn;
        // @ts-ignore this is not a problem
        if (type === 'update' && callNow) fn({ type: 'update', value: this.value });
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
        this.on('append', fn);
        this.on('change', fn);
        this.on('clear', fn);
        this.on('deletion', fn);
        this.on('update', fn);
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

    static isUpdater<T>(val: unknown): val is (arg: T) => T {
        return typeof val === 'function';
    }

    /**
     * Updates the store's value and notifies all subscribers.
     * @param value The new value to set for the store.
     * @emits 'change' event with the new value when successfully updated.
     * @note No-op if the store has been disposed via `dispose()`.
     */
    update(value: (arg: T) => T): T | null;
    update(value: T): T | null;
    update(value: T | ((arg: T) => T)): T | null {
        if (this._dead) return null;
        let updated: T;
        if (Store.isUpdater<T>(value)) {
            updated = value(this.value);
        }
        else {
            updated = value;
        }
        this.value = updated;
        this._sendEvent({ type: 'update', value: updated });
        return updated;
    }

    /**
     * Sends an event to all subscribers if the store has not been disposed of.
     * @internal
    */
    _sendEvent(event: StoreEvent<Store<T>>) {
        if (this._dead) return;
        const subs = this._subscribers[event.type] as Record<number, EventSubscriber<typeof event.type, Store<T>>>;
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

    current() {
        return structuredClone(this.value);
    }

    valueOf() {
        return structuredClone(this.value);
    }
}