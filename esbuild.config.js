const esbuild = require('esbuild')

// Automatically exclude all node_modules from the bundled version
const { nodeExternalsPlugin } = require('esbuild-node-externals')

// Full-size ESM version
esbuild.build({
    entryPoints: ['./dist/campfire.js'],
    outfile: './dist/campfire.esm.js',
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
esbuild.build({
    entryPoints: ['./dist/campfire.js'],
    outfile: './dist/campfire.cjs.js',
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
esbuild.build({
    entryPoints: ['./dist/campfire.js'],
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
esbuild.build({
    entryPoints: ['./dist/campfire.js'],
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