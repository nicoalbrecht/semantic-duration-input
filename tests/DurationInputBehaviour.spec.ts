import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import DurationInput from '../src/components/DurationInput.vue'
import type { DurationInputProps } from '../src'

/** Mounts with a working v-model: emitted values are fed back as the `modelValue` prop. */
function mountInput(props: DurationInputProps & { modelValue?: number | string | null } = {}, attrs = {}) {
  const wrapper: ReturnType<typeof mount<typeof DurationInput>> = mount(DurationInput, {
    props: {
      modelValue: null,
      ...props,
      'onUpdate:modelValue': (value: number | string | null): unknown => wrapper.setProps({ modelValue: value }),
    },
    attrs,
  })
  return wrapper
}

const key = (wrapper: ReturnType<typeof mountInput>, key: string, init: KeyboardEventInit = {}) =>
  wrapper.find('input').trigger('keydown', { key, ...init })

describe('validateOn', () => {
  it('eager: hides errors while typing, shows them on blur, clears them live', async () => {
    const wrapper = mountInput()
    const input = wrapper.find('input')
    await input.setValue('1')
    expect(input.attributes('aria-invalid')).toBeUndefined()
    expect(wrapper.find('[data-slot=message]').exists()).toBe(false)
    await input.trigger('blur')
    expect(input.attributes('aria-invalid')).toBe('true')
    await input.setValue('1h')
    expect(input.attributes('aria-invalid')).toBeUndefined()
    // Once cleared, a new error waits for the next blur again.
    await input.setValue('1h x')
    expect(input.attributes('aria-invalid')).toBeUndefined()
  })

  it('blur: updates the shown error only on blur', async () => {
    const wrapper = mountInput({ validateOn: 'blur' })
    const input = wrapper.find('input')
    await input.setValue('1')
    await input.trigger('blur')
    expect(input.attributes('aria-invalid')).toBe('true')
    await input.setValue('1h')
    expect(input.attributes('aria-invalid')).toBe('true')
    await input.trigger('blur')
    expect(input.attributes('aria-invalid')).toBeUndefined()
  })

  it('input: shows errors on every keystroke', async () => {
    const wrapper = mountInput({ validateOn: 'input' })
    await wrapper.find('input').setValue('1')
    expect(wrapper.find('input').attributes('aria-invalid')).toBe('true')
  })

  it('updates the model live in every mode', async () => {
    const wrapper = mountInput({ validateOn: 'blur' })
    await wrapper.find('input').setValue('2h')
    expect(wrapper.props('modelValue')).toBe(120)
  })

  it('shows the error on Enter and via the exposed validate()', async () => {
    const wrapper = mountInput()
    await wrapper.find('input').setValue('1')
    await key(wrapper, 'Enter')
    expect(wrapper.find('input').attributes('aria-invalid')).toBe('true')

    const other = mountInput({ required: true })
    expect((other.vm as unknown as { validate: () => boolean }).validate()).toBe(false)
    await other.vm.$nextTick()
    expect(other.find('[data-slot=message]').text()).toBe('Please enter a duration.')
  })
})

describe('required', () => {
  it('clears the model when the field is emptied and shows the error on blur', async () => {
    const wrapper = mountInput({ modelValue: 90, required: true })
    const input = wrapper.find('input')
    await input.setValue('')
    expect(wrapper.props('modelValue')).toBeNull()
    await input.trigger('blur')
    expect(wrapper.find('[data-slot=message]').text()).toBe('Please enter a duration.')
  })
})

describe('keyboard', () => {
  it('steps with arrows, Shift and PageUp/PageDown, snapping to the step', async () => {
    const wrapper = mountInput({ modelValue: 67 })
    await key(wrapper, 'ArrowUp')
    expect(wrapper.props('modelValue')).toBe(75)
    expect(wrapper.find('input').element.value).toBe('1h 15min')
    await key(wrapper, 'ArrowDown')
    await key(wrapper, 'ArrowDown')
    expect(wrapper.props('modelValue')).toBe(45)
    await key(wrapper, 'ArrowUp', { shiftKey: true })
    expect(wrapper.props('modelValue')).toBe(60)
    await key(wrapper, 'PageUp')
    expect(wrapper.props('modelValue')).toBe(1440)
    await key(wrapper, 'PageDown')
    await key(wrapper, 'PageDown')
    expect(wrapper.props('modelValue')).toBe(0)
  })

  it('steps from the typed text, from empty, and within bounds', async () => {
    const wrapper = mountInput({ step: 30, min: 30, max: '2h' })
    await wrapper.find('input').setValue('50m')
    await key(wrapper, 'ArrowUp')
    expect(wrapper.props('modelValue')).toBe(60)
    await key(wrapper, 'ArrowUp', { shiftKey: true })
    await key(wrapper, 'ArrowUp', { shiftKey: true })
    expect(wrapper.props('modelValue')).toBe(120)
    await wrapper.find('input').setValue('')
    await key(wrapper, 'ArrowDown')
    expect(wrapper.props('modelValue')).toBe(30)
  })

  it('can turn stepping off', async () => {
    const wrapper = mountInput({ modelValue: 60, step: false })
    await key(wrapper, 'ArrowUp')
    expect(wrapper.props('modelValue')).toBe(60)
  })

  it('normalizes on Enter', async () => {
    const wrapper = mountInput()
    await wrapper.find('input').setValue('90m')
    await key(wrapper, 'Enter')
    expect(wrapper.find('input').element.value).toBe('1h 30min')
  })

  it('reverts to the last committed value on Escape, and only then stops the event', async () => {
    const wrapper = mountInput({ modelValue: 60 })
    const input = wrapper.find('input')
    await input.setValue('3h')
    expect(wrapper.props('modelValue')).toBe(180)
    const event = new KeyboardEvent('keydown', { key: 'Escape', cancelable: true })
    input.element.dispatchEvent(event)
    await wrapper.vm.$nextTick()
    expect(event.defaultPrevented).toBe(true)
    expect(input.element.value).toBe('1h')
    expect(wrapper.props('modelValue')).toBe(60)

    const again = new KeyboardEvent('keydown', { key: 'Escape', cancelable: true })
    input.element.dispatchEvent(again)
    expect(again.defaultPrevented).toBe(false)
  })
})

