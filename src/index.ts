import type { App, Plugin } from 'vue'
import DurationInput from './components/DurationInput.vue'

export { DurationInput }
export { parseDuration } from './core/parse'
export type { ParseErrorCode, ParseOptions, ParseResult } from './core/parse'
export { formatDuration } from './core/format'
export type { FormatOptions, FormatStyle } from './core/format'
export { LOCALE_ALIASES, UNIT_MINUTES } from './core/units'
export type { Locale, UnitAliases, UnitKey } from './core/units'
export { useDurationInput } from './composables/useDurationInput'
export type { DurationInputOptions } from './composables/useDurationInput'

/** Registers `<DurationInput>` globally: `app.use(plugin)`. */
export const plugin: Plugin = {
  install(app: App) {
    app.component('DurationInput', DurationInput)
  },
}

export default DurationInput
