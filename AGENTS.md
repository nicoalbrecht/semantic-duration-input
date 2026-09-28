# AGENTS.md

Notes for coding agents working on this repository. For using the package in an app, see `skills/semantic-duration-input/SKILL.md` and the docs (`npm run docs:dev`).

## Commands

```sh
npm test             # vitest (happy-dom)
npm run typecheck    # vue-tsc
npm run build        # library build to dist/, including dist/llms.txt and dist/llms-full.txt
npm run docs:build   # docs site, including llms.txt, llms-full.txt and a .md copy of each page
npm run dev          # demo playground with PrimeVue, Vuetify and shadcn-vue
```

CI runs typecheck, tests, build and docs build on Node 22 and 24. Run all four before opening a PR. Formatting tests that need `Intl.DurationFormat` only run on Node 24.

## Layout

- `src/core/`: parser, formatter, locales, units, ISO 8601, model values and `durationSchema`. No Vue or Tailwind imports here: it's the `semantic-duration-input/core` entry and must run in Node. Durations are in seconds.
- `src/composables/useDurationInput.ts`: the component's state and logic.
- `src/components/DurationInput.vue`: markup, presets menu, preview, hidden form input, `as` and the renderless slot.
- `src/config.ts`: props and app-wide defaults. `src/theme.ts`: the tailwind-variants theme. `src/adapters.ts`: `invalidProps` presets.
- `src/nuxt.ts`: the Nuxt module. Its options must stay serializable.
- `src/index.ts` and `src/core/index.ts`: the public API. Anything exported there is covered by semver.
- `tests/`: one spec per area. `docs/`: VitePress site. `demo/`: the `npm run dev` playground.

## Conventions

- TypeScript, no semicolons, single quotes, 2-space indent. Public types and options get JSDoc: it ships in the `.d.ts` files and is what editors and agents see.
- Every behaviour change needs a test and a docs update in `docs/guide/` or `docs/reference/`.
- Each docs page needs a `description` in its frontmatter; the llms.txt build fails without one. New pages go into the sidebar in `docs/.vitepress/site.ts`, which also decides their order in llms.txt.
- Keep `docs/.vitepress/llms-intro.md` (the key facts at the top of llms.txt) and `skills/semantic-duration-input/SKILL.md` in line with the docs when defaults or the public API change.
- TypeScript is pinned to 6.x because `vue-tsc` and `vite-plugin-dts` need the JS compiler API that TypeScript 7 dropped.
- PR titles follow Conventional Commits and decide the release (see `CONTRIBUTING.md`). Don't edit `CHANGELOG.md` or the version in `package.json`; release-please does that.
