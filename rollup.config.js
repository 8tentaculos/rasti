import terser from '@rollup/plugin-terser';
import replace from '@rollup/plugin-replace';
import { glob } from 'glob';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const { version } = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'));

// License notice for the `dist` bundles, which are distributed on their own (CDN, script tag).
const banner = `/*! rasti v${version} | (c) 2018-present Alberto Masuelli | MIT | https://rasti.js.org */`;

const config = [
    // One ES module per source file under dist/esm, the package entry for bundlers and Node.
    // Source maps point to src/, which ships in the package.
    {
        input : Object.fromEntries(
            glob.sync('src/**/*.js').map(file => [
                // This removes `src/` as well as the file extension from each
                // file, so e.g. src/nested/foo.js becomes nested/foo
                path.relative(
                    'src',
                    file.slice(0, file.length - path.extname(file).length)
                ),
                // This expands the relative paths to absolute paths, so e.g.
                // src/nested/foo becomes /project/src/nested/foo.js
                fileURLToPath(new URL(file, import.meta.url))
            ])
        ),
        output : {
            dir : 'dist/esm',
            format : 'esm',
            entryFileNames : '[name].js',
            sourcemap : true,
            sourcemapExcludeSources : true
        },
        plugins : [
            replace({
                'const __DEV__ = true;' : 'const __DEV__ = process.env.NODE_ENV !== \'production\';',
                preventAssignment : true,
                sourcemap : true
            })
        ]
    },
    // Single-file bundles, loaded directly by the browser (ESM through an import map,
    // UMD through a script tag or an AMD loader). Each format ships a development
    // build and a minified production build; only the minified build has a source
    // map, the development one is readable as it is.
    {
        input : 'src/index.js',
        output : {
            file : 'dist/rasti.esm.js',
            format : 'esm',
            banner
        },
        plugins : [
            replace({
                'const __DEV__ = true;' : 'const __DEV__ = true;',
                preventAssignment : true
            })
        ]
    },
    {
        input : 'src/index.js',
        output : {
            file : 'dist/rasti.esm.min.js',
            format : 'esm',
            sourcemap : true,
            banner
        },
        plugins : [
            replace({
                'const __DEV__ = true;' : 'const __DEV__ = false;',
                preventAssignment : true,
                sourcemap : true
            }),
            terser({
                sourceMap : true
            })
        ]
    },
    {
        input : 'src/index.js',
        output : {
            file : 'dist/rasti.umd.js',
            format : 'umd',
            name : 'Rasti',
            banner
        },
        plugins : [
            replace({
                'const __DEV__ = true;' : 'const __DEV__ = true;',
                preventAssignment : true
            })
        ]
    },
    {
        input : 'src/index.js',
        output : {
            file : 'dist/rasti.umd.min.js',
            format : 'umd',
            name : 'Rasti',
            sourcemap : true,
            banner
        },
        plugins : [
            replace({
                'const __DEV__ = true;' : 'const __DEV__ = false;',
                preventAssignment : true,
                sourcemap : true
            }),
            terser({
                sourceMap : true
            })
        ]
    }
];

export default config;