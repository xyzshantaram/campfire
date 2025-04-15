const store = new cf.store({ type: "list", value: [] });

const [input] = cf.nu('input')
    .style('min-width', '20ch')
    .misc('type', 'text')
    .done();

const button = cf.nu("button")
    .misc('type', 'button')
    .on('click', () => {
        const value = input.value.trim();
        if (value) store.push({ done: false, name: value });
        input.value = '';
    })
    .content("Add")
    .done();

const form = cf.nu('div')
    .html(cf.html`
        <cf-slot name="input"></cf-slot>
        <cf-slot name="button"></cf-slot>
    `)
    .children({ input, button })
    .done();

const TodoItem = (store, event) => cf.nu('li.todo-item')
    .render((_, { b }) => b.html`
        <span>${event.value.name}</span>
        <cf-slot name='remove'></cf-slot>
    `)
    .attr('data-idx', event.idx)
    .children({
        remove: cf.nu('button')
            .content("Mark done")
            .on('click',
                function () {
                    const idx = +this.parentElement.getAttribute('data-idx');
                    store.set(idx, { done: true, name: event.value.name })
                }
            )
            .ref()
    })
    .done()

const todos = cf.nu('ul')
    .deps({ items: store })
    .render((_, { event, elt }) => {
        if (!event) return;
        // fine-grained update
        switch (event.type) {
            case "append": {
                cf.insert(TodoItem(store, event), { into: elt });
                break;
            }
            case "change": {
                const [li] = cf.select({ s: `li[data-idx="${event.idx}"]`, from: elt });
                li.classList.add('deleted');
                const [btn] = cf.select({ s: 'button', from: li });
                cf.extend(btn, {
                    contents: "Delete",
                    on: { click: () => store.remove(Number(li.getAttribute('data-idx'))) }
                });
                break;
            }
            case "deletion": {
                const [li] = cf.select({ s: `li.todo-item[data-idx="${event.idx}"]`, from: elt });
                if (li) li.remove();

                cf.select({ s: 'li.todo-item', from: elt, all: true }).forEach((elem, idx) => {
                    elem.setAttribute('data-idx', idx);
                });
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
    .children({ form, todos })
    .done();

cf.insert(app, { into: document.body });
