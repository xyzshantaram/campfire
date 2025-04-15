import { Store } from "./Store.ts";

/**
 * A reactive map store.
 * Implements set(key, value), remove(key), clear(), transform(key, fn), has(key), entries(), 
 * and get(key).
 * set() sends a "change" event, remove() sends a "deletion" event, clear() sends a "clear" event,
 * and transform() sends a "change" event.
 */
export class MapStore<T> extends Store<Record<string, T>> {

    /**
     * Constructor for MapStore.
     * Initializes the store with the provided initial key-value pairs.
     * @param init Initial key-value pairs to populate the store.
     */
    constructor(init?: Record<string, T>) {
        super({});

        if (!init) return;

        for (const [k, v] of Object.entries(init)) {
            this.value[k] = Object.freeze(v);
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
        this.value[key] = Object.freeze(value);
        this._sendEvent({ key, value, type: 'change' });
    }

    /**
     * Removes a key-value pair from the store.
     * @param key The key to remove.
     * @emits 'deletion' event with:
     *   - `key`: The key that was removed
     *   - `value`: The current state of the map after deletion
     */
    remove(key: string) {
        const value = this.value[key];
        if (value === null || typeof value === 'undefined') return;
        delete this.value[key];
        this._sendEvent({ key, value: value, type: 'deletion' });
    }

    /**
     * Removes all key-value pairs from the store.
     * @emits 'clear' event indicating the store has been emptied.
     */
    clear() {
        this.value = {};
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
        const old = this.value[key];
        if (!old) throw new Error(`ERROR: key ${key} does not exist in store!`);
        const transformed = Object.freeze(fn(old));
        this.set(key, transformed);
        this._sendEvent({ type: "change", value: transformed, key });
    }

    /**
     * Retrieves the value associated with a specific key.
     * @param key The key to look up.
     * @returns The value associated with the key, or undefined if the key does not exist.
     */
    get(key: string) {
        return this.value[key];
    }

    has(key: string): boolean {
        return Object.hasOwn(this.value, key);
    }

    entries() {
        return Object.entries(this.value);
    }

    get size() {
        return Object.keys(this.value).length;
    }
}
