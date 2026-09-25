# Behaviour

## Typing and committing

- Valid input updates `v-model` while you type. Invalid input leaves it unchanged.
- Clearing the field sets `v-model` to `null`. This also happens with `required`, which additionally reports an `empty` error.
- On blur and <kbd>Enter</kbd>, valid text is rewritten to a normalized form: `189h` becomes `7d 21h`.
- If `v-model` changes from outside, the text is reformatted.

## When errors appear

When an error is shown:

- The input gets `aria-invalid="true"` and `data-error="<code>"`.
- The root gets `data-invalid`.
- A message appears below the field, linked through `aria-describedby`.
- The `error` event fires with the code, and again with `null` once the error clears.

`validateOn` controls when that happens:

| `validateOn` | Behaviour |
| --- | --- |
| `'eager'` (default) | Not while you're still typing. The error appears on blur or <kbd>Enter</kbd>. While it's shown, it updates live, so fixing the input clears it right away. |
| `'blur'` | The shown error only changes on blur or <kbd>Enter</kbd>. Stepping, reverting and outside changes to `v-model` also clear it. |
| `'input'` | The error updates on every keystroke. |

Whatever the mode, calling the exposed `validate()` shows the current error, e.g. on submit.

<div class="demo-controls vp-raw">
  <label>validateOn
    <select v-model="validateOn"><option>eager</option><option>blur</option><option>input</option></select>
  </label>
</div>
<Demo :key="validateOn" :validate-on="validateOn" placeholder="Type 2 huors, then leave the field" />

<script setup>
import { ref } from 'vue'
const validateOn = ref('eager')
</script>

## Preview

With `preview`, the normalized value appears inside the field as you type (`= 1h 30min`), but only when it differs from what you typed. It's also announced to screen readers through a polite live region, after a 600 ms pause in typing so not every keystroke is read out.

<Demo preview placeholder="Type 90m" />

`preview` only works with the built-in field. With [`as`](./integrations), use the `preview` slot prop of the [renderless slot](./integrations#any-other-component-renderless-slot) instead.

### Custom preview

`formatPreview` renders the preview yourself. It gets the duration in seconds and a context with the default preview (`normalized`), the typed `text`, the model `value` and the display `locale`:

```vue
<DurationInput
  v-model="minutes"
  preview
  :format-preview="(seconds, { value }) => `≈ ${(seconds / 3600).toFixed(1)} hours (${value} min)`"
/>
```

<Demo preview :format-preview="(seconds, { value }) => `≈ ${(seconds / 3600).toFixed(1)} hours (${value} min)`" placeholder="Type 90m" />

Its output is shown and announced as is, without the leading `= `. The preview still only appears while the text differs from its normalized form, so it goes away on blur. Return `null` to hide it for a value.

`formatPreview` changes the `preview` slot prop and the `preview` of `useDurationInput` too. It only affects the preview: the text is still normalized with `displayStyle` and `displayUnits` on blur.

## Keyboard

| Key | Action |
| --- | --- |
| <kbd>↑</kbd> / <kbd>↓</kbd> | Step by `step` (default 15min), snapping to multiples: `1h07` → `1h15` / `1h` |
| <kbd>Shift</kbd> + <kbd>↑</kbd> / <kbd>↓</kbd> | Step by 1 hour, snapping to whole hours |
| <kbd>PgUp</kbd> / <kbd>PgDn</kbd> | Step by 1 day, snapping to whole days |
| <kbd>Enter</kbd> | Normalize and show errors. The form still submits, unless a preset is highlighted in the open menu, in which case that preset is picked |
| <kbd>Esc</kbd> | Close the presets menu, or revert to the last committed value. When reverting, the event only stops propagating if something was reverted, so closing a dialog still works |
| <kbd>Alt</kbd> + <kbd>↓</kbd> | Open the presets menu |

Details:

- Steps stay within `min`/`max` and never go below zero.
- If the text is invalid, stepping starts from the last valid value. From an empty field, <kbd>↑</kbd> gives one step and <kbd>↓</kbd> gives zero.
- `:step="false"` turns all stepping off, including <kbd>Shift</kbd> and <kbd>PgUp</kbd>/<kbd>PgDn</kbd>.
- Keys pressed with <kbd>Ctrl</kbd>, <kbd>Cmd</kbd> or <kbd>Alt</kbd> are left alone (apart from <kbd>Alt</kbd>+<kbd>↓</kbd>), so browser shortcuts keep working.

<Demo :initial="67" min="30m" max="8h" />

### Snapping and clamping

- `snapToStep` rounds to the nearest `step` on blur and <kbd>Enter</kbd>, then keeps the result within `min`/`max`.
- `clamp` keeps values within `min`/`max` instead of reporting `out_of_range`. It applies while typing and on commit.

<Demo snap-to-step clamp max="2h" placeholder="Type 1h07 or 5h, then leave the field" />

## Presets

`presets` shows suggestions in a menu below the field. The input is an ARIA combobox.

- **Opens** on focus or click while the field is empty, on <kbd>Alt</kbd>+<kbd>↓</kbd>, and while typing, filtered by label.
- **While it's open:** the arrow keys move through the options, <kbd>Enter</kbd> picks the highlighted one, and <kbd>Esc</kbd> closes it. <kbd>Tab</kbd> and blur close it too.

```vue
<DurationInput v-model="minutes" :presets="['15m', '30m', '1h', { label: 'Half a day', value: '4h' }]" />
```

<Demo :presets="['15m', '30m', '1h', '2h', { label: 'Half a day', value: '4h' }]" placeholder="Focus me" />

Each entry is one of:

- duration text,
- a number in the model's unit,
- `{ label, value }`.

Entries that can't be parsed are dropped. Style the menu through `ui.menu` and `ui.option`; the highlighted option has `data-active`.

The built-in menu is not rendered with `as`. To show presets with your own component, use the [renderless slot](./integrations#any-other-component-renderless-slot), which gets `presets` and `selectPreset`.
