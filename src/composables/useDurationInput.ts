import { computed, ref, toValue, watch, type MaybeRefOrGetter, type Ref } from 'vue'
import { formatDuration, type FormatOptions } from '../core/format'
import { parseDuration, type ParseErrorCode, type ParseOptions } from '../core/parse'

export interface DurationInputOptions extends ParseOptions {
  displayLocale?: FormatOptions['locale']
  displayStyle?: FormatOptions['style']
  displayUnits?: FormatOptions['units']
}

/**
 * Headless logic behind `<DurationInput>`: keeps the raw text and the minute value in sync.
 * Valid input updates `model` while typing; blur rewrites the text into its normalized form.
 */
export function useDurationInput(
  model: Ref<number | null | undefined>,
  options: MaybeRefOrGetter<DurationInputOptions> = {},
) {
  const format = (minutes: number | null | undefined) => {
    if (minutes === null || minutes === undefined) return ''
    const { displayLocale, displayStyle, displayUnits } = toValue(options)
    return formatDuration(minutes, { locale: displayLocale, style: displayStyle, units: displayUnits })
  }

  const text = ref(format(model.value))
  const error = ref<ParseErrorCode | null>(null)
  const isValid = computed(() => error.value === null)

  /** Normalized form of the current text, while it differs from what was typed; otherwise `null`. */
  const preview = computed(() => {
    if (error.value !== null || text.value.trim() === '') return null
    const result = parseDuration(text.value, toValue(options))
    if (!result.ok || result.minutes === null) return null
    const normalized = format(result.minutes)
    return normalized === text.value.trim() ? null : normalized
  })

  // Value we last wrote to `model`, so the watcher can tell our own updates from external ones.
  let lastEmitted: number | null | undefined

  function parse() {
    const result = parseDuration(text.value, toValue(options))
    error.value = result.ok ? null : result.error
    return result
  }

  /** Accepts an input event or the new text directly (`null`, e.g. from a clear button, means empty). */
  function onInput(event: Event | string | null) {
    if (event === null) text.value = ''
    else text.value = typeof event === 'string' ? event : (event.target as HTMLInputElement).value
    const result = parse()
    if (result.ok && result.minutes !== model.value) {
      lastEmitted = result.minutes
      model.value = result.minutes
    }
  }

  function onBlur() {
    const result = parse()
    if (result.ok) text.value = format(result.minutes)
  }

  watch(model, (value) => {
    if (value === lastEmitted) {
      lastEmitted = undefined
      return
    }
    text.value = format(value)
    error.value = null
  })

  // Re-render the text when display settings change (e.g. switching locale), unless the user has an error to fix.
  watch(
    () => {
      const { displayLocale, displayStyle, displayUnits } = toValue(options)
      return [displayLocale, displayStyle, displayUnits?.join()]
    },
    () => {
      if (error.value === null) text.value = format(model.value)
    },
  )

  return { text, error, isValid, preview, onInput, onBlur }
}
