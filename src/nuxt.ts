import { addComponent, addImports, addPluginTemplate, defineNuxtModule } from '@nuxt/kit'
import type { DurationInputDefaults } from './config'

const PACKAGE = 'semantic-duration-input'
const PRESETS = ['nuxtUi', 'vuetify', 'primevue'] as const

export interface ModuleOptions extends Omit<DurationInputDefaults, 'as' | 'invalidProps' | 'valueFormat'> {
  /** Name of a component to render instead of the built-in field, resolved from `#components`, e.g. `'UInput'`. */
  as?: string
  /** One of the bundled `invalidProps` presets. */
  invalidProps?: (typeof PRESETS)[number]
  valueFormat?: 'minutes' | 'seconds' | 'ms' | 'iso'
  /** Adds the prebuilt stylesheet. Defaults to `true`, or `false` when `as` is set. */
  css?: boolean
}

/** Source of the runtime plugin that provides the app-wide defaults. */
export function generatePluginCode(options: ModuleOptions): string {
  const { as, invalidProps, css: _css, ...defaults } = options
  if (as !== undefined && !/^[A-Za-z_$][\w$]*$/.test(as)) throw new Error(`[${PACKAGE}] \`as\` must be a component name, got "${as}"`)
  if (invalidProps !== undefined && !PRESETS.includes(invalidProps)) {
    throw new Error(`[${PACKAGE}] \`invalidProps\` must be one of ${PRESETS.join(', ')}, got "${invalidProps}"`)
  }
  const imports = [
    `import { defineNuxtPlugin } from '#app'`,
    `import { DURATION_INPUT_DEFAULTS${invalidProps ? `, ${invalidProps}` : ''} } from '${PACKAGE}'`,
  ]
  if (as) imports.push(`import { ${as} } from '#components'`)
  const extra = [as && `as: ${as}`, invalidProps && `invalidProps: ${invalidProps}`].filter(Boolean)
  const value = extra.length ? `{ ...${JSON.stringify(defaults)}, ${extra.join(', ')} }` : JSON.stringify(defaults)
  return `${imports.join('\n')}

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.provide(DURATION_INPUT_DEFAULTS, ${value})
})
`
}

/**
 * Nuxt module: auto-imports `<DurationInput>` and the composables, and applies app-wide defaults
 * from the `durationInput` key in `nuxt.config`.
 */
export default defineNuxtModule<ModuleOptions>({
  meta: { name: PACKAGE, configKey: 'durationInput' },
  setup(options, nuxt) {
    addComponent({ name: 'DurationInput', export: 'DurationInput', filePath: PACKAGE })
    addImports(['useDurationInput', 'parseDuration', 'formatDuration'].map((name) => ({ name, from: PACKAGE })))
    addPluginTemplate({ filename: 'semantic-duration-input.mjs', getContents: () => generatePluginCode(options) })
    if (options.css ?? !options.as) nuxt.options.css.push(`${PACKAGE}/style.css`)
  },
})
