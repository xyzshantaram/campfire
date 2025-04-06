import { StoreEvent, Subscriber } from "../types.ts";

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
        [K in StoreEvent['type']]?: Record<number, Subscriber>;
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
    constructor(value?: T) {
        if (value) this.value = value;
    }

    /**
     * Add an event listener to the store.
     * @param type The type of event to listen for.
     *   Supported event types include:
     *   - 'change': Triggered when the store's value is updated via `update()`.
     *   - Other custom event types may be supported depending on the store implementation.
     * @param fn A callback function that will be invoked when the specified event occurs.
     *   The function receives a `StoreEvent` object with details about the event.
     * @param callNow Determines whether the callback should be immediately invoked 
     *   with the current store value. Note: Not applicable for events like "append",
     *   "remove" which have list/map-specific behaviors.
     * @returns A unique subscriber ID that can be used to unsubscribe the listener.
     * @throws May throw an error if the event type is invalid or if the callback is not a function.
     */
    on(type: StoreEvent['type'], fn: Subscriber, callNow: boolean = false): number {
        this._subscriberCounts[type] = this._subscriberCounts[type] || 0;
        this._subscribers[type] ??= {};
        this._subscribers[type]![this._subscriberCounts[type]] = fn;
        if (callNow && !["push", "remove", "mutation", "setAt"].includes(type)) {
            fn({ type: 'change', value: this.value });
        }
        return this._subscriberCounts[type]++;
    }

    any(fn: Subscriber) {
        this.on('append', fn);
        this.on('change', fn);
        this.on('clear', fn);
        this.on('deletion', fn);
    }

    /**
     * Removes a specific event listener from the store.
     * @param type The type of event from which to unsubscribe.
     * @param id The subscriber ID returned by the `on()` method when the listener was registered.
     * @throws Will throw an error if the subscriber ID is invalid or not found.
     */
    unsubscribe(type: StoreEvent['type'], id: number) {
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
        this._sendEvent({ type: 'change', value });
    }

    /**
     * Sends an event to all subscribers if the store has not been disposed of.
     * @internal
    */
    _sendEvent(event: StoreEvent) {
        if (this._dead) return;
        this._subscribers[event.type] = this._subscribers[event.type] || {};
        const subs = this._subscribers[event.type];
        if (!subs) return;
        for (const idx in Object.keys(subs)) {
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
}