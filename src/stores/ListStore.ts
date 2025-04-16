import { Store } from "./Store.ts";

/**
 * Reactive store for arrays, with ergonomic mutation helpers and eventing.
 *
 * Offers push/remove/set/clear and iterable helpers, producing granular change events.
 * Compatible with Campfire’s store API, and usable in both imperative and reactive contexts.
 *
 * Example:
 * ```ts
 * import { store } from "campfire";
 * const todos = store({ type: "list", value: ["one"] });
 * todos.push("two");               // Appends new item
 * todos.set(0, "ONE");            // Update item in-place with eventing
 * todos.remove(1);                 // Remove by index
 * todos.clear();                   // Remove all
 * for (const item of todos) {...}  // Iterable like a JS array
 * ```
 *
 * Events:
 * - `append`: After `push`, with appended value and its index
 * - `deletion`: After `remove`, with removed value and index
 * - `clear`: After `clear`
 * - `change`: After `set`, with new value and index
 *
 * All standard Store events (`on`, `any`, etc.) are available.
 */
export class ListStore<T> extends Store<T[]> {
    constructor(ls?: T[]) {
        super(ls || []);
    }

    /**
     * Clears all elements from the store.
     * @description Sets the store's value to an empty array and triggers a 'clear' event.
     * @emits 'clear' event.
     */
    clear() {
        this.value = [];
        this._sendEvent({ type: "clear" });
    }

    /**
     * Appends a new element to the end of the list.
     * @param val The value to add to the list.
     * @returns The new length of the list after appending.
     * @emits 'append' event with:
     *   - `value`: The appended item
     *   - `idx`: The index where the item was inserted (length - 1)
     */
    push(val: T) {
        this.value.push(val);
        // Send a copy in the event
        this._sendEvent({
            type: "append",
            value: Object.freeze(val),
            idx: this.value.length - 1,
        });
        return this.value.length;
    }

    /**
     * Removes the element at the specified index.
     * @param idx The index of the element to remove.
     * @throws {RangeError} If the index is out of bounds.
     * @emits 'deletion' event with:
     *   - `value`: The removed item
     *   - `idx`: The index from which the item was removed
     */
    remove(idx: number) {
        if (idx < 0) return; // fail quietly incase findIndex() was passed
        if (idx >= this.value.length) throw new RangeError("Invalid index.");
        this._sendEvent({
            type: "deletion",
            idx,
            value: this.value.splice(idx, 1)[0],
        });
    }

    /**
     * Retrieves the element at the specified index.
     * @param idx The index of the element to retrieve.
     * @returns The element at the specified index.
     * @throws {RangeError} If the index is out of bounds.
     */
    get(idx: number) {
        if (idx < 0 || idx >= this.value.length) {
            throw new RangeError("Invalid index.");
        }
        return Object.freeze(this.value[idx]);
    }

    /**
     * Sets the value of an element at a specific index.
     * @param idx The index of the element to modify.
     * @param value The new value to set at the specified index.
     * @throws {RangeError} If the index is out of bounds.
     * @emits 'change' event with:
     *   - `value`: The new value
     *   - `idx`: The index of the modified element
     */
    set(idx: number, value: T) {
        if (idx < 0 || idx >= this.value.length) {
            throw new RangeError("Invalid index.");
        }
        this.value[idx] = value;
        // Send a copy in the event
        this._sendEvent({
            type: "change",
            value: Object.freeze(value),
            idx,
        });
    }

    [Symbol.iterator]() {
        return this.value[Symbol.iterator]();
    }

    map: (...args: Parameters<T[]["map"]>) => ReturnType<T[]["map"]> = (...args) => {
        return this.value.map(...args);
    };

    forEach: (...args: Parameters<T[]["forEach"]>) => ReturnType<T[]["forEach"]> = (...args) => {
        return this.value.forEach(...args);
    };

    findIndex: (
        ...args: Parameters<T[]["findIndex"]>
    ) => ReturnType<T[]["findIndex"]> = (...args) => {
        return this.value.findIndex(...args);
    };

    /**
     * Utility accessor to find the length of the store.
     */
    get length() {
        return this.value.length;
    }
}
