# Value formats

The parser works in seconds. `valueFormat` decides what ends up in `v-model`:

| `valueFormat` | `1h 30m` becomes |
| --- | --- |
| `'minutes'` (default) | `90` |
| `'seconds'` | `5400` |
| `'ms'` | `5400000` |
| `'iso'` | `'PT1H30M'` |
| `{ toModel(seconds), fromModel(value) }` | whatever you return |

<div class="demo-controls vp-raw">
  <label>valueFormat
    <select v-model="format"><option>minutes</option><option>seconds</option><option>ms</option><option>iso</option></select>
  </label>
</div>
<Demo :key="format" :value-format="format" placeholder="Type 1h 30m" />

<script setup>
import { ref } from 'vue'
const format = ref('minutes')
</script>

Empty input is always `null`.

For numeric formats, the model must be a number: a numeric string such as `"90"` counts as empty.

ISO output is written in the `PnDTnHnMnS` form without weeks, which is the most widely supported: two weeks become `P14D`.

## Bounds, steps and presets

Numeric `min`, `max`, `step` and `presets` are in the model's unit:

- minutes for `'minutes'` and `'iso'`,
- seconds for `'seconds'`,
- milliseconds for `'ms'`,
- whatever `fromModel` accepts for a custom format.

Duration text like `'8h'` works with any format. Text that can't be parsed is ignored.

## Seconds precision

With `precision="second"`, seconds are accepted (`30s`, `1:02:03`) and kept. With `valueFormat: 'minutes'`, the model can then be fractional: `1m30s` becomes `1.5`.

## Custom formats

```ts
import type { CustomValueFormat } from 'semantic-duration-input'

// Store hours as a decimal number.
const hours: CustomValueFormat<number> = {
  toModel: (seconds) => seconds / 3600,
  fromModel: (value) => (typeof value === 'number' ? value * 3600 : null),
}
```

```vue
<DurationInput v-model="hoursWorked" :value-format="hours" />
```

`fromModel` should return `null` for values that aren't a duration.
