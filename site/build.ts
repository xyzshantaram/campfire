// deno-lint-ignore-file no-explicit-any
import { template, escape } from '../src/campfire.ts';
import { parseArgs } from "jsr:@std/cli@1.0.15";
import { walk } from "jsr:@std/fs@1.0.15";
import { resolve } from "jsr:@std/path@1.0.8";
import { marked } from 'https://esm.sh/marked@15.0.7';

const PageRenderer = {
    code: (code: Record<string, any>, _info: Record<string, any>, escaped: boolean) => {
        const contents = code.text.replace(/\n$/, '') + '\n';

        return '<pre class="microlight"><code>'
            + (escaped ? contents : escape(contents))
            + '</code></pre>\n';
    }
}

try {
    const [sectionPath, srcPath, dest] = parseArgs(Deno.args)._;
    const [sections, src] = [sectionPath, srcPath]
        .map(item => item.toString())
        .map(itm => resolve(Deno.cwd(), itm))
        .map(itm => ({ path: itm, stat: Deno.statSync(itm) }));

    if (!sections.stat || !src.stat) {
        console.error("USAGE: build.ts <sections dir> <src file> <dest file>");
    }

    if (!sections.stat.isDirectory) {
        console.error(`FATAL: sections arg must be a dir`);
        Deno.exit(1);
    }

    if (!src.stat.isFile) {
        console.error(`FATAL: src must be a file`);
        Deno.exit(1);
    }

    marked.use({ renderer: PageRenderer });
    const tpl = template(await Deno.readTextFile(src.path), false);
    const built: [string, string][] = [];

    for await (const section of walk(sections.path)) {
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