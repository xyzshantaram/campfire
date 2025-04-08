// deno-lint-ignore-file no-explicit-any
import { template, escape } from '../src/campfire.ts';
import { parseArgs } from "jsr:@std/cli@1.0.15";
import { walk } from "jsr:@std/fs@1.0.15";
import { resolve } from "jsr:@std/path@1.0.8";
import { marked } from 'https://esm.sh/marked@15.0.7';

const tpl = template(`<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>campfire: a cozy web framework</title>
    <link rel="stylesheet" href="site/style.css">
    <link rel="shortcut icon" type="image/jpg" href="campfire.png" />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inconsolata:wght@400;700&display=swap" rel="stylesheet">
    
    <script src="https://cdnjs.cloudflare.com/ajax/libs/ace/1.32.6/ace.min.js"></script>
    <script src="https://ace.c9.io/build/src/theme-tomorrow_night_blue.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/ace/1.32.6/mode-html.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/ace/1.32.6/mode-css.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/ace/1.32.6/mode-javascript.min.js"></script>
</head>

<body>
    <div id='app'>
        <h1>campfire</h1>
        <noscript>
            I'd love to make this site work without JS enabled, but seeing as how this is meant to be a demonstration
            for a JS framework... you'll have to turn on scripts. Sorry for the inconvenience.
        </noscript>

        {{ built }}

        <div class='footer'>
            <a href='https://github.com/xyzshantaram/campfire'>Campfire on GitHub</a>
            <a href='https://github.com/xyzshantaram/campfire/blob/main/index.html'>This site on GitHub</a>
            <p>
                Campfire is free, open-source software available under <a
                    href='https://github.com/xyzshantaram/campfire/blob/main/LICENSE'>the MIT License</a>.
            </p>
        </div>
    </div>

    <div id='mask'>
        <span>loading...</span>
    </div>


    <script defer type='module' src='site/main.js'></script>
</body>

</html>`, false);

const PageRenderer = {
    code: (code: Record<string, any>, _info: Record<string, any>, escaped: boolean) => {
        const contents = code.text.replace(/\n$/, '') + '\n';

        return '<pre class="microlight"><code>'
            + (escaped ? contents : escape(contents))
            + '</code></pre>\n';
    }
}

try {
    const [sectionArg, dest] = parseArgs(Deno.args)._;

    if (!sectionArg || !dest) {
        console.error("USAGE: build.ts <sections dir> <src file> <dest file>");
        Deno.exit(1);
    }

    const sectionPath = resolve(Deno.cwd(), sectionArg.toString());
    const sectionStat = Deno.statSync(sectionPath);

    if (!sectionStat.isDirectory) {
        console.error(`FATAL: sections arg must be a dir`);
        Deno.exit(1);
    }

    marked.use({ renderer: PageRenderer });
    const built: [string, string][] = [];

    for await (const section of walk(sectionPath)) {
        if (!section.isFile) continue;
        if (!section.path.endsWith('.md')) continue;
        const filename = section.path.split('/').at(-1)?.replace('.md', '');
        if (!filename) throw new Error(`Invalid filename for ${section.path}`);
        const contents = await Deno.readTextFile(section.path);
        built.push([filename, marked.parse(contents)]);
    }

    const result = built.map(([name, contents]) =>
        `<div class="cf-site-div" data-heading="${name}">${contents}</div>`
    ).join('\n');

    await Deno.writeTextFile(dest.toString(), tpl({ built: result }));
}
catch (e) {
    if (e instanceof Deno.errors.NotFound) {
        console.log(e.message);
        const matches = e.message.match(/stat ('.+').+stat/);
        if (matches) {
            console.error(`FATAL: Path ${matches[1]} was not found.`);
        }
        else {
            console.error('FATAL: A required file was not found.');
        }
    }
    else {
        console.error(`ERROR: ${e}`);
    }

    Deno.exit(1);
}