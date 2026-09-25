import type { Component, InjectionKey } from 'vue'
import type { ClassValue } from 'tailwind-variants'
import type { InvalidPropsFn } from './adapters'
import type { FormatStyle } from './core/format'
import type { ErrorMessages } from './core/messages'
import type { Locale, UnitAliases, UnitKey } from './core/units'
import type { DurationInputPart, DurationInputSize, DurationInputVariant } from './theme'

export type DurationInputUi = Partial<Record<DurationInputPart, ClassValue>>

export interface DurationInputProps {
  /** Built-in locales whose unit names are accepted. Defaults to English and German. */
  locales?: Locale[]
  /** Extra unit aliases, e.g. `{ hour: ['óra'] }`. */
  customAliases?: UnitAliases
  /** Language of the normalized text and of the error messages. */
  displayLocale?: Locale
  displayStyle?: FormatStyle
  displayUnits?: UnitKey[]
  min?: number
  max?: number
  required?: boolean
  disabled?: boolean
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
  /** Shows the normalized value (e.g. "1h 30min") inside the field while typing. */
  preview?: boolean
  /** Overrides the error texts per code, or `false` to hide them. */
  messages?: ErrorMessages | false
}

/** App-wide defaults, set via `app.use(plugin, defaults)`. Props on the component win. */
export type DurationInputDefaults = Omit<DurationInputProps, 'min' | 'max' | 'required' | 'disabled'>

export const DURATION_INPUT_DEFAULTS: InjectionKey<DurationInputDefaults> = Symbol('DurationInputDefaults')
