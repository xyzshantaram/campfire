import { Store } from "./Store.ts";

/**
 * A reactive map store.
 * Implements set(key, value), remove(key), clear(), transform(key, fn), has(key), entries(), 
 * and get(key).
 * set() sends a "change" event, remove() sends a "deletion" event, clear() sends a "clear" event,
 * and transform() sends a "change" event.
 */
export class MapStore<T> extends Store<Map<string, T>> {

    /**
     * Constructor for MapStore.
     * Initializes the store with the provided initial key-value pairs.
     * @param init Initial key-value pairs to populate the store.
     */
    constructor(init?: Record<string, T>) {
        super(new Map());

        // Populates the store with initial key-value pairs.
        for (const [k, v] of Object.entries(init || {})) {
            this.value.set(k, v);
        }
    }

    /**
     * Sets a value for a specific key in the store.
     * @param key The key to set or update.
     * @param value The value to associate with the key.
     * @emits 'change' event with:
     *   - `key`: The key that was set or updated
     *   - `value`: The new value associated with the key
     */
    set(key: string, value: T) {
        this.value.set(key, value);
        this._sendEvent({ key, value, type: 'change' });
    }

    /**
     * A no-operation method for MapStore to maintain base Store compatibility.
     * Does not perform any action.
     * @deprecated
     */
    update() {
        // Intentionally left as a no-op for MapStore
    }

    /**
     * Removes a key-value pair from the store.
     * @param key The key to remove.
     * @emits 'deletion' event with:
     *   - `key`: The key that was removed
     *   - `value`: The current state of the map after deletion
     */
    remove(key: string) {
        this.value.delete(key);
        this._sendEvent({ key, value: this.value, type: 'deletion' });
    }

    /**
     * Removes all key-value pairs from the store.
     * @emits 'clear' event indicating the store has been emptied.
     */
    clear() {
        this.value = new Map();
        this._sendEvent({ type: 'clear' });
    }

    /**
     * Applies a transformation function to the value of a specific key.
     * @param key The key whose value will be transformed.
     * @param fn A function that takes the current value and returns a new value.
     * @throws {Error} If the key does not exist in the store.
     * @emits 'change' event with the transformed value (via internal `set` method)
     */
    transform(key: string, fn: (val: T) => T) {
        const old = this.value.get(key);
        if (!old) throw new Error(`ERROR: key ${key} does not exist in store!`);
        const transformed = fn(old);
        this.set(key, transformed);
        this._sendEvent({ type: "change", value: transformed, key });
    }

    /**
     * Retrieves the value associated with a specific key.
     * @param key The key to look up.
     * @returns The value associated with the key, or undefined if the key does not exist.
     */
    get(key: string) {
        return this.value.get(key);
    }

    has(key: string): boolean {
        return this.value.has(key);
    }

    entries() {
        return this.value.entries();
    }
}
