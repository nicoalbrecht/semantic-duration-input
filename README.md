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

const minutes = ref<number | null>(90)
</script>

<template>
  <DurationInput v-model="minutes" placeholder="e.g. 1h 30m" />
</template>
```

Then add the styles, see [Styling](#styling). You can also register the component globally with `app.use(plugin)`, optionally with [app-wide defaults](#app-wide-defaults).

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
- Invalid input leaves `v-model` unchanged. The input gets `aria-invalid="true"`, the root gets `data-invalid`, an error message is shown below the field (linked via `aria-describedby`) and an `error` event is emitted.
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
| `disabled` | `boolean` | `false` | |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Field size |
| `variant` | `'outline' \| 'soft' \| 'ghost'` | `'outline'` | Field look |
| `preview` | `boolean` | `false` | Shows the normalized value (`= 1h 30min`) inside the field while typing |
| `messages` | `{ [code]: string } \| false` | – | Overrides the error texts (may use `{min}`/`{max}`), or `false` to hide them |
| `ui` | `{ root?, field?, input?, leading?, trailing?, preview?, message? }` | – | Extra classes per part, see [Styling](#styling) |
| `unstyled` | `boolean` | `false` | Drops all default classes |
| `as` | `Component \| string` | – | Renders another input component, see [Integrations](#integrations) |
| `invalidProps` | `(state) => props` | – | Maps the invalid state onto the `as` component's props |

`class` and `style` go to the root element. All other attributes (`id`, `name`, `placeholder`, `data-*`, ...) go to the `<input>`. The component exposes `focus()` and `blur()`.

**Slots:** `leading` and `trailing` (icons, a unit hint, a clear button), and `default` for [renderless use](#any-other-component-renderless-slot).

**Events:** `update:modelValue(minutes | null)`, `error(code | null)` with codes `empty`, `invalid_format`, `unknown_unit`, `missing_unit` and `out_of_range`.

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

Structure: `root` › `field` › (`leading`, `input`, `preview`, `trailing`), then `message`. Each element carries `data-slot="<part>"`. The root also carries `data-invalid`, `data-disabled`, `data-size` and `data-variant`, which you can target with Tailwind variants such as `group-data-invalid:`.

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
- `text`, `minutes`, `error`, `invalid`, `message`, `messageId`, `preview` and `onBlur`.

### App-wide defaults

Pass defaults to the plugin, and they apply to every instance. Props set on the component still win.

```ts
import { plugin as DurationInputPlugin } from 'semantic-duration-input'
import { Input } from '@/components/ui/input'

app.use(DurationInputPlugin, { as: Input, displayLocale: 'de', preview: true })
```

## Headless usage

```ts
import { parseDuration, formatDuration, useDurationInput } from 'semantic-duration-input'

parseDuration('1h 30m') // { ok: true, minutes: 90 }
parseDuration('45')     // { ok: false, error: 'missing_unit' }
formatDuration(11340, { style: 'long', locale: 'de' }) // '7 Tage 21 Stunden'
formatErrorMessage('out_of_range', { min: 30, max: 480 }) // 'Must be between 30min and 8h.'

// Build your own input UI:
const { text, error, preview, onInput, onBlur } = useDurationInput(minutesRef, { displayStyle: 'long' })
```

## Development

```sh
npm run dev        # demo playground
npm test           # vitest
npm run typecheck  # vue-tsc
npm run build      # library build to dist/
```

TypeScript is pinned to 6.x because TypeScript 7 no longer provides the JS compiler API that `vue-tsc` and `vite-plugin-dts` need.
