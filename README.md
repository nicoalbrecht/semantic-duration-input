# semantic-duration-input

A Vue 3 input that understands human-friendly durations and gives you **minutes** (or seconds, milliseconds or ISO 8601) via `v-model`.

**[Documentation and live examples](https://nicoalbrecht.github.io/semantic-duration-input/)**

| You type | `v-model` |
| --- | --- |
| `2h` | `120` |
| `3days` | `4320` |
| `189h` | `11340` (shown as `7d 21h` after blur) |
| `1h 30m`, `1h30m`, `1h30`, `1 hour and 30 minutes` | `90` |
| `1.5h`, `1,5 Std` | `90` |
| `1:30` | `90` |
| `2 Stunden 15 Minuten` | `135` |
| `PT1H30M` | `90` |

## Install

```sh
npm install semantic-duration-input
```

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { DurationInput } from 'semantic-duration-input'

const minutes = ref<number | null>(90)
</script>

<template>
  <DurationInput v-model="minutes" placeholder="e.g. 1h 30m" />
</template>
```

Then add the styles. With Tailwind v4:

```css
@import 'tailwindcss';
@import 'semantic-duration-input/tailwind.css';
```

Without Tailwind:

```ts
import 'semantic-duration-input/style.css'
```

## Features

- **[Syntax](https://nicoalbrecht.github.io/semantic-duration-input/guide/syntax):** units in English and German, compound values, `1h30`, decimals, `1:30`, ISO 8601, and "did you mean" suggestions for typos.
- **[Value formats](https://nicoalbrecht.github.io/semantic-duration-input/guide/value-formats):** minutes, seconds, milliseconds, ISO 8601 strings or your own conversion.
- **[Behaviour](https://nicoalbrecht.github.io/semantic-duration-input/guide/behaviour):** configurable validation timing, normalization on blur, keyboard stepping, presets menu, live preview.
- **[Locales](https://nicoalbrecht.github.io/semantic-duration-input/guide/locales):** add languages or unit names with `defineLocale`.
- **[Forms](https://nicoalbrecht.github.io/semantic-duration-input/guide/forms):** native form submission, `validate()`, and `durationSchema()` for Standard Schema libraries.
- **[Styling](https://nicoalbrecht.github.io/semantic-duration-input/guide/styling):** Tailwind v4, themable through `--sdi-*` tokens that fall back to shadcn-vue and Nuxt UI, classes per part, `unstyled`.
- **[Integrations](https://nicoalbrecht.github.io/semantic-duration-input/guide/integrations):** render shadcn-vue, Nuxt UI, Vuetify, PrimeVue or any input through `as`, or go renderless.
- **[Nuxt module](https://nicoalbrecht.github.io/semantic-duration-input/guide/nuxt)** and **[headless core](https://nicoalbrecht.github.io/semantic-duration-input/guide/headless)** (`semantic-duration-input/core`, no Vue needed).

Upgrading from 0.1? See [Migrating to 0.2](https://nicoalbrecht.github.io/semantic-duration-input/migration/0.2) and the [changelog](./CHANGELOG.md).

## Development

```sh
npm run dev          # demo playground (with PrimeVue, Vuetify and shadcn-vue)
npm run docs:dev     # documentation site
npm test             # vitest
npm run typecheck    # vue-tsc
npm run build        # library build to dist/
npm run docs:build   # documentation build to docs/.vitepress/dist
```

TypeScript is pinned to 6.x because TypeScript 7 no longer provides the JS compiler API that `vue-tsc` and `vite-plugin-dts` need.

## License

[MIT](./LICENSE)
