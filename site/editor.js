window.addEventListener('DOMContentLoaded', () => {
    const examples = document.querySelector('.cf-site-div[data-heading="playground"]');
    if (!examples) return;

    const editorConfigs = {
        html: {
            elt: document.querySelector('.cf-editor-html'),
            mode: 'ace/mode/html',
            editor: null
        },
        css: {
            elt: document.querySelector('.cf-editor-css'),
            mode: 'ace/mode/css',
            editor: null
        },
        js: {
            elt: document.querySelector('.cf-editor-js'),
            mode: 'ace/mode/javascript',
            editor: null
        },
        out: {
            elt: document.querySelector('.cf-editor-output')
        }
    }

    const wrapper = examples.querySelector('.editor-wrapper');
    const switcher = cf.nu('div.switcher');

    wrapper.append(switcher);

    const currentEditorStore = new cf.Store('html');

    for (const key in editorConfigs) {
        if (key === 'out') continue;
        const current = editorConfigs[key];
        if (!current.elt) continue;
        switcher.appendChild(cf.nu('button', {
            m: { type: 'button' },
            i: key,
            a: {
                'data-editor-view': key
            },
            on: {
                'click': () => {
                    currentEditorStore.update(key);
                }
            }
        }))
        current.editor = ace.edit(current.elt, {
            mode: current.mode,
            theme: 'ace/theme/tomorrow_night_blue',
            fontSize: '1rem',
            copyWithEmptySelection: 'true',
        });
    }

    function getIframeContents() {
        return cf.mustache(
            `<html>
            <head><style> {{ css }} </style></head>
                <body> {{ html }}
                    <script type='module'>
                        import cf from 'https://unpkg.com/campfire.js@1.2.2/dist/campfire.esm.min.js';
                        window.onload = function() { {{ js }} }
                    </script>
                </body>
            </html>`,
            {
                html: editorConfigs.html.editor.getValue().trim(),
                css: editorConfigs.css.editor.getValue().trim(),
                js: editorConfigs.js.editor.getValue().trim()
            }
        )
    }

    switcher.appendChild(cf.nu('button', {
        m: { type: 'button' },
        i: 'output',
        a: {
            'data-editor-view': 'out'
        },
        on: {
            'click': () => {
                currentEditorStore.update('out');
            }
        }
    }))

    function generateOutput() {
        const iframeContents = getIframeContents();
        editorConfigs.out.elt.innerHTML = ''
        const frame = cf.nu('iframe.cf-editor-output-iframe', {
            style: { width: '100%', height: '100%', background: 'white' },
            m: {
                srcdoc: iframeContents,
                sandbox: 'allow-modals allow-scripts'
            }
        })
        editorConfigs.out.elt.appendChild(frame);
    }

    currentEditorStore.on('update', (val) => {
        Array.from(document.querySelectorAll('.editor-wrapper > :not(.switcher)')).forEach(elem => elem.style.display = 'none');
        editorConfigs[val].elt.style.display = 'block';
        editorConfigs[val].editor?.resize();
        document.querySelector(`.switcher>button.active`)?.classList.remove('active');
        document.querySelector(`button[data-editor-view="${val}"]`)?.classList.add('active');
        if (val === 'out') {
            generateOutput();
        }
    }, true);

    const setActivePlaygroundDemo = (obj) => {
        obj.html = obj.html || "<!-- This demo has no HTML! -->";
        obj.css = obj.css || "/* This demo has no CSS! */";
        obj.js = obj.js || "/* This demo has no JS! */";

        for (const str of ['html', 'js', 'css']) {
            editorConfigs[str].editor.setValue(obj[str]);
        }
    }

    const list = document.querySelector("#playground-demo-list");

    fetch("site/examples.json").then(res => res.json()).then(data => {
        data.forEach(itm => {
            list.appendChild(cf.nu('li', {
                i: `<a href='javascript:void(0)'>${itm.name}</a>`,
                on: {
                    'click': function(e) {
                        setActivePlaygroundDemo(itm);
                        currentEditorStore.update('out');
                    }
                }
            }));
        })
    }).catch(err => {
        list.insertBefore(Document.createTextNode(`Error loading demos: ${err}. The playground should still work, sorry for the inconvenience!`));
    })
})