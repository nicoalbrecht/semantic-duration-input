# Locales

English and German are built in, and both are accepted by default. Two props control languages:

- `locales`: which unit names and separator words the parser accepts. Default `[en, de]`.
- `locale`: the language of the normalized text and the error messages. Defaults to the first of `locales`.

```vue
<script setup lang="ts">
import { de, en } from 'semantic-duration-input'
</script>

<template>
  <DurationInput v-model="minutes" :locales="[de, en]" display-style="long" />
</template>
```

<Demo :initial="135" :locales="[de, en]" display-style="long" />

<script setup>
import { de, en } from '../../src'
</script>

## Display

| Prop | Effect |
| --- | --- |
| `displayStyle` | `'short'`: `1d 2h 30min`, `'long'`: `1 day 2 hours 30 minutes` |
| `displayUnits` | Units the normalized text is built from. Default: days, hours and minutes (plus seconds with `precision="second"`). Add `'week'` to get `1w 2d`, or pass only `['hour']` to get `1.5h`. |

## Custom locales

A locale is a plain object with unit aliases, separator words, labels for the normalized text and error messages:

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

- **Aliases** are matched case-insensitively. If two active locales use the same alias for different units, the later locale in `locales` wins.
- **Separators** are extra words that may join parts, like `and`. The symbols `,` `+` `&` always work.
- **Labels:** without `labels`, the text is formatted with `Intl.DurationFormat` using `code`, falling back to English labels where that API isn't available. Make sure the parser can read what the formatter writes: add the words it produces to `aliases` and `separators`.
- **Messages** may use `{min}`, `{max}`, `{token}` and `{suggestion}`. See [Error messages](./forms#error-messages) for the keys.

Locales can also name and label [custom units](./units#translations).

To add aliases to a built-in language, spread it:

```ts
const myEn = defineLocale({ ...en, aliases: { ...en.aliases, hour: [...en.aliases.hour!, 'hs'] } })
```
