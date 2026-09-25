# Core API

```ts
import { parseDuration } from 'semantic-duration-input/core'
```

Everything here is also exported from `semantic-duration-input`. The core entry has no Vue or Tailwind dependency. All durations are in **seconds** unless noted.

## `parseDuration(input, options?)`

Parses duration text. Returns `{ ok: true, seconds, minutes }`, with both `null` for empty input, or a failure.

```ts
parseDuration('1h 30m')  // { ok: true, seconds: 5400, minutes: 90 }
parseDuration('')        // { ok: true, seconds: null, minutes: null }
parseDuration('45')      // { ok: false, error: 'missing_unit', token: '45', index: 0 }
parseDuration('2 huors') // { ok: false, error: 'unknown_unit', token: 'huors', index: 2, suggestion: 'hours' }
parseDuration('9h', { max: 8 * 3600 }) // { ok: false, error: 'out_of_range' }
```

| Option | Default | |
| --- | --- | --- |
| `locales` | `[en, de]` | Locales whose unit names and separators are accepted |
| `precision` | `'minute'` | `'second'` accepts seconds; results are rounded to the precision |
| `implicitUnits` | `true` | `1h30` means 1h 30min |
| `defaultUnit` | – | Unit for a bare number |
| `min`, `max` | – | Inclusive bounds in seconds |
| `required` | `false` | Empty input is an `empty` failure instead of `null` |

A failure (`ParseFailure`) has:

- `error`: see [Errors](../guide/syntax#errors).
- `token` and `index`: the offending part of the input and its position. They are missing for `empty` and `out_of_range`.
- `suggestion`: for `unknown_unit`, when a unit name is close.

## `formatDuration(seconds, options?)`

```ts
formatDuration(5400)                                  // '1h 30min'
formatDuration(680400, { style: 'long', locale: de }) // '7 Tage 21 Stunden'
formatDuration(5400, { units: ['hour'] })             // '1.5h'
```

| Option | Default | |
| --- | --- | --- |
| `locale` | `en` | Labels to use. Locales without `labels` use `Intl.DurationFormat` |
| `style` | `'short'` | `'short'` or `'long'` |
| `units` | `['day', 'hour', 'minute']` | Units to decompose into. The smallest one takes the rest, as a decimal if needed |

## `formatErrorMessage(error, options?)`

Readable text for an error code or a whole `ParseFailure`. Pass the failure to get `{token}` and `{suggestion}` filled in.

```ts
formatErrorMessage(parseDuration('2 huors')) // 'Unknown unit "huors". Did you mean "hours"?'
formatErrorMessage('out_of_range', { min: 1800, max: 28800 }) // 'Must be between 30min and 8h.'
```

| Option | |
| --- | --- |
| `locale` | Language, default `en` |
| `min`, `max` | Bounds in seconds, for `{min}` and `{max}`. Which is set also picks `out_of_range_min` / `out_of_range_max` |
| `units` | Units to format the bounds with |
| `overrides` | Replacement texts per key, see [Error messages](../guide/forms#error-messages) |

## `durationSchema(options?)`

A [Standard Schema](https://standardschema.dev) for form libraries, see [Schema validation](../guide/forms#schema-validation).

## ISO 8601

```ts
toIso(5400)        // 'PT1H30M'
toIso(1209600)     // 'P14D' (no weeks, for the widest support)
fromIso('P1DT2H')  // 93600
fromIso('1h')      // null
```

## Model values

These convert between seconds and a `valueFormat`. They're used by the component and exported for custom inputs:

| Function | |
| --- | --- |
| `toModelValue(seconds, format)` | Seconds → model value. `null` stays `null` |
| `fromModelValue(value, format)` | Model value → seconds, or `null` when empty or not a duration |
| `resolveAmount(amount, format, { locales })` | A bound or step (number in the model's unit, or text like `'8h'`) → seconds, or `undefined` if invalid |

## Locales

| Export | |
| --- | --- |
| `en`, `de` | The built-in locales |
| `DEFAULT_LOCALES` | `[en, de]` |
| `defineLocale(locale)` | Typed helper for custom locales, see [Custom locales](../guide/locales#custom-locales) |

## Constants

| Export | |
| --- | --- |
| `UNIT_SECONDS` | Length of each unit in seconds: `{ second: 1, minute: 60, hour: 3600, day: 86400, week: 604800 }` |
| `UNITS_DESC` | `['week', 'day', 'hour', 'minute', 'second']` |
| `DEFAULT_DISPLAY_UNITS` | `['day', 'hour', 'minute']` |

## Types

| Type | |
| --- | --- |
| `ParseResult`, `ParseFailure`, `ParseOptions`, `ParseErrorCode` | `parseDuration` |
| `FormatOptions`, `FormatStyle` | `formatDuration` |
| `ErrorMessageOptions`, `ErrorMessages`, `MessageKey` | `formatErrorMessage` and the `messages` prop |
| `DurationLocale` | A locale |
| `UnitKey`, `Precision` | `'second' \| 'minute' \| 'hour' \| 'day' \| 'week'`, `'minute' \| 'second'` |
| `ValueFormat`, `CustomValueFormat`, `DurationAmount` | `valueFormat`, and a bound or step |
| `DurationSchemaOptions`, `StandardSchemaV1`, `StandardSchemaResult` | `durationSchema` |
