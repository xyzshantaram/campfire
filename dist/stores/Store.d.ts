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
    on<K extends EventType>(type: K, fn: EventSubscriber<K, Store<T>>, callNow?: true): number;
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
     * Utility method to check if a value is a transform function
     * @internal
     */
    static isUpdater<T>(val: unknown): val is (arg: T) => T;
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
    /**
     * Sends an event to all subscribers if the store has not been disposed of.
     * @internal
    */
    _sendEvent(event: StoreEvent<Store<T>>): void;
    /**
     * Close the store so it no longer sends events.
     */
    dispose(): void;
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
    current(): T;
    /**
     * @deprecated Use current() instead
     */
    valueOf(): T;
}
