import { describe, expect, it } from 'vitest'
import { generatePluginCode } from '../src/nuxt'

describe('Nuxt module plugin template', () => {
  it('provides serializable defaults', () => {
    const code = generatePluginCode({ size: 'sm', preview: true })
    expect(code).toContain(`import { DURATION_INPUT_DEFAULTS } from 'semantic-duration-input'`)
    expect(code).toContain(`nuxtApp.vueApp.provide(DURATION_INPUT_DEFAULTS, {"size":"sm","preview":true})`)
    expect(code).not.toContain('#components')
  })

  it('resolves as from #components and imports the preset', () => {
    const code = generatePluginCode({ as: 'UInput', invalidProps: 'nuxtUi', css: false, validateOn: 'blur' })
    expect(code).toContain(`import { DURATION_INPUT_DEFAULTS, nuxtUi } from 'semantic-duration-input'`)
    expect(code).toContain(`import { UInput } from '#components'`)
    expect(code).toContain(`{ ...{"validateOn":"blur"}, as: UInput, invalidProps: nuxtUi }`)
  })

  it('serializes customUnits and rejects invalid ones at build time', () => {
    const customUnits = { day: 28800, sprint: { seconds: 288000, aliases: ['sprints'] } }
    expect(generatePluginCode({ customUnits })).toContain(JSON.stringify({ customUnits }))
    expect(() => generatePluginCode({ customUnits: { hour: 1800 } })).toThrow(/^\[semantic-duration-input\] customUnits: /)
    expect(() => generatePluginCode({ customUnits: { tick: Infinity } })).toThrow()
  })

  it('rejects unsafe names', () => {
    expect(() => generatePluginCode({ as: "x'; alert(1)" })).toThrow()
    expect(() => generatePluginCode({ invalidProps: 'other' as never })).toThrow()
  })
})
