import { computed, ref, toValue, warn, watch, type MaybeRefOrGetter, type Ref } from 'vue'
import { DEFAULT_DISPLAY_UNITS, formatDuration, type FormatStyle } from '../core/format'
import type { DurationLocale } from '../core/locale'
import { en } from '../core/locales/en'
import { DEFAULT_LOCALES, parseDuration, type ParseErrorCode, type ParseFailure, type ParseOptions } from '../core/parse'
import { UNIT_SECONDS, type UnitKey } from '../core/units'
import { fromModelValue, resolveAmount, toModelValue, type DurationAmount, type ValueFormat } from '../core/value'

/**
 * When errors become visible. The model is updated live in every mode.
 * - `'eager'`: on blur/Enter, then live while an error is shown (so fixing it clears it right away).
 * - `'blur'`: only on blur/Enter.
 * - `'input'`: on every keystroke.
 */
export type ValidateOn = 'eager' | 'blur' | 'input'

/** What `formatPreview` gets besides the seconds. */
export interface PreviewContext {
  /** The default preview: the normalized text, e.g. "1h 30min". */
  normalized: string
  /** The typed text. */
  text: string
  /** The value as `v-model` stores it (see `valueFormat`). */
  value: unknown
  /** The display locale. */
  locale: DurationLocale
}

/** Renders the preview of a valid, non-empty text. Return `null` or `''` to hide it. */
export type PreviewFormatter = (seconds: number, context: PreviewContext) => string | null

/** Options of `useDurationInput`: the component's parsing, display and validation props. */
export interface DurationInputOptions extends Omit<ParseOptions, 'min' | 'max'> {
  /** How the model stores durations. Defaults to `'minutes'`. */
  valueFormat?: ValueFormat
  /** Language of the normalized text and the messages. Defaults to the first of `locales`. */
  locale?: DurationLocale
  /** `'short'` ("1h 30min") or `'long'` ("1 hour 30 minutes"). Defaults to `'short'`. */
  displayStyle?: FormatStyle
  /** Units of the normalized text. Defaults to days, hours and minutes (plus seconds with second precision). */
  displayUnits?: UnitKey[]
  /** Inclusive lower bound: a number in the model's unit, or a duration text like `'30m'`. */
  min?: DurationAmount
  /** Inclusive upper bound, like `min`. */
  max?: DurationAmount
  /** Arrow-key step, like `min`/`max`. Defaults to `'15m'`; `false` turns keyboard stepping off. */
  step?: DurationAmount | false
  /** Round to the nearest `step` on blur/Enter. */
  snapToStep?: boolean
  /** Clamp out-of-range values to `min`/`max` instead of reporting `out_of_range`. */
  clamp?: boolean
  /** When errors become visible. Defaults to `'eager'`. */
  validateOn?: ValidateOn
  /** Ignore the stepping keys and Escape, like a native read-only input. */
  readonly?: boolean
  /** Renders `preview` instead of the normalized text. It still only appears while the text isn't normalized. */
  formatPreview?: PreviewFormatter
}

/**
 * Headless logic behind `<DurationInput>`: keeps the raw text and the model in sync.
 * Valid input updates `model` while typing; blur/Enter rewrites the text into its normalized form.
 *
 * @example
 * const seconds = ref<number | null>(null)
 * const { text, error, onInput, onBlur, onKeydown } = useDurationInput(seconds, { valueFormat: 'seconds' })
 * // <input :value="text" @input="onInput" @blur="onBlur" @keydown="onKeydown" :aria-invalid="!!error">
 */
