# Forms and validation

## Native forms

With a `name`, a hidden input carries the model value (`90`, or `PT1H30M` with `'iso'`), so the form submits what `v-model` holds, not the typed text. This also works with `as`. The renderless slot gets `hiddenInputProps` to bind it yourself.

```vue
<form method="post">
  <DurationInput name="estimate" required />
</form>
```

<Demo name="estimate" required placeholder="Type 2h, then press Enter" />

## Required, min and max

- `required` makes empty input an `empty` error. `v-model` still becomes `null` when the field is cleared, so the model always matches the field.
- `min` and `max` are inclusive. They take a number in the model's unit or text like `'8h'`. Values outside them are `out_of_range` errors, or with `clamp`, get clamped.

<Demo required min="30m" max="8h" placeholder="30m to 8h" />

## Show errors on submit

Call `validate()` through a template ref. It shows the current error, whatever `validateOn` is set to, and returns whether the input is valid:

```vue
<script setup lang="ts">
import { ref } from 'vue'
import type { DurationInput } from 'semantic-duration-input'

const estimate = ref<InstanceType<typeof DurationInput>>()

function onSubmit(event: Event) {
  if (!estimate.value?.validate()) event.preventDefault()
}
</script>

<template>
  <form @submit="onSubmit">
    <DurationInput ref="estimate" v-model="minutes" required />
  </form>
</template>
```

## Error messages

Override texts per key with `messages`, or pass `false` to hide the built-in message (the `error` event and `aria-invalid` still work):

```vue
<DurationInput :messages="{ empty: 'How long will it take?', out_of_range: 'Between {min} and {max}, please.' }" />
```

| Key | Used for |
| --- | --- |
| `empty` | `empty` |
| `invalid_format` | `invalid_format` |
| `unknown_unit` | `unknown_unit` without a suggestion |
| `unknown_unit_suggestion` | `unknown_unit` with a suggestion |
| `missing_unit` | `missing_unit` |
| `out_of_range` | `out_of_range` with both bounds |
| `out_of_range_min` | `out_of_range` with only `min` |
| `out_of_range_max` | `out_of_range` with only `max` |

- Overriding a base key also covers its variants: `unknown_unit` covers `unknown_unit_suggestion`, and `out_of_range` covers `out_of_range_min` and `out_of_range_max`.
- Placeholders: `{min}`, `{max}`, `{token}` and `{suggestion}`. Each is filled in once per message.

## Schema validation

`durationSchema()` is a [Standard Schema](https://standardschema.dev), so it works directly with Valibot, ArkType, TanStack Form, VeeValidate and others.

- **Text** is parsed into the model value.
- **Values that already have the output type** (e.g. numbers) are only range-checked. Values it can't convert fail with `invalid_format`.

```ts
import { durationSchema } from 'semantic-duration-input/core'

const estimate = durationSchema({ required: true, max: '8h', valueFormat: 'minutes' })
estimate['~standard'].validate('1h30') // { value: 90 }
estimate['~standard'].validate('9h')   // { issues: [{ message: 'Must be at most 8h.' }] }
estimate['~standard'].validate(90)     // { value: 90 }
```

Options:

- Everything the component uses for parsing: `valueFormat`, `min`, `max`, `required`, `locales`, `precision`, `implicitUnits` and `defaultUnit`.
- `locale` and `messages` for the issue texts.

Without `required`, empty input, `null` and `undefined` validate to `{ value: null }`.

### Zod

With Zod, use `parseDuration` in a transform:

```ts
import { z } from 'zod'
import { formatErrorMessage, parseDuration } from 'semantic-duration-input/core'

const minutes = z.string().transform((text, ctx) => {
  const result = parseDuration(text)
  if (result.ok) return result.minutes // null for empty input
  ctx.addIssue({ code: 'custom', message: formatErrorMessage(result) })
  return z.NEVER
})
```
