import cf from 'https://esm.sh/campfire.js@4.0.0-alpha4';
import { marked } from 'https://esm.sh/marked@15.0.7';
import toml from 'https://esm.sh/toml@3.0.0';

window.cf = cf;

const PageRenderer = {
    code: (code, _info, escaped) => {
        code = code.text.replace(/\n$/, '') + '\n';

        return '<pre class="microlight"><code>'
            + (escaped ? code : cf.escape(code, true))
            + '</code></pre>\n';

    }
}

window.addEventListener("DOMContentLoaded", async (e) => {
    const app = document.querySelector("#app");
    const mask = document.querySelector("#mask");
    const footer = app.querySelector('.footer');

    marked.use({ renderer: PageRenderer });

    const nav = cf.nu('nav', {
        style: {
            display: 'flex',
            width: '100%',
            justifyContent: 'center'
        }
    });

    app.insertBefore(nav, footer);
    const siteData = new cf.ListStore([]);

    const getTabURL = (name) => {
        const params = new URLSearchParams();
        params.set('tab', name);
        return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    }

    const focusTab = (name) => {
        Array.from(document.querySelectorAll('.cf-site-div')).forEach((elt) => {
            elt.style.display = elt.getAttribute('data-heading') === name ? 'block' : 'none';
        });

        window.history.pushState({}, '', getTabURL(name));

        Array.from(nav.querySelectorAll('button')).forEach(elem => {
            elem.classList[elem.innerHTML === name ? 'add' : 'remove']('active-tab');
        });
    }

    siteData.on('append', (item) => {
        const value = item.value;

        app.insertBefore(cf.nu(
            'div.cf-site-div',
            {
                attrs: {
                    'data-heading': value.heading
                },
                contents: value.html,
                raw: true
            }
        ), footer);

        nav.appendChild(cf.nu(
            "button", {
            m: { type: 'button' },
            contents: value.heading,
            on: {
                'click': function () {
                    document.querySelector('.active-tab')?.classList.remove('active-tab');
                    this.classList.add('active-tab');
                    focusTab(value.heading);
                }
            }
        }));
    })

    await fetch('site/data/main.toml')
        .then(res => res.text())
        .then(text => {
            const data = toml.parse(text);

            for (let key of Object.keys(data)) {
                siteData.push({
                    html: marked.parse(data[key].md),
                    heading: key,
                })
            }

            const params = new URLSearchParams(window.location.search);
            const tab = params.get('tab');
            focusTab(tab || 'home');

            if (window.editorReady) window.editorReady();

            mask.style.display = 'none';
        }).catch(err => {
            mask.innerHTML = `Error loading site data: ${err}`;
        })
})