describe('shorthand, snapping and clamping', () => {
  it('accepts 1h30 and defaultUnit', async () => {
    const wrapper = mountInput({ defaultUnit: 'minute' })
    await wrapper.find('input').setValue('1h30')
    expect(wrapper.props('modelValue')).toBe(90)
    await wrapper.find('input').setValue('45')
    expect(wrapper.props('modelValue')).toBe(45)
  })

  it('snaps to the step on blur', async () => {
    const wrapper = mountInput({ snapToStep: true })
    await wrapper.find('input').setValue('1h 8m')
    await wrapper.find('input').trigger('blur')
    expect(wrapper.props('modelValue')).toBe(75)
    expect(wrapper.find('input').element.value).toBe('1h 15min')
  })

  it('clamps instead of reporting out_of_range', async () => {
    const wrapper = mountInput({ clamp: true, min: '30m', max: '8h' })
    await wrapper.find('input').setValue('10h')
    expect(wrapper.props('modelValue')).toBe(480)
    await wrapper.find('input').trigger('blur')
    expect(wrapper.find('input').element.value).toBe('8h')
    expect(wrapper.find('input').attributes('aria-invalid')).toBeUndefined()
  })

  it('reports out_of_range with bounds given as text', async () => {
    const wrapper = mountInput({ max: '8h' })
    await wrapper.find('input').setValue('9h')
    await wrapper.find('input').trigger('blur')
    expect(wrapper.find('[data-slot=message]').text()).toBe('Must be at most 8h.')
  })
})

describe('valueFormat and precision', () => {
  it.each([
    ['seconds', 5400],
    ['ms', 5400000],
    ['iso', 'PT1H30M'],
  ] as const)('%s', async (valueFormat, expected) => {
    const wrapper = mountInput({ valueFormat })
    await wrapper.find('input').setValue('1h 30m')
    expect(wrapper.props('modelValue')).toBe(expected)
    await wrapper.setProps({ modelValue: null })
    await wrapper.setProps({ modelValue: expected })
    expect(wrapper.find('input').element.value).toBe('1h 30min')
  })

  it('keeps seconds with second precision', async () => {
    const wrapper = mountInput({ valueFormat: 'seconds', precision: 'second' })
    await wrapper.find('input').setValue('1m30')
    expect(wrapper.props('modelValue')).toBe(90)
    await wrapper.find('input').trigger('blur')
    expect(wrapper.find('input').element.value).toBe('1min 30s')
  })

  it('interprets numeric bounds in the model unit', async () => {
    const wrapper = mountInput({ valueFormat: 'seconds', max: 60 })
    await wrapper.find('input').setValue('2min')
    await wrapper.find('input').trigger('blur')
    expect(wrapper.find('[data-slot=message]').text()).toBe('Must be at most 1min.')
  })
})

describe('forms', () => {
  it('submits the model value through a hidden input instead of the text', async () => {
    const wrapper = mountInput({ modelValue: 90 }, { name: 'duration' })
    const hidden = wrapper.find('input[type=hidden]')
    expect(hidden.attributes()).toMatchObject({ name: 'duration', value: '90' })
    expect(wrapper.find('input[type=text]').attributes('name')).toBeUndefined()
    await wrapper.find('input[type=text]').setValue('')
    expect(wrapper.find('input[type=hidden]').attributes('value')).toBe('')
  })

  it('renders no hidden input without a name', () => {
    expect(mountInput().find('input[type=hidden]').exists()).toBe(false)
  })

  it('also works with as', () => {
    const wrapper = mount(DurationInput, { props: { modelValue: 'PT1H', valueFormat: 'iso', as: 'input' }, attrs: { name: 'd' } })
    expect(wrapper.find('input[type=hidden]').attributes('value')).toBe('PT1H')
  })
})

describe('preview announcement', () => {
  it('announces the preview to screen readers after a pause', async () => {
    vi.useFakeTimers()
    try {
      const wrapper = mountInput({ preview: true })
      const announcer = wrapper.find('[data-slot=announcer]')
      expect(announcer.attributes('aria-live')).toBe('polite')
      await wrapper.find('input').setValue('90m')
      expect(announcer.text()).toBe('')
      vi.advanceTimersByTime(600)
      await wrapper.vm.$nextTick()
      expect(announcer.text()).toBe('= 1h 30min')
    } finally {
      vi.useRealTimers()
    }
  })
})
