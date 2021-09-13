import cf from 'https://unpkg.com/campfire.js@1.2.2/dist/campfire.esm.min.js'
window.cf = cf;

window.addEventListener("DOMContentLoaded", (e) => {
    const app = document.querySelector("#app");
    const nav = cf.nu('nav', {
        style: {
            display: 'flex',
            width: '100%',
            justifyContent: 'center'
        }
    });
    app.insertBefore(nav, app.querySelector('.cf-site-div'));
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

    siteData.on('push', (_item) => {
        const item = _item.value;
        console.log(item);
        nav.appendChild(cf.nu(
            "button", {
                m: { type: 'button' },
                innerHTML: item.heading,
                on: { 'click': function() {
                    document.querySelector('.active-tab')?.classList.remove('active-tab');
                    this.classList.add('active-tab');
                    focusTab(item.heading);
                }}
            }
        ));
    })

    for (let x of document.querySelectorAll(".cf-site-div")) {
        siteData.push({
            heading: x.getAttribute("data-heading"),
        });
    }

    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    focusTab(tab || 'home');
})