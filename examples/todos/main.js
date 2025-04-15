const store = cf.store({ type: "list", value: [] });
const storeId = cf.ids('todo');

const [input] = cf.nu('input')
    .style('min-width', '20ch')
    .misc('type', 'text')
    .done();

const [button] = cf.nu("button")
    .misc('type', 'button')
    .on('click', () => {
        const value = input.value.trim();
        if (value) store.push({ done: false, name: value, id: storeId() });
        input.value = '';
    })
    .content("Add")
    .done();

const TodoItem = (store, event) => cf.nu('li.todo-item')
    .render((_, { b }) => b.html`
        <span>${event.value.name}</span>
        <cf-slot name='remove'></cf-slot>
    `)
    .track(event.value.id)
    .children({
        remove: cf.nu('button')
            .content("Mark done")
            .on('click', () => {
                const idx = store.findIndex(itm => itm.id === event.value.id);
                store.set(idx, { ...event.value, done: true });
            })
            .ref()
    })
    .done()

const todos = cf.nu('ul')
    .deps({ items: store })
    .render((_, { event, elt }) => {
        if (!event) return;
        switch (event.type) {
            case "append": {
                cf.insert(TodoItem(store, event), { into: elt });
                break;
            }
            case "change": {
                const li = cf.tracked(event.value.id);
                li.classList.add('done');
                const [btn] = cf.select({ s: 'button', from: li });
                cf.nu(btn)
                    .content("Delete")
                    .on('click', () => store.remove(store.findIndex(itm => itm.id === event.value.id)))
                    .done();
                break;
            }
            case "deletion": {
                const li = cf.tracked(event.value.id);
                if (!li) break;
                li.remove();
                cf.untrack(event.value.id);
                break;
            }
            default:
                console.log(event);
                break;
        }
    })
    .done();

const app = cf.nu("#app")
    .deps({ store })
    .render(({ store }, { b }) => b.html`
        <h1>To-do list</h1>
        <div><em>${store.length.toString()} items</em></div>
        <cf-slot name='form'></cf-slot>
        <cf-slot name='todos'></cf-slot>
    `)
    .style('fontFamily', 'sans-serif')
    .children({ form: [input, button], todos })
    .done();

cf.insert(app, { into: document.body });
