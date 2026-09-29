---
description: Built-in languages (English, German, Spanish, French, Portuguese, Hindi, Arabic, Chinese), the display style and units, and custom locales with defineLocale.
---

# Locales

Eight languages are built in. English and German are accepted by default; the others are accepted once you pass them in `locales`. Two props control languages:

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
import { de, en, fr } from '../../src'
</script>

## Built-in locales

| Export | Language | Input | Normalized (short / long) |
| --- | --- | --- | --- |
| `en` | English | `2 hours and 15 min` | `2h 15min` / `2 hours 15 minutes` |
| `de` | German | `2 Std. und 15 Min.` | `2h 15min` / `2 Stunden 15 Minuten` |
| `es` | Spanish | `2 horas y 15 minutos` | `2h 15min` / `2 horas 15 minutos` |
| `fr` | French | `1 j et 2 heures` | `1j 2h` / `1 jour 2 heures` |
| `pt` | Portuguese | `2 horas e 15 minutos` | `2h 15min` / `2 horas 15 minutos` |
| `hi` | Hindi | `2 घंटे और 15 मिनट` | `2घं 15मि` / `2 घंटे 15 मिनट` |
| `ar` | Arabic | `2 ساعة و 15 دقيقة`, `٢ ساعة و ١٥ دقيقة` | `2س 15د` / `2 ساعتان 15 دقيقة` |
| `zh` | Chinese (Mandarin) | `2小时15分钟`, `2個小時15分鐘` | `2小时 15分钟` / `2 小时 15 分钟` |

The unit names of each locale are listed in [Syntax](./syntax#units). Each built-in locale also accepts `h`, `m`, `min`, `s`, `d` and `w`, and every locale accepts native digits (`٣٠`, `३०`, `３０`).

- Portuguese messages use Brazilian wording. Chinese labels and messages are Simplified, and Traditional unit names are accepted too.
- Bundlers leave out the locales you don't import.
- Accepting a locale doesn't change the language of the text: set `locale`, or put that locale first in `locales`.

```vue
<DurationInput v-model="minutes" :locales="[fr, en]" display-style="long" />
```

<Demo :initial="1590" :locales="[fr, en]" display-style="long" />

### Right-to-left

For Arabic, set `dir="rtl"` on the page or on an element around the field. `dir` on `<DurationInput>` itself only reaches the `<input>`, not the leading and trailing content or the preview.

```vue
<div dir="rtl">
  <DurationInput v-model="minutes" :locales="[ar, en]" />
</div>
```

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

- **Aliases** are matched case-insensitively and in Unicode normal form (NFC), so composed and decomposed letters like `फ़` match. Combining marks (Devanagari vowel signs, Arabic diacritics) are part of a name. If two active locales use the same alias for different units, the later locale in `locales` wins.
- **Separators** are extra words that may join parts, like `and`. The symbols `,` `+` `&` always work.
- **Labels:** without `labels`, the text is formatted with `Intl.DurationFormat` using `code`, falling back to English labels where that API isn't available. Make sure the parser can read what the formatter writes: add the words it produces to `aliases` and `separators`.
- **Plural forms:** a long label is `[one, other]`, picked by the plural rules of `code` (`Intl.PluralRules`): French writes `0 minute` and `2 minutes`. For languages with more forms, pass a `PluralLabels` object instead. Missing categories use `other`:

  ```ts
  long: {
    ...en.labels!.long,
    day: { one: 'diwrnod', two: 'ddiwrnod', other: 'diwrnod' }, // Welsh
  }
  ```

- **Messages** may use `{min}`, `{max}`, `{token}` and `{suggestion}`. See [Error messages](./forms#error-messages) for the keys.

Locales can also name and label [custom units](./units#translations).

To add aliases to a built-in language, spread it:

```ts
const myEn = defineLocale({ ...en, aliases: { ...en.aliases, hour: [...en.aliases.hour!, 'hs'] } })
```