export function useDurationInput(model: Ref<unknown>, options: MaybeRefOrGetter<DurationInputOptions> = {}) {
  const settings = computed(() => {
    const o = toValue(options)
    const valueFormat = o.valueFormat ?? 'minutes'
    const locales = o.locales ?? DEFAULT_LOCALES
    const amount = (value: DurationAmount | undefined) => resolveAmount(value, valueFormat, { locales })
    return {
      ...o,
      valueFormat,
      locales,
      locale: o.locale ?? locales[0] ?? en,
      displayUnits: o.displayUnits ?? (o.precision === 'second' ? [...DEFAULT_DISPLAY_UNITS, 'second'] : DEFAULT_DISPLAY_UNITS),
      min: amount(o.min),
      max: amount(o.max),
      step: o.step === false ? undefined : amount(o.step ?? '15m'),
    }
  })

  // A development-only hint: with `min` above `max`, every value is out of range (or clamps to `min`).
  // Watches a string, not the settings object, so it only fires when the bounds actually change.
  watch(
    () => {
      const { min, max } = settings.value
      return min !== undefined && max !== undefined && min > max ? `\`min\` (${min}s) is greater than \`max\` (${max}s)` : ''
    },
    (problem) => problem && warn(`[semantic-duration-input] ${problem}, so no value is valid.`),
    { immediate: true },
  )

  const format = (seconds: number | null) => {
    if (seconds === null) return ''
    const { locale, displayStyle, displayUnits } = settings.value
    return formatDuration(seconds, { locale, style: displayStyle, units: displayUnits })
  }

  const modelSeconds = () => fromModelValue(model.value, settings.value.valueFormat)

  const text = ref(format(modelSeconds()))
  /** Current parse failure, whether shown or not. */
  const failure = ref<ParseFailure | null>(null)
  /** The failure that is shown, according to `validateOn`. */
  const shown = ref<ParseFailure | null>(null)
  // What Escape goes back to: the state after the last commit or external change.
  let committed = { text: text.value, value: model.value }
  // Value we last wrote to `model`, so the watcher can tell our own updates from external ones.
  let lastEmitted: unknown

  function parse(withRange = true) {
    const s = settings.value
    return parseDuration(text.value, {
      locales: s.locales,
      precision: s.precision,
      implicitUnits: s.implicitUnits,
      defaultUnit: s.defaultUnit,
      required: s.required,
      min: s.clamp || !withRange ? undefined : s.min,
      max: s.clamp || !withRange ? undefined : s.max,
    })
  }

  function clampSeconds(seconds: number) {
    const { min, max } = settings.value
    return Math.max(0, min ?? 0, Math.min(seconds, max ?? Infinity))
  }

  function write(seconds: number | null) {
    const value = toModelValue(seconds, settings.value.valueFormat)
    if (value === model.value) return
    lastEmitted = value
    model.value = value
  }

  function setFailure(result: ReturnType<typeof parse>, show: boolean) {
    failure.value = result.ok ? null : result
    const mode = settings.value.validateOn ?? 'eager'
    if (show || mode === 'input' || (mode === 'eager' && shown.value !== null)) shown.value = failure.value
  }

  /** Accepts an input event or the new text directly (`null`, e.g. from a clear button, means empty). */
  function onInput(event: Event | string | null) {
    if (event === null) text.value = ''
    else text.value = typeof event === 'string' ? event : (event.target as HTMLInputElement).value
    const result = parse()
    setFailure(result, false)
    // An empty field clears the model even when `required` reports it as an error.
    if (!result.ok) return void (result.error === 'empty' && write(null))
    write(result.seconds === null || !settings.value.clamp ? result.seconds : clampSeconds(result.seconds))
  }

  /** Parses, shows any error and, if valid, writes the (clamped/snapped) value and normalizes the text. */
  function commit(): boolean {
    const result = parse()
    setFailure(result, true)
    if (!result.ok) return false
    let seconds = result.seconds
    const { clamp, snapToStep, step } = settings.value
    if (seconds !== null && snapToStep && step) seconds = Math.round(seconds / step) * step
    if (seconds !== null && (clamp || snapToStep)) seconds = clampSeconds(seconds)
    write(seconds)
    text.value = format(seconds)
    committed = { text: text.value, value: model.value }
    return true
  }

  /** Shows the current error (e.g. on form submit) and returns whether the input is valid. */
  function validate(): boolean {
    const result = parse()
    setFailure(result, true)
    return result.ok
  }

  /** Goes back to the last committed state. Returns whether anything changed. */
  function revert(): boolean {
    if (text.value === committed.text && model.value === committed.value) return false
    text.value = committed.text
    failure.value = shown.value = null
    if (model.value !== committed.value) {
      lastEmitted = committed.value
      model.value = committed.value
    }
    return true
  }

  /**
   * Moves by `direction` steps of `size` seconds (default: `step`), snapping to multiples of `size`:
   * with a 15min step, `1h07` goes up to `1h15` and down to `1h`.
   */
  function stepBy(direction: number, size = settings.value.step) {
    if (!size || direction === 0) return
    // Start from the text if it parses (even out of range), else from the last valid value.
    const parsed = parse(false)
    const base = parsed.ok ? parsed.seconds : modelSeconds()
    let next: number
    if (base === null) next = direction > 0 ? size : 0
    else if (direction > 0) next = (Math.floor(base / size) + direction) * size
    else next = (Math.ceil(base / size) + direction) * size
    next = clampSeconds(next)
    write(next)
    text.value = format(next)
    failure.value = shown.value = null
  }

  function onKeydown(event: KeyboardEvent) {
    if (event.isComposing || event.altKey || event.ctrlKey || event.metaKey) return
    if (settings.value.readonly) return
    const direction = { ArrowUp: 1, ArrowDown: -1, PageUp: 1, PageDown: -1 }[event.key]
    if (direction !== undefined) {
      const { step } = settings.value
      if (!step) return
      const size = event.key.startsWith('Page') ? UNIT_SECONDS.day : event.shiftKey ? UNIT_SECONDS.hour : step
      event.preventDefault()
      stepBy(direction, size)
    } else if (event.key === 'Enter') {
      commit()
    } else if (event.key === 'Escape' && revert()) {
      event.preventDefault()
      event.stopPropagation()
    }
  }

  /**
   * Normalized form of the current text (or `formatPreview`'s output), while the text differs from
   * the normalized form; otherwise `null`.
   */
  const preview = computed(() => {
    if (failure.value !== null || text.value.trim() === '') return null
    const result = parse()
    if (!result.ok || result.seconds === null) return null
    const normalized = format(result.seconds)
    if (normalized === text.value.trim()) return null
    const { formatPreview, valueFormat, locale } = settings.value
    if (!formatPreview) return normalized
    const value = toModelValue(result.seconds, valueFormat)
    // An empty text hides the preview too, so `preview` is never `''`: there's nothing to show or announce.
    return formatPreview(result.seconds, { normalized, text: text.value, value, locale }) || null
  })

  watch(model, (value) => {
    if (value === lastEmitted) {
      lastEmitted = undefined
      return
    }
    // Also forget our last write here: the parent may have rejected or changed it, and a later
    // outside change back to that value must still update the text.
    lastEmitted = undefined
    text.value = format(modelSeconds())
    failure.value = shown.value = null
    committed = { text: text.value, value }
  })

  // Re-render the text when display settings change (e.g. switching locale), unless the user has an error to fix
  // or is still editing. Inline objects (`:value-format="{ ... }"`) change identity on every parent render,
  // and reformatting then would rewrite the text mid-typing.
  watch(
    () => {
      const { locale, displayStyle, displayUnits, valueFormat } = settings.value
      return [locale, displayStyle, displayUnits.join(), valueFormat]
    },
    () => {
      if (failure.value !== null || text.value !== committed.text) return
      text.value = format(modelSeconds())
      committed = { text: text.value, value: model.value }
    },
  )

  const error = computed<ParseErrorCode | null>(() => shown.value?.error ?? null)
  const rawError = computed<ParseErrorCode | null>(() => failure.value?.error ?? null)

  return {
    /** The text in the field. */
    text,
    /** Current value in seconds. */
    seconds: computed(modelSeconds),
    /** The shown error code (see `validateOn`). */
    error,
    /** The shown failure, with `token`, `index` and `suggestion`. */
    errorDetail: computed(() => shown.value),
    /** The current error, shown or not. */
    rawError,
    /** The current failure, shown or not, with `token`, `index` and `suggestion`. */
    rawErrorDetail: computed(() => failure.value),
    /** Whether the text is valid right now, shown or not. */
    isValid: computed(() => rawError.value === null),
    /** Normalized form of the text (or `formatPreview`'s output) while it differs from what was typed, else `null`. */
    preview,
    /** Resolved options: bounds and step in seconds, locale, display units. */
    settings,
    /** Formats seconds with the current locale and display options. */
    format,
    /** Bind to the input's `input` event, or call with the new text. */
    onInput,
    /** Bind to the input's `blur` event: normalizes the text, like `commit`. */
    onBlur: commit,
    /** Bind to the input's `keydown` event: arrow/page stepping, Enter to commit, Escape to revert. */
    onKeydown,
    /** Normalizes the text, shows any error and writes the value. Returns whether it was valid. */
    commit,
    /** Shows the current error and returns whether the text is valid. */
    validate,
    /** Goes back to the last committed state. Returns whether anything changed. */
    revert,
    /** Moves by `direction` steps of `size` seconds (default: `step`). */
    stepBy,
  }
}
