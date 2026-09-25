# semantic-duration-input

A Vue 3 input that understands human-friendly durations and gives you **minutes** via `v-model`.

| You type | `v-model` |
| --- | --- |
| `2h` | `120` |
| `3days` | `4320` |
| `189h` | `11340` (shown as `7d 21h` after blur) |
| `10 hours` | `600` |
| `59 min` | `59` |
| `1h 30m`, `1h30m`, `1 hour and 30 minutes` | `90` |
| `1.5h`, `1,5 Std` | `90` |
| `1:30` | `90` |
| `2 Stunden 15 Minuten` | `135` |

## Install

```sh
npm install semantic-duration-input
```

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { DurationInput } from 'semantic-duration-input'
import 'semantic-duration-input/style.css' // optional: red border for invalid input

const minutes = ref<number | null>(90)
</script>

<template>
  <DurationInput v-model="minutes" placeholder="e.g. 1h 30m" />
</template>
```

Or register it globally with `app.use(plugin)`.

## Syntax

- **Units**: minutes, hours, days, weeks. Months and years are left out because their length varies. `m` always means minutes.
  - English: `m min mins minute minutes`, `h hr hrs hour hours`, `d day days`, `w wk wks week weeks`
  - German: `min minute minuten`, `h std stunde stunden`, `d t tag tage tagen`, `w wo woche wochen`
- **Compound values**: `1d 2h 30min`, `2d4h`. They can be separated by spaces, `,`, `+`, `&`, `and` or `und`.
- **Decimals**: `1.5h` or `1,5h`. Results are rounded to whole minutes.
- **Clock format**: `h:mm`, e.g. `1:30` or `26:05`.
- Case and extra whitespace are ignored.
- A bare number (`45`) is rejected with `missing_unit`, because it's ambiguous.

## Behaviour

- Valid input updates `v-model` while you type. Clearing the field sets it to `null`.
- Invalid input leaves `v-model` unchanged. The field gets `aria-invalid="true"` and the `sdi--invalid` class, and an `error` event is emitted.
- On blur, valid text is rewritten to a normalized form (`189h` → `7d 21h`).
- If `v-model` is changed from outside, the text is reformatted.

## Props

| Prop | Type | Default | |
| --- | --- | --- | --- |
| `modelValue` | `number \| null` | `null` | Duration in minutes |
| `locales` | `('en' \| 'de')[]` | `['en', 'de']` | Which built-in unit names are accepted |
| `customAliases` | `{ minute?, hour?, day?, week?: string[] }` | – | Extra unit names, e.g. `{ hour: ['óra'] }` |
| `displayLocale` | `'en' \| 'de'` | `'en'` | Language of the normalized text |
| `displayStyle` | `'short' \| 'long'` | `'short'` | `1d 2h 30min` vs `1 day 2 hours 30 minutes` |
| `displayUnits` | `UnitKey[]` | `['day', 'hour', 'minute']` | Units used in the normalized text |
| `min` / `max` | `number` | – | Inclusive bounds in minutes (`out_of_range`) |
| `required` | `boolean` | `false` | Empty input becomes an `empty` error |

Any other attributes (`id`, `name`, `placeholder`, `disabled`, `class`, `data-*`, ...) are passed through to the `<input>`. The component exposes `focus()` and `blur()`.

**Events:** `update:modelValue(minutes | null)`, `error(code | null)` with codes `empty`, `invalid_format`, `unknown_unit`, `missing_unit` and `out_of_range`.

## Headless usage

```ts
import { parseDuration, formatDuration, useDurationInput } from 'semantic-duration-input'

parseDuration('1h 30m') // { ok: true, minutes: 90 }
parseDuration('45')     // { ok: false, error: 'missing_unit' }
formatDuration(11340, { style: 'long', locale: 'de' }) // '7 Tage 21 Stunden'

// Build your own input UI:
const { text, error, onInput, onBlur } = useDurationInput(minutesRef, { displayStyle: 'long' })
```

## Development

```sh
npm run dev        # demo playground
npm test           # vitest
npm run typecheck  # vue-tsc
npm run build      # library build to dist/
```

TypeScript is pinned to 6.x because TypeScript 7 no longer provides the JS compiler API that `vue-tsc` and `vite-plugin-dts` need.
