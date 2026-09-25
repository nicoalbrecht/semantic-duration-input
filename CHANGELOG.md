# Changelog

## [0.2.1](https://github.com/nicoalbrecht/semantic-duration-input/compare/v0.2.0...v0.2.1) (2026-09-25)


### Features

* Add formatPreview prop for custom preview text ([#4](https://github.com/nicoalbrecht/semantic-duration-input/issues/4)) ([5e0023d](https://github.com/nicoalbrecht/semantic-duration-input/commit/5e0023dd30df977149301b8ab09cfc935c51625d))


### Fixes

* address code review findings ([#2](https://github.com/nicoalbrecht/semantic-duration-input/issues/2)) ([48e0f1a](https://github.com/nicoalbrecht/semantic-duration-input/commit/48e0f1a1a4caeba827c0ec71ae0d7764fb9dce03))

## 0.2.0 (2026-09-25)

### Breaking changes

See [Migrating to 0.2](https://nicoalbrecht.github.io/semantic-duration-input/migration/0.2) for details.

- The core works in seconds. `parseDuration` returns `seconds` next to `minutes`. `min`/`max` in `ParseOptions`, `formatDuration`'s input and `formatErrorMessage`'s bounds are in seconds.
- Locales are objects: `locales: [en, de]` instead of `['en', 'de']`, and `locale` replaces `displayLocale`. `customAliases` is gone: extend a locale with `defineLocale` instead. `LOCALE_ALIASES`, `ERROR_MESSAGES` and `UNIT_MINUTES` are replaced by the locale objects and `UNIT_SECONDS`.
- Errors are no longer shown while typing by default (`validateOn: 'eager'`). Use `validateOn: 'input'` for the old behaviour.
- `1h 30` is now 90 minutes instead of `missing_unit` (`implicitUnits`).
- `name` goes to a hidden input with the model value instead of the text input.
- Renderless slot: `minutes` is now `value`.

### Features

- `valueFormat`: store `'minutes'`, `'seconds'`, `'ms'`, `'iso'` or a custom conversion in `v-model`.
- `precision: 'second'` accepts and keeps seconds (`30s`, `1:02:03`).
- ISO 8601 input (`PT1H30M`, `P2W`) and `toIso` / `fromIso`.
- `validateOn`, `presets` (ARIA combobox), `preview` with a screen reader announcement, keyboard stepping (`step`, `snapToStep`), `clamp`, `defaultUnit`, and typo suggestions for unknown units.
- Native form support through a hidden input, and `validate()` / `revert()` / `stepBy()` on the component.
- `durationSchema()`, a Standard Schema for Valibot, ArkType, TanStack Form, VeeValidate and others.
- `semantic-duration-input/core` entry without Vue or Tailwind, and a Nuxt module at `semantic-duration-input/nuxt`.
- Theming through `--sdi-*` tokens with shadcn-vue and Nuxt UI fallbacks, `ui` classes per part, `size`, `variant` and `unstyled`.
- `as` with `invalidProps` presets for Vuetify, PrimeVue and Nuxt UI, and app-wide defaults through the plugin.

### Fixes

- `--sdi-*` tokens set on an ancestor (e.g. `:root`) now take effect. Previously only tokens set on the component itself did.
- With `required`, clearing the field now sets `v-model` to `null` (and still reports `empty`) instead of keeping the old value.
- The root element has the `group` class, so `group-data-invalid:` and similar variants work.
- The presets menu no longer reopens after picking an option with Enter.

### Docs

- Documentation site with live examples: https://nicoalbrecht.github.io/semantic-duration-input/
- TSDoc on the public API, shown in editor hovers.

## 0.1.0

- Initial version: a Vue 3 input that parses human-friendly durations into minutes.
