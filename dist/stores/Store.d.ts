import type { EventSubscriber, EventType, StoreEvent, AnySubscriber } from "../types.ts";
/**
 * A simple reactive store.
 * @class Store
 * @public
 */
export declare class Store<T> {
    /**
     * A unique ID for the store, to track nested reactive elements to warn the user.
     * @internal
     */
    id: string;
    /**  The value of the store. */
    value: T;
    /**
     * The subscribers currently registered to the store.
     * @internal
    */
    _subscribers: {
        [K in EventType]?: Record<number, EventSubscriber<K, Store<T>>>;
    };
    /**
     * The subscribers currently registered to the store.
     * @internal
    */
    _subscriberCounts: Record<string, number>;
    /**
     * A value describing whether or not the store has been disposed of.
     * @internal
     */
    _dead: boolean;
    /**
     * Creates an instance of Store.
     * @param value - The initial value of the store.
     */
    constructor(value: T);
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
    on<K extends EventType>(type: K, fn: EventSubscriber<K, Store<T>>): number;
    /**
         * Subscribes the provided function to all store events.
         * This is a convenience method that registers the function for 'change',
         * 'append', 'clear', and 'deletion' events.
         *
         * @param fn A callback function that will be called for all store events
         * @returns void
         */
    any(fn: AnySubscriber<Store<T>>): void;
    /**
     * Removes a specific event listener from the store.
     * @param type The type of event from which to unsubscribe.
     * @param id The subscriber ID returned by the `on()` method when the listener was registered.
     * @throws Will throw an error if the subscriber ID is invalid or not found.
     */
    unsubscribe(type: EventType, id: number): void;
    /**
     * Updates the store's value and notifies all subscribers.
     * @param value The new value to set for the store.
     * @emits 'change' event with the new value when successfully updated.
     * @note No-op if the store has been disposed via `dispose()`.
     */
    update(value: T): void;
    /**
     * Sends an event to all subscribers if the store has not been disposed of.
     * @internal
    */
    _sendEvent(event: StoreEvent<Store<T>>): void;
    /**
     * Close the store so it no longer sends events.
     */
    dispose(): void;
    valueOf(): T;
}
