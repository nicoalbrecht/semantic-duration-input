import type { Component, InjectionKey } from 'vue'
import type { ClassValue } from 'tailwind-variants'
import type { InvalidPropsFn } from './adapters'
import type { ValidateOn } from './composables/useDurationInput'
import type { FormatStyle } from './core/format'
import type { DurationLocale } from './core/locale'
import type { ErrorMessages } from './core/messages'
import type { Precision, UnitKey } from './core/units'
import type { DurationAmount, ValueFormat } from './core/value'
import type { DurationInputPart, DurationInputSize, DurationInputVariant } from './theme'

export type DurationInputUi = Partial<Record<DurationInputPart, ClassValue>>

/** A suggestion: duration text (`'30m'`), a number in the model's unit, or either with a custom label. */
export type DurationPreset = DurationAmount | { label?: string; value: DurationAmount }

export interface DurationInputProps {
  /** Locales whose unit names are accepted. Defaults to `[en, de]`. */
  locales?: DurationLocale[]
  /** Language of the normalized text and of the error messages. Defaults to the first of `locales`. */
  locale?: DurationLocale
  displayStyle?: FormatStyle
  displayUnits?: UnitKey[]
  /** How `v-model` stores durations: `'minutes'` (default), `'seconds'`, `'ms'`, `'iso'` or a custom conversion. */
  valueFormat?: ValueFormat
  /** `'second'` accepts and keeps seconds. Defaults to `'minute'`. */
  precision?: Precision
  /** `1h30` means 1h 30min. Defaults to `true`. */
  implicitUnits?: boolean
  /** Unit for a bare number, e.g. `'minute'` makes `45` mean 45 minutes. */
  defaultUnit?: UnitKey
  /** Inclusive bounds: a number in the model's unit, or a duration text like `'8h'`. */
  min?: DurationAmount
  max?: DurationAmount
  /** Arrow-key step. Defaults to `'15m'`; `false` turns keyboard stepping off. */
  step?: DurationAmount | false
  /** Round to the nearest `step` on blur/Enter. */
  snapToStep?: boolean
  /** Clamp out-of-range values instead of reporting `out_of_range`. */
  clamp?: boolean
  /** When errors become visible. Defaults to `'eager'`. */
  validateOn?: ValidateOn
  required?: boolean
  disabled?: boolean
  /** Suggestions shown in a menu below the field. */
  presets?: DurationPreset[]
  /** Render this component (e.g. a design system's input) instead of the built-in field. */
  as?: Component | string
  /** Maps the invalid state onto props of the `as` component. See the presets in `adapters`. */
  invalidProps?: InvalidPropsFn
  /** Extra classes per part, merged with the defaults via tailwind-merge. */
  ui?: DurationInputUi
  /** Drops all default classes; only `ui` and `class` are applied. */
  unstyled?: boolean
  /** Built-in field size. With `as`, it is passed on to that component (so library values work too). */
  size?: DurationInputSize | (string & {})
  /** Built-in field variant. With `as`, it is passed on to that component (e.g. Vuetify's `'outlined'`). */
  variant?: DurationInputVariant | (string & {})
  /** Shows the normalized value (e.g. "1h 30min") inside the field while typing, and announces it to screen readers. */
  preview?: boolean
  /** Overrides the error texts per key, or `false` to hide them. */
  messages?: ErrorMessages | false
}

/** App-wide defaults, set via `app.use(plugin, defaults)`. Props on the component win. */
export type DurationInputDefaults = Omit<DurationInputProps, 'min' | 'max' | 'required' | 'disabled'>

export const DURATION_INPUT_DEFAULTS: InjectionKey<DurationInputDefaults> = Symbol('DurationInputDefaults')
