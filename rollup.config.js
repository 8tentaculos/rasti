import terser from '@rollup/plugin-terser';
import glob from 'glob';
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
                entryFileNames : '[name].cjs'
            },
            {
                dir : 'es',
                format : 'esm',
                entryFileNames : '[name].js'
            }
        ],
        plugins : []
    },
    {
        input : 'src/index.js',
        output : {
            file : 'dist/rasti.js',
            format : 'umd',
            name : 'Rasti'
        },
        plugins : []
    },
    {
        input : 'src/index.js',
        output : {
            file : 'dist/rasti.min.js',
            format : 'umd',
            name : 'Rasti'
        },
        plugins : [
            terser()
        ]
    }
];

export default config;