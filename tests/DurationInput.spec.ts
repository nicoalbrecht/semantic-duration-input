import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import DurationInput from '../src/components/DurationInput.vue'

/** Mounts with a working v-model: emitted values are fed back as the `modelValue` prop. */
function mountInput() {
  const wrapper = mount(DurationInput, {
    props: {
      modelValue: null,
      'onUpdate:modelValue': (value: number | null) => wrapper.setProps({ modelValue: value }),
    },
  })
  return wrapper
}

describe('DurationInput', () => {
  it('emits minutes for valid input', async () => {
    const wrapper = mount(DurationInput, { props: { modelValue: null } })
    await wrapper.find('input').setValue('2h')
    expect(wrapper.emitted('update:modelValue')).toEqual([[120]])
  })

  it('does not emit for invalid input and marks the field invalid', async () => {
    const wrapper = mount(DurationInput, { props: { modelValue: 30 } })
    const input = wrapper.find('input')
    await input.setValue('2 parsecs')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(input.attributes('aria-invalid')).toBe('true')
    expect(input.classes()).toContain('sdi--invalid')
    expect(wrapper.emitted('error')).toEqual([['unknown_unit']])
  })

  it('clears the error once the input becomes valid', async () => {
    const wrapper = mount(DurationInput, { props: { modelValue: null } })
    const input = wrapper.find('input')
    await input.setValue('2')
    expect(input.attributes('aria-invalid')).toBe('true')
    await input.setValue('2h')
    expect(input.attributes('aria-invalid')).toBeUndefined()
    expect(wrapper.emitted('error')).toEqual([['missing_unit'], [null]])
  })

  it('emits null when cleared', async () => {
    const wrapper = mount(DurationInput, { props: { modelValue: 60 } })
    await wrapper.find('input').setValue('')
    expect(wrapper.emitted('update:modelValue')).toEqual([[null]])
  })

  it('normalizes the text on blur', async () => {
    const wrapper = mountInput()
    const input = wrapper.find('input')
    await input.setValue('189h')
    expect(input.element.value).toBe('189h')
    await input.trigger('blur')
    expect(input.element.value).toBe('7d 21h')
  })

  it('keeps invalid text on blur', async () => {
    const wrapper = mountInput()
    const input = wrapper.find('input')
    await input.setValue('2h foo')
    await input.trigger('blur')
    expect(input.element.value).toBe('2h foo')
  })

  it('formats the initial value and reacts to external changes', async () => {
    const wrapper = mount(DurationInput, { props: { modelValue: 90 } })
    const input = wrapper.find('input')
    expect(input.element.value).toBe('1h 30min')
    await wrapper.setProps({ modelValue: 1440 })
    expect(input.element.value).toBe('1d')
    await wrapper.setProps({ modelValue: null })
    expect(input.element.value).toBe('')
  })

  it('does not overwrite the text while the user types', async () => {
    const wrapper = mountInput()
    const input = wrapper.find('input')
    await input.setValue('120 min')
    expect(wrapper.props('modelValue')).toBe(120)
    expect(input.element.value).toBe('120 min')
  })

  it('reformats when the display locale changes', async () => {
    const wrapper = mount(DurationInput, { props: { modelValue: 90, displayStyle: 'long' } })
    const input = wrapper.find('input')
    expect(input.element.value).toBe('1 hour 30 minutes')
    await wrapper.setProps({ displayLocale: 'de' })
    expect(input.element.value).toBe('1 Stunde 30 Minuten')
  })

  it('passes attributes through to the input', () => {
    const wrapper = mount(DurationInput, { attrs: { 'data-test': 'x', class: 'custom' } })
    const input = wrapper.find('input')
    expect(input.attributes('data-test')).toBe('x')
    expect(input.classes()).toEqual(expect.arrayContaining(['sdi', 'custom']))
  })
})
