import { defineConfig } from 'eslint/config';
import globals from 'globals';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory : __dirname,
    recommendedConfig : js.configs.recommended,
    allConfig : js.configs.all
});

export default defineConfig([{
    extends : compat.extends('eslint:recommended'),

    languageOptions: {
        globals : {
            ...globals.browser,
            ...globals.commonjs,
            ...globals.node,
            ...globals.mocha,
        },

        ecmaVersion : 6,
        sourceType : 'module'
    },

    rules : {
        indent : ['error', 4],
        'linebreak-style' : ['error', 'unix'],
        quotes : ['error', 'single'],
        semi : ['error', 'always'],
        'key-spacing' : ['error', { beforeColon : true, afterColon : true }],
        'no-trailing-spaces' : ['error', { skipBlankLines : false, ignoreComments : true }],
        'no-multiple-empty-lines' : ['error', { max : 1, maxEOF : 0 }],
        'no-console' : 'error'
    }
}]);