import { Store } from "./Store.ts";
/**
    * A reactive list store.
    * Implements push(item). remove(idx), get(idx), and setAt(idx, item).
    * push() sends an "append" event
    * remove() sends a "deletion" event
    * setAt() sends a "change" event with idx
*/
export declare class ListStore<T> extends Store<T[]> {
    constructor(ls?: T[]);
    /**
     * Clears all elements from the store.
     * @description Sets the store's value to an empty array and triggers a 'clear' event.
     * @emits 'clear' event.
     */
    clear(): void;
    /**
     * Appends a new element to the end of the list.
     * @param val The value to add to the list.
     * @returns The new length of the list after appending.
     * @emits 'append' event with:
     *   - `value`: The appended item
     *   - `idx`: The index where the item was inserted (length - 1)
     */
    push(val: T): number;
    /**
     * Removes the element at the specified index.
     * @param idx The index of the element to remove.
     * @throws {RangeError} If the index is out of bounds.
     * @emits 'deletion' event with:
     *   - `value`: The removed item
     *   - `idx`: The index from which the item was removed
     */
    remove(idx: number): void;
    /**
     * Retrieves the element at the specified index.
     * @param idx The index of the element to retrieve.
     * @returns The element at the specified index.
     * @throws {RangeError} If the index is out of bounds.
     */
    get(idx: number): T;
    /**
     * Sets the value of an element at a specific index.
     * @param idx The index of the element to modify.
     * @param value The new value to set at the specified index.
     * @throws {RangeError} If the index is out of bounds.
     * @emits 'change' event with:
     *   - `value`: The new value
     *   - `idx`: The index of the modified element
     */
    set(idx: number, value: T): void;
    /**
     * Utility accessor to find the length of the store.
     */
    get length(): number;
}
