# Custom units

`customUnits` adds units of your own and changes the length of `day` and `week`. Each entry is a length in seconds, or a definition with aliases and labels:

```vue
<script setup lang="ts">
import type { CustomUnits } from 'semantic-duration-input'

const units: CustomUnits = {
  pomodoro: 25 * 60,
  sprint: { seconds: 14 * 86400, aliases: ['sprints'], labels: { short: 'sp', long: ['sprint', 'sprints'] } },
}
</script>

<template>
  <DurationInput v-model="minutes" :custom-units="units" :display-units="['sprint', 'day', 'hour', 'minute']" />
</template>
```

<Demo :custom-units="agile" :display-units="['sprint', 'day', 'hour', 'minute']" placeholder="Type 2 sprints 3d" preview />

| You type | `v-model` | After blur |
| --- | --- | --- |
| `2 sprints 3d` | `44640` | `2sp 3d` |
| `3 pomodoro` | `75` | `1h 15min` |
| `1 sprint 2` | `40320` | `2sp` (`2` takes weeks, see [below](#implicit-units)) |

## Working time

Override `day` and `week` to count working time, as in Jira, where a day is 8 hours and a week is 5 days:

```vue
<DurationInput v-model="minutes" :custom-units="{ day: 8 * 3600, week: 5 * 8 * 3600 }" />
```

<Demo :custom-units="{ day: 8 * 3600, week: 5 * 8 * 3600 }" :display-units="['week', 'day', 'hour', 'minute']" placeholder="Type 1w 2d" preview />

`1w 2d` is now 56 hours, and 10 hours are shown as `1d 2h`. <kbd>PgUp</kbd>/<kbd>PgDn</kbd> step by the configured day. Overriding `day` doesn't change `week`, so set both.

Only `day` and `week` can be overridden. `second`, `minute` and `hour` keep their lengths, so precision, rounding and clock input stay predictable. The day must stay longer than an hour and shorter than the week.

Some input always uses the standard lengths, because it has a fixed meaning outside your app:

- ISO 8601: `P1D` is 24 hours even when `1d` is 8. `valueFormat: 'iso'` writes standard lengths too.
- Clock format: `26:00` is 26 hours.

## Definitions

| Field | |
| --- | --- |
| `seconds` | Length in seconds: a whole number greater than 0 |
| `aliases` | Extra names the parser accepts in every locale, matched case-insensitively |
| `labels` | `{ short?, long?: [one, other] }` for the normalized text. Not allowed on `day` and `week`, whose labels come from the locale |

- A custom unit's name is accepted too, and is its label when it has none: `{ pomodoro: 1500 }` accepts `2 pomodoro` and shows `2 pomodoro`. Without a short label, the short style writes the long form.
- Names, aliases and labels must be letters only, since unit words in the input are. A label may end with a period (`Std.`).
- Labels are accepted by the parser as well, so the normalized text can always be read back.
- Names from `customUnits` win over the unit names of the locales: an alias `s` takes over seconds. Two custom units can't share a name.
- Units shorter than the precision are ignored: a 30-second unit is an `unknown_unit` unless `precision="second"`.
- Invalid definitions throw an `Error`, when the component mounts or, with the [Nuxt module](./nuxt), at build time.

A name in `displayUnits` or `defaultUnit` that is neither built in nor in `customUnits` throws as well, so typos don't go unnoticed.

## Showing custom units

Custom units appear in the normalized text, the preview, the presets and the error messages when they're in `displayUnits`. Units are always shown longest first, whatever their order in `displayUnits`.

The smallest display unit takes the rest as a decimal with up to two places, like `1.5h` with `displayUnits: ['hour']`. With long units such as sprints, that can round off a few minutes; add a smaller unit to keep them.

## Implicit units

A trailing number takes the longest *built-in* unit that is shorter than the last unit, so custom units never change what `1h30` means:

| Input | Means |
| --- | --- |
| `1 workday 3` (workday = 8h) | 1 workday 3 hours |
| `1 pomodoro 5` | 1 pomodoro 5 minutes |
| `1 sprint 2` (sprint = 14 days) | 1 sprint 2 weeks |
| `1w 2` (week = 5 × 8h, day = 8h) | 1 week 2 days of 8 hours |

## Translations

Unit names in `customUnits` work in every locale. To translate a unit, give it aliases and labels in a locale, under the same name:

```ts
import { de, defineLocale } from 'semantic-duration-input'

const deAgile = defineLocale({
  ...de,
  aliases: { ...de.aliases, sprint: ['Sprints'] },
  labels: {
    short: { ...de.labels!.short, sprint: 'Sp' },
    long: { ...de.labels!.long, sprint: ['Sprint', 'Sprints'] },
  },
})
```

The display locale's labels win over the labels in `customUnits`. The parser accepts the labels that the active locales give custom units, so the translated text parses back too.

Locales without `labels` format built-in units with `Intl` and custom units with their labels from `customUnits`.

## App-wide units

Pass `customUnits` to the plugin (or the Nuxt module) to use them everywhere. A `customUnits` prop replaces the app-wide units rather than merging with them.

```ts
app.use(plugin, { customUnits: { day: 8 * 3600, week: 5 * 8 * 3600 } })
```

The core functions take the same option: `parseDuration`, `formatDuration`, `formatErrorMessage`, `resolveAmount` and `durationSchema`. See the [Core API](../reference/core).

<script setup>
const agile = {
  pomodoro: 25 * 60,
  sprint: { seconds: 14 * 86400, aliases: ['sprints'], labels: { short: 'sp', long: ['sprint', 'sprints'] } },
}
</script>
