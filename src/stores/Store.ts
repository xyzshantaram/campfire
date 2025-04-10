import type { EventSubscriber, EventType, StoreEvent, AnySubscriber } from "../types.ts";

const storeIds = new Set<string>();
const genId = () => 'cf-' + Math.random().toString(36).slice(2, 8);

const storeId = () => {
    let id = genId();
    while (storeIds.has(id)) id = genId();
    storeIds.add(id);
    return id;
}

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
    value: T;
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
 *   - 'change': Triggered when the store's value is updated via `update()`.
 *   - 'append': For ListStore - Triggered when an item is added to the list.
 *   - 'deletion': For ListStore/MapStore - Triggered when an item is removed.
 *   - 'clear': Triggered when the store is cleared.
 * @param fn A callback function that will be invoked when the specified event occurs.
 *   The function receives a `StoreEvent` object with details about the event.
 * @returns A unique subscriber ID that can be used to unsubscribe the listener.
 */
    on<K extends EventType>(type: K, fn: EventSubscriber<K, Store<T>>): number {
        this._subscriberCounts[type] ??= 0;
        this._subscribers[type] ??= {};
        const id = this._subscriberCounts[type]++;
        this._subscribers[type][id] = fn;
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

    /**
     * Updates the store's value and notifies all subscribers.
     * @param value The new value to set for the store.
     * @emits 'change' event with the new value when successfully updated.
     * @note No-op if the store has been disposed via `dispose()`.
     */
    update(value: T) {
        if (this._dead) return;
        this.value = value;
        this._sendEvent({ type: 'update', value });
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

    valueOf() {
        return structuredClone(this.value);
    }
}