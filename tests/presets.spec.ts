import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import DurationInput from '../src/components/DurationInput.vue'
import type { DurationInputProps } from '../src'

function mountInput(props: DurationInputProps & { modelValue?: number | null } = {}) {
  const wrapper: ReturnType<typeof mount<typeof DurationInput>> = mount(DurationInput, {
    props: {
      modelValue: null,
      presets: ['15m', '30m', '1h', { label: 'Half a day', value: '12h' }],
      ...props,
      'onUpdate:modelValue': (value: number | string | null): unknown => wrapper.setProps({ modelValue: value }),
    },
  })
  return wrapper
}

const menu = (wrapper: ReturnType<typeof mountInput>) => wrapper.find('[role=listbox]')
const labels = (wrapper: ReturnType<typeof mountInput>) => wrapper.findAll('[role=option]').map((o) => o.text())
const isOpen = (wrapper: ReturnType<typeof mountInput>) => wrapper.find('input').attributes('aria-expanded') === 'true'

describe('presets', () => {
  it('makes the input a combobox and opens on focus while empty', async () => {
    const wrapper = mountInput()
    const input = wrapper.find('input')
    expect(input.attributes()).toMatchObject({ role: 'combobox', 'aria-autocomplete': 'list', 'aria-expanded': 'false' })
    expect(input.attributes('aria-controls')).toBe(menu(wrapper).attributes('id'))
    await input.trigger('focus')
    expect(isOpen(wrapper)).toBe(true)
    expect(labels(wrapper)).toEqual(['15min', '30min', '1h', 'Half a day'])
  })

  it('does not open on focus when the field has a value, but does with Alt+ArrowDown', async () => {
    const wrapper = mountInput({ modelValue: 90 })
    await wrapper.find('input').trigger('focus')
    expect(isOpen(wrapper)).toBe(false)
    await wrapper.find('input').trigger('keydown', { key: 'ArrowDown', altKey: true })
    expect(isOpen(wrapper)).toBe(true)
    expect(labels(wrapper)).toHaveLength(4)
  })

  it('filters while typing and closes when nothing matches', async () => {
    const wrapper = mountInput()
    await wrapper.find('input').setValue('3')
    expect(labels(wrapper)).toEqual(['30min'])
    await wrapper.find('input').setValue('xyz')
    expect(isOpen(wrapper)).toBe(false)
  })

  it('navigates with arrows and selects with Enter', async () => {
    const wrapper = mountInput()
    const input = wrapper.find('input')
    await input.trigger('focus')
    await input.trigger('keydown', { key: 'ArrowDown' })
    await input.trigger('keydown', { key: 'ArrowDown' })
    const options = wrapper.findAll('[role=option]')
    expect(input.attributes('aria-activedescendant')).toBe(options[1].attributes('id'))
    expect(options[1].attributes('aria-selected')).toBe('true')
    await input.trigger('keydown', { key: 'Enter' })
    expect(wrapper.props('modelValue')).toBe(30)
    expect(input.element.value).toBe('30min')
    expect(isOpen(wrapper)).toBe(false)
  })

  it('wraps around with ArrowUp and closes on Escape without reverting', async () => {
    const wrapper = mountInput()
    const input = wrapper.find('input')
    await input.trigger('focus')
    await input.trigger('keydown', { key: 'ArrowUp' })
    expect(wrapper.findAll('[role=option]')[3].attributes('data-active')).toBe('true')
    await input.trigger('keydown', { key: 'Escape' })
    expect(isOpen(wrapper)).toBe(false)
  })

  it('selects with the mouse', async () => {
    const wrapper = mountInput()
    await wrapper.find('input').trigger('focus')
    await wrapper.findAll('[role=option]')[3].trigger('click')
    expect(wrapper.props('modelValue')).toBe(720)
  })

  it('arrow keys step instead while the menu is closed', async () => {
    const wrapper = mountInput({ modelValue: 60 })
    await wrapper.find('input').trigger('keydown', { key: 'ArrowUp' })
    expect(wrapper.props('modelValue')).toBe(75)
  })

  it('closes on blur', async () => {
    const wrapper = mountInput()
    await wrapper.find('input').trigger('focus')
    await wrapper.find('input').trigger('blur')
    expect(isOpen(wrapper)).toBe(false)
  })

  it('exposes presets to the renderless slot', () => {
    let presets: unknown
    mount(DurationInput, {
      props: { presets: ['1h'] },
      slots: { default: (props: { presets: unknown }) => ((presets = props.presets), null) },
    })
    expect(presets).toMatchObject([{ label: '1h', seconds: 3600 }])
  })
})
