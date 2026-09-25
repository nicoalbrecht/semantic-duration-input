# Contributing

## Workflow

`main` is always releasable. All changes go through a pull request:

1. Branch off `main`: `git switch -c fix/presets-focus`
2. Push and open a PR. CI runs typecheck, tests and build.
3. Squash-merge. The PR title becomes the commit message on `main`.

## PR titles

PR titles follow [Conventional Commits](https://www.conventionalcommits.org/), which decides the next version:

| Title                                   | Release (before 1.0) | Release (from 1.0) |
| --------------------------------------- | -------------------- | ------------------ |
| `fix: keep focus after picking a preset` | patch                | patch              |
| `feat: add a clear button`              | patch                | minor              |
| `feat!: rename valueFormat to format`   | minor                | major              |
| `docs:`, `chore:`, `test:`, `refactor:`, `ci:`, `build:` | none | none      |

A breaking change can also be marked with a `BREAKING CHANGE:` footer in the PR description. Commits on the branch itself can be messy; only the title counts.

## Releases

[release-please](https://github.com/googleapis/release-please) keeps a "chore(main): release x.y.z" PR open that bumps `package.json` and updates `CHANGELOG.md`. Edit the changelog in that PR if needed. Merging it tags `vx.y.z`, creates the GitHub Release and publishes to npm.
