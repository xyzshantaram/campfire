const store = new cf.Store(0); // initial value
const question = store.on("set", (val) => { // this function is called every time the value is changed
    if (val == 42) {
        console.log("That's the right answer!");
    } else {
        console.log("Hmmm. Try again.");
    }
}, false);
/* The last argument specifies whether or not the callback should be called right now with the current value of the store. */

store.update(3);
store.update(42);
store.update(69);

store.unsubscribe("set", question);
store.dispose();
store.update(42); // does nothing since the store is disposed of