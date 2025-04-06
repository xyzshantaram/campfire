import { build } from 'esbuild'

// Automatically exclude all node_modules from the bundled version
import { nodeExternalsPlugin } from 'esbuild-node-externals'

// Full-size ESM version
build({
    entryPoints: ['src/campfire.ts'],
    outfile: './dist/campfire.js',
    bundle: true,
    minify: false,
    platform: 'browser',
    sourcemap: false,
    target: ['es6'],
    format: 'esm',
    plugins: [nodeExternalsPlugin()]
}).catch((err) => {
    console.error(err)
    process.exit(1)
})

// Full-size CJS version
build({
    entryPoints: ['src/campfire.ts'],
    outfile: './dist/testing/campfire.cjs.js',
    bundle: true,
    minify: false,
    platform: 'browser',
    sourcemap: false,
    target: ['es6'],
    format: 'cjs',
    plugins: [nodeExternalsPlugin()]
}).catch((err) => {
    console.error(err)
    process.exit(1)
})

// minified ESM version
build({
    entryPoints: ['src/campfire.ts'],
    outfile: './dist/campfire.esm.min.js',
    bundle: true,
    minify: true,
    platform: 'browser',
    sourcemap: false,
    target: ['es6'],
    format: 'esm',
    plugins: [nodeExternalsPlugin()]
}).catch((err) => {
    console.error(err)
    process.exit(1)
})

// minified CJS version
build({
    entryPoints: ['src/campfire.ts'],
    outfile: './dist/campfire.cjs.min.js',
    bundle: true,
    minify: true,
    platform: 'browser',
    sourcemap: false,
    target: ['es6'],
    format: 'cjs',
    plugins: [nodeExternalsPlugin()]
}).catch((err) => {
    console.error(err)
    process.exit(1)
})