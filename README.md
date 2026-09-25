# semantic-duration-input

A Vue 3 input that understands human-friendly durations and gives you **minutes** (or seconds, milliseconds or ISO 8601) via `v-model`.

| You type | `v-model` |
| --- | --- |
| `2h` | `120` |
| `3days` | `4320` |
| `189h` | `11340` (shown as `7d 21h` after blur) |
| `10 hours` | `600` |
| `59 min` | `59` |
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

Then add the styles, see [Styling](#styling). You can also register the component globally with `app.use(plugin)`, optionally with [app-wide defaults](#app-wide-defaults).

## Syntax

- **Units**: seconds (with `precision="second"`), minutes, hours, days, weeks. Months and years are left out because their length varies. `m` always means minutes.
  - English: `s sec secs second seconds`, `m min mins minute minutes`, `h hr hrs hour hours`, `d day days`, `w wk wks week weeks`
  - German: `s sek sekunde sekunden`, `min minute minuten`, `h std stunde stunden`, `d t tag tage tagen`, `w wo woche wochen`
- **Compound values**: `1d 2h 30min`, `2d4h`. They can be separated by spaces, `,`, `+`, `&`, `and` or `und`.
- **Implicit units**: a trailing number takes the next smaller unit: `1h30` is 1h 30min, `1d 4` is 1d 4h. Turn this off with `:implicit-units="false"`.
- **Decimals**: `1.5h` or `1,5h`. Results are rounded to whole minutes (or seconds).
- **Clock format**: `h:mm`, e.g. `1:30` or `26:05`. With `precision="second"` also `h:mm:ss`.
- **ISO 8601**: `PT1H30M`, `P1DT2H`, `P2W`, e.g. pasted from an API.
- Case and extra whitespace are ignored.
- A bare number (`45`) is rejected with `missing_unit`, because it's ambiguous. Set `default-unit="minute"` to accept it.
- Typos get a suggestion: `2 huors` → *Unknown unit "huors". Did you mean "hours"?*

## Behaviour

- Valid input updates `v-model` while you type. Clearing the field sets it to `null`.
- Invalid input leaves `v-model` unchanged. When the error is shown (see `validateOn`), the input gets `aria-invalid="true"`, the root gets `data-invalid`, an error message is shown below the field (linked via `aria-describedby`) and an `error` event is emitted.
- **`validateOn`** controls when errors appear:
  - `eager` (default): not while you're still typing. The error appears on blur or Enter, and while it's shown it updates live, so fixing the input clears it right away.
  - `blur`: the shown error only changes on blur or Enter.
  - `input`: the error updates on every keystroke.
- On blur and Enter, valid text is rewritten to a normalized form (`189h` → `7d 21h`).
- If `v-model` is changed from outside, the text is reformatted.
- With `preview`, the normalized value is shown in the field and announced to screen readers through a polite live region, after a short pause in typing.

### Keyboard

| Key | Action |
| --- | --- |
| <kbd>↑</kbd> / <kbd>↓</kbd> | Step by `step` (default 15min), snapping to multiples: `1h07` → `1h15` |
| <kbd>Shift</kbd> + <kbd>↑</kbd> / <kbd>↓</kbd> | Step by 1 hour |
| <kbd>PgUp</kbd> / <kbd>PgDn</kbd> | Step by 1 day |
| <kbd>Enter</kbd> | Normalize and show errors. The form still submits. |
| <kbd>Esc</kbd> | Revert to the last committed value. The event only stops propagating if something was reverted, so closing a dialog still works. |
| <kbd>Alt</kbd> + <kbd>↓</kbd> | Open the presets menu |

Steps stay within `min`/`max` and never go below zero. `:step="false"` turns stepping off.

### Presets

`presets` shows suggestions in a menu below the field. It opens on focus while the field is empty, on <kbd>Alt</kbd>+<kbd>↓</kbd>, and while typing (filtered by label). While it's open, arrows move through the options, <kbd>Enter</kbd> picks one and <kbd>Esc</kbd> closes it. The input is a proper ARIA combobox.

```vue
<DurationInput v-model="minutes" :presets="['15m', '30m', '1h', { label: 'Half a day', value: '4h' }]" />
```

Entries are duration text, numbers in the model's unit, or `{ label, value }`. Style the menu through `ui.menu` and `ui.option` (the active option has `data-active`). With `as` or the renderless slot, render them yourself from the `presets` and `selectPreset` slot props.

## Props

| Prop | Type | Default | |
| --- | --- | --- | --- |
| `modelValue` | `number \| string \| null` | `null` | The duration, see `valueFormat` |
| `valueFormat` | `'minutes' \| 'seconds' \| 'ms' \| 'iso' \| { toModel, fromModel }` | `'minutes'` | How `v-model` stores the duration, see [Value formats](#value-formats) |
| `precision` | `'minute' \| 'second'` | `'minute'` | `'second'` accepts `30s` and `h:mm:ss` and keeps seconds |
| `locales` | `DurationLocale[]` | `[en, de]` | Which unit names and separator words are accepted, see [Locales](#locales) |
| `locale` | `DurationLocale` | first of `locales` | Language of the normalized text and the messages |
| `displayStyle` | `'short' \| 'long'` | `'short'` | `1d 2h 30min` vs `1 day 2 hours 30 minutes` |
| `displayUnits` | `UnitKey[]` | `['day', 'hour', 'minute']` (+ `'second'`) | Units used in the normalized text |
| `implicitUnits` | `boolean` | `true` | `1h30` means 1h 30min |
| `defaultUnit` | `UnitKey` | – | Unit for a bare number, e.g. `'minute'` |
| `min` / `max` | `number \| string` | – | Inclusive bounds: a number in the model's unit, or text like `'8h'` (`out_of_range`) |
| `step` | `number \| string \| false` | `'15m'` | Arrow-key step |
| `snapToStep` | `boolean` | `false` | Round to the nearest `step` on blur/Enter |
| `clamp` | `boolean` | `false` | Clamp to `min`/`max` instead of reporting `out_of_range` |
| `validateOn` | `'eager' \| 'blur' \| 'input'` | `'eager'` | When errors are shown, see [Behaviour](#behaviour) |
| `required` | `boolean` | `false` | Empty input becomes an `empty` error |
| `disabled` | `boolean` | `false` | |
| `presets` | `(number \| string \| { label?, value })[]` | – | Suggestions menu, see [Presets](#presets) |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Field size |
| `variant` | `'outline' \| 'soft' \| 'ghost'` | `'outline'` | Field look |
| `preview` | `boolean` | `false` | Shows the normalized value (`= 1h 30min`) inside the field while typing, and announces it to screen readers |
| `messages` | `{ [key]: string } \| false` | – | Overrides the error texts (may use `{min}`, `{max}`, `{token}`, `{suggestion}`), or `false` to hide them |
| `ui` | `{ root?, field?, input?, leading?, trailing?, preview?, message?, menu?, option? }` | – | Extra classes per part, see [Styling](#styling) |
| `unstyled` | `boolean` | `false` | Drops all default classes |
| `as` | `Component \| string` | – | Renders another input component, see [Integrations](#integrations) |
| `invalidProps` | `(state) => props` | – | Maps the invalid state onto the `as` component's props |

`class` and `style` go to the root element. `name` goes to a hidden input, see [Forms](#forms-and-validation). All other attributes (`id`, `placeholder`, `data-*`, ...) go to the `<input>`. The component exposes `focus()`, `blur()`, `commit()`, `validate()`, `revert()` and `stepBy(direction, seconds?)`.

**Slots:** `leading` and `trailing` (icons, a unit hint, a clear button), and `default` for [renderless use](#any-other-component-renderless-slot).

**Events:** `update:modelValue(value | null)`, `error(code | null)` (the shown error, see `validateOn`) with codes `empty`, `invalid_format`, `unknown_unit`, `missing_unit` and `out_of_range`.

## Value formats

The parser works in seconds, and `valueFormat` decides what ends up in `v-model`:

| `valueFormat` | `1h 30m` becomes |
| --- | --- |
| `'minutes'` (default) | `90` |
| `'seconds'` | `5400` |
| `'ms'` | `5400000` |
| `'iso'` | `'PT1H30M'` |
| `{ toModel(seconds), fromModel(value) }` | whatever you return |

Numeric `min`, `max`, `step` and `presets` are in the same unit (minutes for `'iso'`). Duration text like `'8h'` works with any format.

With `valueFormat: 'minutes'` and `precision="second"`, the model can be fractional (`1m30s` → `1.5`).

## Locales

English and German are built in. A locale is a plain object with unit aliases, separator words, labels for the normalized text, and error messages:

```ts
import { defineLocale, en } from 'semantic-duration-input'

const hu = defineLocale({
  ...en,
  code: 'hu',
  aliases: { minute: ['p', 'perc'], hour: ['ó', 'óra'], day: ['nap'], week: ['hét'] },
  separators: ['és'],
  labels: undefined, // use Intl.DurationFormat for the normalized text where available
  messages: { ...en.messages, empty: 'Adj meg egy időtartamot.' },
})
```

```vue
<DurationInput v-model="minutes" :locales="[hu, en]" :locale="hu" />
```

Without `labels`, the text is formatted with `Intl.DurationFormat` using `code`, or falls back to English labels. Make sure the parser can read what the formatter writes: add the words it produces to `aliases` and `separators`.

## Forms and validation

**Native forms:** with a `name`, a hidden input carries the model value (`90`, or `PT1H30M` with `'iso'`), so the form submits what `v-model` holds, not the typed text. This also works with `as`. The renderless slot gets `hiddenInputProps`.

```vue
<form method="post">
  <DurationInput name="estimate" required />
</form>
```

**Show errors on submit:** call `validate()` through a template ref. It returns whether the input is valid and shows the error, whatever `validateOn` is set to.

**Schema validation:** `durationSchema()` is a [Standard Schema](https://standardschema.dev), so it works directly with Valibot, ArkType, TanStack Form, VeeValidate and others. It parses text into the model value, and range-checks values that already are numbers:

```ts
import { durationSchema } from 'semantic-duration-input/core'

const estimate = durationSchema({ required: true, max: '8h', valueFormat: 'minutes' })
estimate['~standard'].validate('1h30') // { value: 90 }
estimate['~standard'].validate('9h')   // { issues: [{ message: 'Must be at most 8h.' }] }
```

With Zod, use `parseDuration` in a transform:

```ts
import { z } from 'zod'
import { formatErrorMessage, parseDuration } from 'semantic-duration-input/core'

const minutes = z.string().transform((text, ctx) => {
  const result = parseDuration(text)
  if (result.ok) return result.minutes
  ctx.addIssue({ code: 'custom', message: formatErrorMessage(result) })
  return z.NEVER
})
```

## Styling

The built-in field is styled with Tailwind CSS v4 utilities. It follows your theme through a few CSS variables, and each variable falls back to the shadcn-vue and Nuxt UI tokens when those are present.

**With Tailwind v4:** import our entry after Tailwind. It lets Tailwind scan the component for its classes and adds the tokens:

```css
@import 'tailwindcss';
@import 'semantic-duration-input/tailwind.css';
```

**Without Tailwind:** import the prebuilt stylesheet. It contains only the utilities the component uses (no preflight/reset), wrapped in cascade layers so your own CSS wins:

```ts
import 'semantic-duration-input/style.css'
```

### Tokens

| Variable | Falls back to (shadcn-vue → Nuxt UI → neutral) |
| --- | --- |
| `--sdi-fg` | `--foreground` → `--ui-text` → `currentColor` |
| `--sdi-bg` | `transparent` |
| `--sdi-border` | `--input` → `--ui-border-accented` → 25% `currentColor` |
| `--sdi-ring` | `--ring` → `--ui-primary` → `Highlight` |
| `--sdi-invalid` | `--destructive` → `--ui-error` → `#dc2626` |
| `--sdi-muted` | `--muted-foreground` → `--ui-text-muted` → 55% `currentColor` |
| `--sdi-soft` | `--muted` → `--ui-bg-elevated` → 8% `currentColor` |
| `--sdi-popover` | `--popover` → `--ui-bg` → `Canvas` |

The neutral fallbacks are derived from `currentColor`, so dark mode works without extra setup. Override the tokens on the component or on any ancestor:

```vue
<DurationInput class="[--sdi-ring:var(--color-emerald-500)]" />
```

### Classes

Every part takes extra classes through `ui`. They are merged with [tailwind-merge](https://github.com/dcastil/tailwind-merge), so conflicting defaults get replaced (`rounded-full` removes `rounded-md`). A `class` attribute is merged into `root` the same way.

```vue
<DurationInput
  size="lg"
  variant="soft"
  preview
  :ui="{ field: 'rounded-full px-5', preview: 'text-violet-500' }"
>
  <template #leading><ClockIcon class="size-4" /></template>
</DurationInput>
```

Structure: `root` › `field` › (`leading`, `input`, `preview`, `trailing`, `menu` › `option`), then `message`. Each element carries `data-slot="<part>"`. The root also carries `data-invalid`, `data-disabled`, `data-size` and `data-variant`, which you can target with Tailwind variants such as `group-data-invalid:`.

Use `unstyled` to start from zero. Only your `ui` classes are then applied:

```vue
<DurationInput
  unstyled
  :ui="{ root: 'group', field: 'border-b-2 group-data-invalid:border-red-500', input: 'w-full outline-none' }"
/>
```

To change the defaults for a whole design system, extend the theme with [tailwind-variants](https://www.tailwind-variants.org), then pass the parts through `ui` or [app-wide defaults](#app-wide-defaults):

```ts
import { tv } from 'tailwind-variants'
import { durationInputTheme } from 'semantic-duration-input'

export const myDurationInput = tv({ extend: durationInputTheme, slots: { field: 'rounded-none' } })
```

## Integrations

Use `as` to render your UI library's input. The component binds `modelValue`, `update:modelValue` and `blur`, and passes through attributes and all slots except `default`, so the library's own props and slots keep working. `size` and `variant` are passed through too.

`aria-invalid` is always set. `invalidProps` maps the error state onto library-specific props, and presets are included for Vuetify, PrimeVue and Nuxt UI. They receive `{ invalid, error, message, onBlur }`. In `as` mode the component renders no message of its own, so show it through the library, as the Vuetify preset does.

### shadcn-vue

Its `Input` already styles `aria-invalid`, so no preset is needed. The built-in field also picks up shadcn's tokens automatically.

```vue
<script setup lang="ts">
import { Input } from '@/components/ui/input'
</script>

<template>
  <DurationInput v-model="minutes" :as="Input" placeholder="e.g. 1h 30m" />
</template>
```

### Nuxt UI

```vue
<script setup lang="ts">
import { nuxtUi } from 'semantic-duration-input'
</script>

<template>
  <UFormField label="Duration">
    <DurationInput v-model="minutes" :as="UInput" :invalid-props="nuxtUi" icon="i-lucide-clock" />
  </UFormField>
</template>
```

In Nuxt, `UInput` is auto-imported but you need the component itself: `import { UInput } from '#components'`.

### Vuetify

```vue
<script setup lang="ts">
import { VTextField } from 'vuetify/components'
import { vuetify } from 'semantic-duration-input'
</script>

<template>
  <DurationInput v-model="minutes" :as="VTextField" :invalid-props="vuetify" label="Duration" variant="outlined" />
</template>
```

The preset sets `error` and `error-messages`, and normalizes the text on `update:focused`.

If you also use Tailwind next to Vuetify, some class names collide (`.border`, `.rounded-*`, ...). Order the cascade layers so Tailwind's utilities win:

```css
@layer theme, base, vuetify-core, components, vuetify-components, vuetify-overrides, vuetify-utilities, utilities, vuetify-final;
```

### PrimeVue

```vue
<script setup lang="ts">
import InputText from 'primevue/inputtext'
import { primevue } from 'semantic-duration-input'
</script>

<template>
  <DurationInput v-model="minutes" :as="InputText" :invalid-props="primevue" fluid />
</template>
```

### Any other component (renderless slot)

For full control, pass a default slot. The component then renders nothing but your slot, and handles only the parsing:

```vue
<DurationInput v-model="minutes" v-slot="{ inputProps, invalid, message, messageId, preview }">
  <MyField :invalid="invalid" :hint="preview" :error="message" :error-id="messageId">
    <MyInput v-bind="inputProps" />
  </MyField>
</DurationInput>
```

The slot props are:

- `inputProps` for components with a `modelValue` contract.
- `nativeInputProps` (`value`/`onInput`/`onBlur`) for a plain `<input>`.
- `hiddenInputProps` for an `<input type="hidden">` (or `null` without a `name`).
- `text`, `value`, `error` (shown), `errorDetail`, `rawError` (shown or not), `invalid`, `message`, `messageId` and `preview`.
- `presets` and `selectPreset(preset)`.
- `onBlur`, `onKeydown`, `commit`, `validate`, `revert` and `stepBy`.

### App-wide defaults

Pass defaults to the plugin, and they apply to every instance. Props set on the component still win.

```ts
import { plugin as DurationInputPlugin } from 'semantic-duration-input'
import { Input } from '@/components/ui/input'

app.use(DurationInputPlugin, { as: Input, locale: de, preview: true, validateOn: 'blur' })
```

### Nuxt

Add the module. It auto-imports `<DurationInput>`, `useDurationInput`, `parseDuration` and `formatDuration`, and applies the defaults from `nuxt.config`:

```ts
export default defineNuxtConfig({
  modules: ['@nuxt/ui', 'semantic-duration-input/nuxt'],
  durationInput: {
    as: 'UInput',          // any component name from #components
    invalidProps: 'nuxtUi', // 'nuxtUi' | 'vuetify' | 'primevue'
    preview: true,
  },
})
```

Options that are functions or components can't be serialized, so pass `as` as a component name and `invalidProps` as a preset name. The prebuilt stylesheet is added unless `as` is set, or set `css: false`.

## Headless usage

The parser, formatter and validation have their own entry point, without Vue or Tailwind. It works in Node, e.g. to validate on the server:

```ts
import { parseDuration, formatDuration, formatErrorMessage, toIso, de } from 'semantic-duration-input/core'

parseDuration('1h 30m') // { ok: true, seconds: 5400, minutes: 90 }
parseDuration('45')     // { ok: false, error: 'missing_unit', token: '45', index: 0 }
parseDuration('2 huors') // { ok: false, error: 'unknown_unit', token: 'huors', index: 2, suggestion: 'hours' }
formatDuration(680400, { style: 'long', locale: de }) // '7 Tage 21 Stunden' (takes seconds)
formatErrorMessage('out_of_range', { min: 1800, max: 28800 }) // 'Must be between 30min and 8h.'
toIso(5400) // 'PT1H30M'
```

To build your own input UI in Vue:

```ts
import { useDurationInput } from 'semantic-duration-input'

const { text, error, preview, onInput, onBlur, onKeydown } = useDurationInput(modelRef, { valueFormat: 'seconds' })
```

## Breaking changes in 0.2

- The core works in seconds. `parseDuration` returns `seconds` next to `minutes`. `min`/`max` in `ParseOptions`, `formatDuration`'s input and `formatErrorMessage`'s bounds are in seconds.
- Locales are objects: `locales: [en, de]` instead of `['en', 'de']`, and `locale` replaces `displayLocale`. `customAliases` is gone: extend a locale with `defineLocale` instead. `LOCALE_ALIASES`, `ERROR_MESSAGES` and `UNIT_MINUTES` are replaced by the locale objects and `UNIT_SECONDS`.
- Errors are no longer shown while typing by default (`validateOn: 'eager'`). Use `validateOn: 'input'` for the old behaviour.
- `1h 30` is now 90 minutes instead of `missing_unit` (`implicitUnits`).
- `name` goes to a hidden input with the model value instead of the text input.
- Renderless slot: `minutes` is now `value`.

## Development

```sh
npm run dev        # demo playground
npm test           # vitest
npm run typecheck  # vue-tsc
npm run build      # library build to dist/
```

TypeScript is pinned to 6.x because TypeScript 7 no longer provides the JS compiler API that `vue-tsc` and `vite-plugin-dts` need.
