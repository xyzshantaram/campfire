/**
 * Minimal idiomatic Campfire router.
 *
 * Pass in: { key: { route, title, view: HTMLElement|string } }
 * .current is a store of the current key (string)
 * .set(key) navigates and updates; hash/listener is automatic.
 */
const router = (routes, def = 'index') => {
  const hashToKey = {};

  for (const key in routes) {
    hashToKey[`#${encodeURIComponent(key)}`] = key;
  }

  const current = cf.store({ value: def || null });
  const sync = () => {
    const hash = location.hash || "#";
    current.update(hashToKey[hash] || def);
  }

  globalThis.addEventListener('hashchange', sync);
  sync();

  current.on('update', ({ value }) => {
    if (!(value in routes)) return;
    const hash = `#${value}`;
    if (location.hash !== hash) location.hash = hash;
    Object.entries(routes).forEach(([key, R]) => {
      R.view.style.display = (value === key) ? 'block' : 'none';
    });
  })

  return current;
}

const routes = {
  index: { route: '', title: 'Home', view: cf.nu("div").html`<h2>Home</h2><p>Welcome!</p>`.ref() },
  about: { route: 'about', title: 'About', view: cf.nu("div").html`<h2>About</h2><p>Router demo.</p>`.ref() },
  '404': { route: '404', title: '404', view: cf.nu("div").html`<h2>Not found</h2>`.ref() }
};

const Nav = ({ routes, view }) => {
  const buttons = Object.entries(routes).map(([name, R]) =>
    cf.nu("button.nav-btn")
      .attr("data-key", name)
      .deps({ view })
      .render(({ view }, { b }) => b.content(R.title).cls('active', view === name))
      .on("click", () => view.update(name))
      .ref());

  return cf.nu('nav')
    .render((_, { b }) => b.html`<cf-slot name='buttons'></cf-slot>`)
    .children({ buttons })
    .done();
}

const [app] = cf.nu("div#router-container").done();

Object.values(routes)
  .forEach(R => cf.insert(
    cf.nu(R.view).style('display', 'none').ref(), { into: app }));

const current = router(routes);
const [nav] = Nav({ routes, view: current });
cf.insert(nav, { into: app, at: 'start' });
cf.insert(app, { into: document.body });
