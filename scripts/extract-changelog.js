import { readFileSync } from 'node:fs';

// Print the CHANGELOG.md section body for a given version to stdout. Used by the
// release workflow to build stable GitHub Release notes from the curated
// changelog. Exits non-zero when the section is missing, which signals that the
// `version` hook (release-changelog.js) did not run for this release.

const version = process.argv[2];

if (!version) {
    console.error('Usage: node scripts/extract-changelog.js <version>');
    process.exit(1);
}

const changelog = readFileSync('CHANGELOG.md', 'utf8');

const escaped = version.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
// Capture everything between `## [<version>]` and the next `## [` heading.
const section = changelog.match(
    new RegExp(`^## \\[${escaped}\\][^\\n]*\\n([\\s\\S]*?)(?=^## \\[)`, 'm')
);

if (!section) {
    console.error(`No changelog section found for version ${version}.`);
    process.exit(1);
}

process.stdout.write(`${section[1].trim()}\n`);
