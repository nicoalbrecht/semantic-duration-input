---
name: semantic-duration-input
description: Use when adding or changing a duration field in a Vue 3 or Nuxt app ("2h", "1h30", "1:30", "PT1H30M" to minutes, seconds, ms or ISO 8601), or when parsing, formatting or validating human-typed durations in JavaScript or TypeScript with the semantic-duration-input package.
---

# semantic-duration-input

A Vue 3 input that parses durations as people type them, and a Vue-free core (`semantic-duration-input/core`) with the parser, formatter and a Standard Schema.

## Read the docs for the installed version

The package ships its full documentation as Markdown, matching the installed version. Read it before using options that aren't shown below:

- `node_modules/semantic-duration-input/dist/llms-full.txt`: every docs page in one file
- `node_modules/semantic-duration-input/dist/llms.txt`: key facts and an index
- Online (latest): https://nicoalbrecht.github.io/semantic-duration-input/llms.txt

The `.d.ts` files in `dist/` document every prop and option too.

## Facts that are easy to get wrong

- `v-model` holds **whole minutes** by default and `null` when empty. Use `value-format="seconds"`, `"ms"` or `"iso"` to store something else.
- Numeric `min`, `max`, `step` and `presets` are in the model's unit. Prefer duration text such as `max="8h"`, which works with every format.
- The core functions work in **seconds**: `formatDuration(5400)` is `'1h 30min'`, and `parseDuration` returns `{ ok: true, seconds, minutes }`.
- A bare number (`45`) is a `missing_unit` error. Set `default-unit="minute"` to accept it.
- Seconds (`30s`, `1:02:03`) need `precision="second"`.
- Errors are not shown while typing by default (`validateOn: 'eager'`): they appear on blur, Enter, or `validate()`.
- The stylesheet is not injected automatically. Add one (see below) unless you render another input with `as` or use the renderless slot.

## Recipes

Basic field:

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { DurationInput } from 'semantic-duration-input'

const minutes = ref<number | null>(90)
</script>

<template>
  <DurationInput v-model="minutes" placeholder="e.g. 1h 30m" min="15m" max="8h" required />
</template>
```

Styles, with Tailwind v4 in the app's main CSS:

```css
@import 'tailwindcss';
@import 'semantic-duration-input/tailwind.css';
```

Without Tailwind: `import 'semantic-duration-input/style.css'` in the entry file.

With a UI library's input (shadcn-vue `Input` needs no preset):

```vue
<script setup lang="ts">
import { DurationInput, nuxtUi } from 'semantic-duration-input' // or vuetify, primevue
import { UInput } from '#components'
</script>

<template>
  <DurationInput v-model="minutes" :as="UInput" :invalid-props="nuxtUi" />
</template>
```

Nuxt: add `'semantic-duration-input/nuxt'` to `modules` in `nuxt.config`, with defaults under `durationInput` (e.g. `{ as: 'UInput', invalidProps: 'nuxtUi' }`). It auto-imports `<DurationInput>`.

Validation in a form library or on the server:

```ts
import { durationSchema, formatErrorMessage, parseDuration } from 'semantic-duration-input/core'

const estimate = durationSchema({ required: true, max: '8h' }) // Standard Schema, value in minutes

const result = parseDuration(body.estimate, { max: 8 * 3600 })
if (!result.ok) throw new Error(formatErrorMessage(result, { max: 8 * 3600 }))
```

Show errors on submit through a template ref: `estimateRef.value?.validate()` returns whether the field is valid.
