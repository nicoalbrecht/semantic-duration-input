import type { Component, InjectionKey } from 'vue'
import type { ClassValue } from 'tailwind-variants'
import type { InvalidPropsFn } from './adapters'
import type { PreviewFormatter, ValidateOn } from './composables/useDurationInput'
import type { FormatStyle } from './core/format'
import type { DurationLocale } from './core/locale'
import type { ErrorMessages } from './core/messages'
import type { Precision, UnitKey } from './core/units'
import type { DurationAmount, ValueFormat } from './core/value'
import type { DurationInputPart, DurationInputSize, DurationInputVariant } from './theme'

/** Extra classes per part: `root`, `field`, `input`, `leading`, `trailing`, `preview`, `message`, `menu`, `option`. */
export type DurationInputUi = Partial<Record<DurationInputPart, ClassValue>>

/** A suggestion: duration text (`'30m'`), a number in the model's unit, or either with a custom label. */
export type DurationPreset = DurationAmount | { label?: string; value: DurationAmount }

/** Props of `<DurationInput>`, besides `v-model`. */
export interface DurationInputProps {
  /**
   * Locales whose unit names are accepted.
   * @default [en, de]
   */
  locales?: DurationLocale[]
  /** Language of the normalized text and of the error messages. Defaults to the first of `locales`. */
  locale?: DurationLocale
  /**
   * `'short'`: "1d 2h 30min", `'long'`: "1 day 2 hours 30 minutes".
   * @default 'short'
   */
  displayStyle?: FormatStyle
  /**
   * Units of the normalized text.
   * @default ['day', 'hour', 'minute'], plus 'second' with `precision="second"`
   */
  displayUnits?: UnitKey[]
  /**
   * How `v-model` stores durations: `'minutes'`, `'seconds'`, `'ms'`, `'iso'` or a custom conversion.
   * @default 'minutes'
   */
  valueFormat?: ValueFormat
  /**
   * `'second'` accepts and keeps seconds (`30s`, `1:02:03`).
   * @default 'minute'
   */
  precision?: Precision
  /**
   * `1h30` means 1h 30min.
   * @default true
   */
  implicitUnits?: boolean
  /** Unit for a bare number, e.g. `'minute'` makes `45` mean 45 minutes. */
  defaultUnit?: UnitKey
  /** Inclusive lower bound: a number in the model's unit, or a duration text like `'30m'`. Invalid text is ignored. */
  min?: DurationAmount
  /** Inclusive upper bound: a number in the model's unit, or a duration text like `'8h'`. Invalid text is ignored. */
  max?: DurationAmount
  /**
   * Arrow-key step. `false` turns keyboard stepping off (including Shift and PageUp/PageDown).
   * @default '15m'
   */
  step?: DurationAmount | false
  /**
   * Round to the nearest `step` on blur/Enter, then keep within `min`/`max`.
   * @default false
   */
  snapToStep?: boolean
  /**
   * Clamp out-of-range values (while typing and on commit) instead of reporting `out_of_range`.
   * @default false
   */
  clamp?: boolean
  /**
   * When errors become visible.
   * @default 'eager'
   */
  validateOn?: ValidateOn
  /** Empty input is an `empty` error. The model still becomes `null`. */
  required?: boolean
  /** Disables the input. */
  disabled?: boolean
  /** Makes the input read-only: no typing, stepping, reverting or presets. */
  readonly?: boolean
  /** Suggestions shown in a menu below the built-in field. Not supported with `as`; use the renderless slot. */
  presets?: DurationPreset[]
  /** Render this component (e.g. a design system's input) instead of the built-in field. */
  as?: Component | string
  /** Maps the invalid state onto props of the `as` component. See the presets in `adapters`. */
  invalidProps?: InvalidPropsFn
  /** Extra classes per part, merged with the defaults via tailwind-merge. */
  ui?: DurationInputUi
  /** Drops all default classes; only `ui` and `class` are applied, without tailwind-merge. */
  unstyled?: boolean
  /**
   * Built-in field size. With `as`, it is passed on to that component (so library values work too).
   * @default 'md'
   */
  size?: DurationInputSize | (string & {})
  /**
   * Built-in field variant. With `as`, it is passed on to that component (e.g. Vuetify's `'outlined'`).
   * @default 'outline'
   */
  variant?: DurationInputVariant | (string & {})
  /**
   * Shows the normalized value (e.g. "1h 30min") inside the field while typing, and announces it to screen readers.
   * Built-in field only: with `as`, use the renderless slot's `preview` instead.
   */
  preview?: boolean
  /**
   * Renders the preview instead of the normalized text, e.g. `(seconds) => \`${seconds / 3600} hours\``.
   * Its output is shown as is, without the leading "= ". Return `null` to hide the preview.
   */
  formatPreview?: PreviewFormatter
  /** Overrides the error texts per key (`{min}`, `{max}`, `{token}`, `{suggestion}` are filled in), or `false` to hide them. */
  messages?: ErrorMessages | false
}

/** App-wide defaults, set via `app.use(plugin, defaults)`. Props on the component win. */
export type DurationInputDefaults = Omit<DurationInputProps, 'min' | 'max' | 'required' | 'disabled' | 'readonly'>

/** Injection key of the app-wide defaults. `app.use(plugin, defaults)` provides it for you. */
export const DURATION_INPUT_DEFAULTS: InjectionKey<DurationInputDefaults> = Symbol('DurationInputDefaults')
