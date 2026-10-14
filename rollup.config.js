import terser from '@rollup/plugin-terser';
import replace from '@rollup/plugin-replace';
import { glob } from 'glob';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const config = [
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
        output : [
            {
                dir : 'lib',
                format : 'cjs',
                exports : 'auto',
                entryFileNames : '[name].cjs',
                sourcemap : true
            },
            {
                dir : 'es',
                format : 'esm',
                entryFileNames : '[name].js',
                sourcemap : true
            }
        ],
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
    // build and a minified production build.
    {
        input : 'src/index.js',
        output : {
            file : 'dist/rasti.esm.js',
            format : 'esm',
            sourcemap : true
        },
        plugins : [
            replace({
                'const __DEV__ = true;' : 'const __DEV__ = true;',
                preventAssignment : true,
                sourcemap : true
            })
        ]
    },
    {
        input : 'src/index.js',
        output : {
            file : 'dist/rasti.esm.min.js',
            format : 'esm',
            sourcemap : true
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
            sourcemap : true
        },
        plugins : [
            replace({
                'const __DEV__ = true;' : 'const __DEV__ = true;',
                preventAssignment : true,
                sourcemap : true
            })
        ]
    },
    {
        input : 'src/index.js',
        output : {
            file : 'dist/rasti.umd.min.js',
            format : 'umd',
            name : 'Rasti',
            sourcemap : true
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