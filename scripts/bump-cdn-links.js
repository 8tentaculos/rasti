import { readFileSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

// Update the pinned `rasti@<version>` CDN links in the README, the agent skill
// and examples, and the skill's `metadata.version`, to match the current
// package.json version. Run by the `version` npm lifecycle hook, so it runs on
// every `npm version` bump (including prereleases).

const { version } = JSON.parse(
    readFileSync(new URL('../package.json', import.meta.url), 'utf8')
);

const re = /rasti@(v)?\d+\.\d+\.\d+(?:-[\w.-]+)?/g;

const skill = 'skills/rasti/SKILL.md';

const files = [
    'README.md',
    skill,
    'skills/rasti/references/model.md',
    'skills/rasti/references/typescript.md',
    'example/todo/index.html'
];

files.forEach(file => {
    let text = readFileSync(file, 'utf8').replace(re, (match, prefix) => `rasti@${prefix || ''}${version}`);
    if (file === skill) text = text.replace(/^(  version: )".*"$/m, `$1"${version}"`);
    writeFileSync(file, text);
});

execSync(`git add ${files.join(' ')}`, { stdio : 'inherit' });
