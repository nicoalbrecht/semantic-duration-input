# Headless usage

## Core

The parser, formatter and validation have their own entry point, without Vue or Tailwind. It works in Node, e.g. to validate on the server:

```ts
import { parseDuration, formatDuration, formatErrorMessage, toIso, de } from 'semantic-duration-input/core'

parseDuration('1h 30m')  // { ok: true, seconds: 5400, minutes: 90 }
parseDuration('45')      // { ok: false, error: 'missing_unit', token: '45', index: 0 }
parseDuration('2 huors') // { ok: false, error: 'unknown_unit', token: 'huors', index: 2, suggestion: 'hours' }
formatDuration(680400, { style: 'long', locale: de }) // '7 Tage 21 Stunden' (takes seconds)
formatErrorMessage('out_of_range', { min: 1800, max: 28800 }) // 'Must be between 30min and 8h.'
toIso(5400) // 'PT1H30M'
```

All of it is described in the [Core API reference](../reference/core).

## `useDurationInput`

The component's logic is available as a composable, to build your own input in Vue:

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useDurationInput } from 'semantic-duration-input'

const seconds = ref<number | null>(null)
const { text, error, preview, onInput, onBlur, onKeydown } = useDurationInput(seconds, { valueFormat: 'seconds' })
</script>

<template>
  <input :value="text" :aria-invalid="error ? 'true' : undefined" @input="onInput" @blur="onBlur" @keydown="onKeydown" />
  <small v-if="preview">= {{ preview }}</small>
</template>
```

The first argument is the model ref. The second takes the component's parsing, display and validation options, as an object, ref or getter:

`valueFormat`, `locales`, `locale`, `displayStyle`, `displayUnits`, `precision`, `implicitUnits`, `defaultUnit`, `required`, `min`, `max`, `step`, `snapToStep`, `clamp`, `validateOn`

It returns:

| | |
| --- | --- |
| `text` | Ref of the text in the field |
| `seconds` | The model value in seconds |
| `error`, `errorDetail` | The shown error code, and the shown failure (see `validateOn`) |
| `rawError`, `isValid` | The current error, shown or not, and whether there is none |
| `preview` | The normalized text while it differs from what was typed |
| `settings` | Resolved options: bounds and step in seconds, locale, display units |
| `format(seconds)` | Formats with the current locale and display options |
| `onInput(event \| text \| null)` | Input handler; also takes the new text, or `null` to clear |
| `onBlur`, `onKeydown` | Blur and keyboard handlers |
| `commit()`, `validate()`, `revert()` | Return booleans: whether the text was valid / is valid / whether anything was reverted |
| `stepBy(direction, size?)` | Step by `direction` steps of `size` seconds (default: `step`) |

The component adds error messages, the presets menu, the preview announcement and the hidden form input on top. Use the [renderless slot](./integrations#any-other-component-renderless-slot) if you want those but not the markup.
