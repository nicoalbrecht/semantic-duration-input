# Integrations

## Rendering another input with `as`

Use `as` to render your UI library's input. The component binds these to it:

- `modelValue`, `onUpdate:modelValue`, `onBlur` and `onKeydown`
- `disabled`, `readonly` and `required`
- `aria-invalid` (while an error is shown) and `data-error`
- `size` and `variant`

Attributes such as `id`, `placeholder` and `class`, and all slots except `default`, are passed through. Your own listeners (`@blur`, `@keydown`, ...) run alongside the component's. The library's own props and slots keep working.

If `as` is a string such as `'input'`, it gets native props (`value`/`onInput`) instead of `modelValue`.

Things to know in `as` mode:

- **Error message:** the component renders no message of its own. Show it through the library, as the Vuetify preset does, or with the renderless slot.
- **Preview and presets:** `preview` and the presets menu belong to the built-in field and are not rendered. Use the [renderless slot](#any-other-component-renderless-slot) for those.
- **Styles:** the built-in stylesheet isn't needed.

### `invalidProps`

`invalidProps` maps the error state onto library-specific props. It receives `{ invalid, error, message, onBlur }` and returns props. Presets are included:

| Preset | Sets |
| --- | --- |
| `vuetify` | `error`, `error-messages`, and commits on `update:focused` |
| `primevue` | `invalid` |
| `nuxtUi` | `color: 'error'` and `highlight` while invalid |

Your own function works the same way:

```ts
import type { InvalidPropsFn } from 'semantic-duration-input'

const myLib: InvalidPropsFn = ({ invalid, message }) => ({ state: invalid ? 'error' : undefined, hint: message })
```

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
import { UInput } from '#components'
</script>

<template>
  <UFormField label="Duration">
    <DurationInput v-model="minutes" :as="UInput" :invalid-props="nuxtUi" icon="i-lucide-clock" />
  </UFormField>
</template>
```

In Nuxt, `UInput` is auto-imported for templates, but `as` needs the component itself, hence the import from `#components`. The [Nuxt module](./nuxt) can set this up app-wide.

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

## Any other component (renderless slot)

For full control, pass a default slot. The component then renders nothing but your slot, and handles only the parsing:

```vue
<DurationInput v-model="minutes" v-slot="{ inputProps, invalid, message, messageId, preview }">
  <MyField :invalid="invalid" :hint="preview" :error="message" :error-id="messageId">
    <MyInput v-bind="inputProps" />
  </MyField>
</DurationInput>
```

The slot props:

| Prop | |
| --- | --- |
| `inputProps` | For components with a `modelValue` contract. Includes attributes, `class` and `style` |
| `nativeInputProps` | For a plain `<input>`: `value`, `onInput`, `onBlur`, `onKeydown`. Includes attributes |
| `hiddenInputProps` | For an `<input type="hidden">` carrying the model value, or `null` without a `name` |
| `text` | The text in the field |
| `value` | The model value |
| `error`, `errorDetail` | The shown error code, and the shown failure with `token`, `index` and `suggestion` |
| `rawError`, `rawErrorDetail` | The current error, shown or not, and its failure details |
| `invalid`, `message`, `messageId` | Whether an error is shown, its text, and the id to give the message element for `aria-describedby` |
| `preview` | The normalized text (or the `formatPreview` output) while it differs from what was typed, else `null` |
| `presets`, `selectPreset(preset)` | The resolved presets (`{ id, label, seconds }`), to render your own suggestions |
| `onBlur`, `onKeydown`, `commit`, `validate`, `revert`, `stepBy` | The handlers and methods |

A plain input with its own presets list:

```vue
<DurationInput v-model="minutes" name="estimate" :presets="['30m', '1h', '2h']" v-slot="s">
  <input v-bind="s.nativeInputProps" :aria-describedby="s.message ? s.messageId : undefined" />
  <input v-if="s.hiddenInputProps" v-bind="s.hiddenInputProps" />
  <button v-for="p in s.presets" :key="p.id" type="button" @click="s.selectPreset(p)">{{ p.label }}</button>
  <p v-if="s.message" :id="s.messageId">{{ s.message }}</p>
</DurationInput>
```

## App-wide defaults

Pass defaults to the plugin, and they apply to every instance. Props set on a component still win, and `ui` defaults are merged with the component's `ui`.

```ts
import { de, plugin as DurationInputPlugin } from 'semantic-duration-input'
import { Input } from '@/components/ui/input'

app.use(DurationInputPlugin, { as: Input, locale: de, validateOn: 'blur' })
```

Every prop can be a default except `min`, `max`, `required`, `disabled` and `readonly`, which belong to the individual field.
