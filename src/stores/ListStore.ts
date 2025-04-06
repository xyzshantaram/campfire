import { Store } from "./Store.ts";

/**
    * A reactive list store. 
    * Implements push(item). remove(idx), get(idx), and setAt(idx, item).
    * push() sends an "append" event
    * remove() sends a "deletion" event
    * setAt() sends a "change" event with idx
*/
export class ListStore<T> extends Store<T[]> {
    constructor(ls?: T[]) {
        super(ls);
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
        this._sendEvent({ type: "append", value: val, idx: this.value.length - 1 });
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
        if (idx < 0 || idx >= this.value.length) throw new RangeError("Invalid index.");
        this._sendEvent({
            type: 'deletion',
            idx,
            value: this.value.splice(idx, 1)[0]
        });
    }

    /**
     * Retrieves the element at the specified index.
     * @param idx The index of the element to retrieve.
     * @returns The element at the specified index.
     * @throws {RangeError} If the index is out of bounds.
     */
    get(idx: number) {
        if (idx < 0 || idx >= this.value.length) throw new RangeError("Invalid index.");
        return this.value[idx];
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
        if (idx < 0 || idx >= this.value.length) throw new RangeError("Invalid index.");
        this.value[idx] = value;
        this._sendEvent({ type: "change", value, idx });
    }

    /**
     * Utility accessor to find the length of the store.
     */
    get length() {
        return this.value.length;
    }
}
