# Component

```ts
import { DurationInput } from 'semantic-duration-input'
```

## Props

| Prop | Type | Default | |
| --- | --- | --- | --- |
| `modelValue` | `number \| string \| null` | `null` | The duration, see `valueFormat` |
| `valueFormat` | `'minutes' \| 'seconds' \| 'ms' \| 'iso' \| { toModel, fromModel }` | `'minutes'` | How `v-model` stores the duration, see [Value formats](../guide/value-formats) |
| `precision` | `'minute' \| 'second'` | `'minute'` | `'second'` accepts `30s` and `h:mm:ss` and keeps seconds |
| `locales` | `DurationLocale[]` | `[en, de]` | Which unit names and separator words are accepted, see [Locales](../guide/locales) |
| `locale` | `DurationLocale` | first of `locales` | Language of the normalized text and the messages |
| `displayStyle` | `'short' \| 'long'` | `'short'` | `1d 2h 30min` vs `1 day 2 hours 30 minutes` |
| `displayUnits` | `UnitKey[]` | `['day', 'hour', 'minute']` (+ `'second'`) | Units used in the normalized text |
| `implicitUnits` | `boolean` | `true` | `1h30` means 1h 30min |
| `defaultUnit` | `UnitKey` | – | Unit for a bare number, e.g. `'minute'` |
| `min` / `max` | `number \| string` | – | Inclusive bounds: a number in the model's unit, or text like `'8h'` (`out_of_range`) |
| `step` | `number \| string \| false` | `'15m'` | Arrow-key step |
| `snapToStep` | `boolean` | `false` | Round to the nearest `step` on blur/Enter |
| `clamp` | `boolean` | `false` | Clamp to `min`/`max` instead of reporting `out_of_range` |
| `validateOn` | `'eager' \| 'blur' \| 'input'` | `'eager'` | When errors are shown, see [Behaviour](../guide/behaviour#when-errors-appear) |
| `required` | `boolean` | `false` | Empty input is an `empty` error |
| `disabled` | `boolean` | `false` | |
| `presets` | `(number \| string \| { label?, value })[]` | – | Suggestions menu, see [Presets](../guide/behaviour#presets). Built-in field only |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Field size. With `as`, any value is passed on |
| `variant` | `'outline' \| 'soft' \| 'ghost'` | `'outline'` | Field look. With `as`, any value is passed on |
| `preview` | `boolean` | `false` | Shows the normalized value inside the field while typing, and announces it to screen readers. Built-in field only |
| `messages` | `{ [key]: string } \| false` | – | Overrides the error texts, or `false` to hide them, see [Error messages](../guide/forms#error-messages) |
| `ui` | `{ root?, field?, input?, leading?, trailing?, preview?, message?, menu?, option? }` | – | Extra classes per part, see [Styling](../guide/styling#classes-per-part) |
| `unstyled` | `boolean` | `false` | Drops all default classes |
| `as` | `Component \| string` | – | Renders another input component, see [Integrations](../guide/integrations) |
| `invalidProps` | `(state) => props` | – | Maps the invalid state onto the `as` component's props |

## Attributes

- **Built-in field:** `class` and `style` go to the root element. `name` goes to a hidden input carrying the model value (see [Forms](../guide/forms#native-forms)). All other attributes (`id`, `placeholder`, `data-*`, ...) go to the `<input>`.
- **With `as` or the renderless slot:** `class` and `style` go to the `as` component or into `inputProps`, together with the other attributes.

## Events

| Event | Payload | |
| --- | --- | --- |
| `update:modelValue` | `value \| null` | The model changed |
| `error` | `code \| null` | The shown error changed (see `validateOn`). Codes: `empty`, `invalid_format`, `unknown_unit`, `missing_unit`, `out_of_range` |

## Slots

| Slot | |
| --- | --- |
| `leading` | Before the input: an icon, a unit hint. With `as`, all named slots are passed on to that component |
| `trailing` | After the input: a unit hint, a clear button |
| `default` | Renderless mode, see [the slot props](../guide/integrations#any-other-component-renderless-slot) |

## Exposed methods

Through a template ref:

| Method | Returns | |
| --- | --- | --- |
| `focus()` | | Focuses the input |
| `blur()` | | Blurs the input, which normalizes the text |
| `commit()` | `boolean` | Normalizes the text, shows any error and writes the value, like blur. Returns whether the text was valid |
| `validate()` | `boolean` | Shows the current error, whatever `validateOn` is, and returns whether the text is valid |
| `revert()` | `boolean` | Goes back to the last committed value. Returns whether anything changed |
| `stepBy(direction, seconds?)` | | Steps like the arrow keys, e.g. `stepBy(-2)` or `stepBy(1, 3600)` |

## Plugin

```ts
import { plugin } from 'semantic-duration-input'

app.use(plugin, defaults?)
```

Registers `<DurationInput>` globally. The optional `defaults` apply to every instance, see [App-wide defaults](../guide/integrations#app-wide-defaults). They are provided under the `DURATION_INPUT_DEFAULTS` injection key, which you can also `provide` yourself for a subtree.

## Types

Exported from `semantic-duration-input`, besides everything from [`/core`](./core#types):

| Type | |
| --- | --- |
| `DurationInputProps` | The props above |
| `DurationInputDefaults` | App-wide defaults: the props except `min`, `max`, `required` and `disabled` |
| `DurationInputUi`, `DurationInputPart` | The `ui` prop and its part names |
| `DurationInputSize`, `DurationInputVariant`, `DurationInputVariants` | Built-in sizes and looks |
| `DurationPreset`, `DurationPresetItem` | A `presets` entry, and a resolved one as given to the slot |
| `DurationInputSlotProps` | Props of the renderless slot |
| `InvalidPropsFn`, `InvalidState` | An `invalidProps` function and what it receives |
| `DurationInputOptions`, `ValidateOn` | Options of `useDurationInput` |
