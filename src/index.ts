import type { App, Plugin } from 'vue'
import DurationInput from './components/DurationInput.vue'
import { DURATION_INPUT_DEFAULTS, type DurationInputDefaults } from './config'
import './styles/style.css'

export { DurationInput }
export type { DurationInputSlotProps, DurationPresetItem } from './components/DurationInput.vue'
export * from './core/index'
export { useDurationInput } from './composables/useDurationInput'
export type { DurationInputOptions, ValidateOn } from './composables/useDurationInput'
export { durationInputTheme } from './theme'
export type { DurationInputPart, DurationInputSize, DurationInputVariant, DurationInputVariants } from './theme'
export { nuxtUi, primevue, vuetify } from './adapters'
export type { InvalidPropsFn, InvalidState } from './adapters'
export { DURATION_INPUT_DEFAULTS } from './config'
export type { DurationInputDefaults, DurationInputProps, DurationInputUi, DurationPreset } from './config'

/**
 * Registers `<DurationInput>` globally: `app.use(plugin)`.
 * Pass defaults to apply them to every instance, e.g. `app.use(plugin, { as: UInput, invalidProps: nuxtUi })`.
 */
export const plugin: Plugin<[DurationInputDefaults?]> = {
  install(app: App, defaults: DurationInputDefaults = {}) {
    app.component('DurationInput', DurationInput)
    app.provide(DURATION_INPUT_DEFAULTS, defaults)
  },
}

export default DurationInput
