/** @import cf from '@/campfire.ts'; */

/**
 * Minimal idiomatic Campfire router.
 *
 * Pass in: { key: { title, view: HTMLElement|string } }
 * .current is a store of the current key (string)
 * .set(key) navigates and updates; hash/listener is automatic.
 */
const router = (routes, def = 'index') => {
  const hashToKey = Object.fromEntries(
    Object.keys(routes).map(key => [`#${encodeURIComponent(key)}`, key]));

  const current = cf.store({ value: def || null });

  current.on('update', ({ value }) => {
    if (!(value in routes)) value = '404';
    const hash = `#${value}`;
    if (location.hash !== hash) location.hash = hash;

    Object.entries(routes).forEach(([key, R]) =>
      R.view.style.display = (value === key) ? 'block' : 'none');
    document.title = routes[value].title;
  });

  const sync = () => {
    const hash = location.hash || "#";
    if (Object.hasOwn(hashToKey, hash)) {
      current.update(hashToKey[hash]);
    } else {
      current.update(hash === "#" ? def : '404');
    };
  };

  globalThis.addEventListener('hashchange', sync);
  sync();

  return current;
};

const Nav = ({ routes, view }) => {
  const buttons = Object.entries(routes)
    .filter(([key]) => key !== '404')
    .map(([name, R]) => cf.nu("button.nav-btn")
      .attr("data-key", name)
      .deps({ view })
      .render(({ view }, { b }) => b.content(R.title).cls('active', view === name))
      .on("click", () => view.update(name))
      .ref());

  return cf.nu('nav')
    .render((_, { b }) => b.html`<cf-slot name='buttons'></cf-slot>`)
    .children({ buttons })
    .done();
};

const routes = {
  index: { title: 'Home', view: cf.nu("section").html`<h1>Home</h1><p>Welcome!</p>`.ref() },
  about: { title: 'About', view: cf.nu("section").html`<h1>About</h1><p>Router demo.</p>`.ref() },
  '404': { title: '404', view: cf.nu("section").html`<h1>Not found</h1>`.ref() }
};

const createApp = (routes, def = 'index') => {
  const [app] = cf.nu("#app").done();

  Object.values(routes)
    .map(itm => ({ ...itm, view: cf.nu(itm.view).ref() }))
    .forEach(R => cf.insert(R.view, { into: app }));

  const current = router(routes, def);
  const [nav] = Nav({ routes, view: current });
  cf.insert(nav, { into: app, at: 'start' });

  return [app, current];
}

const [app] = createApp(routes);
cf.insert(app, { into: document.body });