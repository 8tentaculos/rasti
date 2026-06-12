import { readFileSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

// Update the pinned `rasti@<version>` CDN links in the README and examples to
// match the current package.json version. Run by the `version` npm lifecycle
// hook, so it runs on every `npm version` bump (including prereleases).

const { version } = JSON.parse(
    readFileSync(new URL('../package.json', import.meta.url), 'utf8')
);

const re = /rasti@(v)?\d+\.\d+\.\d+(?:-[\w.-]+)?/g;

const files = [
    'README.md',
    'docs/AGENTS.md',
    'example/todo/index.html'
];

files.forEach(file => {
    const text = readFileSync(file, 'utf8');
    writeFileSync(file, text.replace(re, (match, prefix) => `rasti@${prefix || ''}${version}`));
});

execSync(`git add ${files.join(' ')}`, { stdio : 'inherit' });
