import { readFileSync } from 'node:fs'
import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import { describe, expect, it } from 'vitest'
import DurationInput from '../src/components/DurationInput.vue'
import { de, plugin, type DurationInputSlotProps } from '../src'

const part = (wrapper: ReturnType<typeof mount>, name: string) => wrapper.find(`[data-slot=${name}]`)

/** Minimal component with the `modelValue` / `update:modelValue` / `blur` contract most UI libraries share. */
const LibInput = defineComponent({
  props: { modelValue: String, invalid: Boolean },
  emits: ['update:modelValue', 'blur'],
  setup(props, { emit, slots }) {
    return () =>
      h('div', { class: 'lib-input', 'data-invalid': props.invalid || undefined }, [
        slots.leading?.(),
        h('input', {
          value: props.modelValue,
          onInput: (e: Event) => emit('update:modelValue', (e.target as HTMLInputElement).value),
          onBlur: (e: FocusEvent) => emit('blur', e),
        }),
      ])
  },
})

describe('DurationInput styling', () => {
  it('applies size and variant classes and data attributes', () => {
    const wrapper = mount(DurationInput, { props: { size: 'lg', variant: 'soft' } })
    expect(part(wrapper, 'field').classes()).toEqual(expect.arrayContaining(['h-11', 'bg-(--_sdi-soft)']))
    expect(part(wrapper, 'root').attributes()).toMatchObject({ 'data-size': 'lg', 'data-variant': 'soft' })
  })

  it('reads colors from tokens that can be set on an ancestor', () => {
    const css = readFileSync('src/styles/vars.css', 'utf8')
    for (const token of ['fg', 'bg', 'border', 'ring', 'invalid', 'muted', 'soft', 'popover'])
      expect(css).toContain(`--_sdi-${token}: var(--sdi-${token},`)
  })

  it('marks the root as a group for group-data-* variants', () => {
    const wrapper = mount(DurationInput)
    expect(part(wrapper, 'root').classes()).toContain('group')
  })

  it('merges ui classes over the defaults', () => {
    const wrapper = mount(DurationInput, { props: { ui: { field: 'rounded-none h-12' } } })
    const classes = part(wrapper, 'field').classes()
    expect(classes).toEqual(expect.arrayContaining(['rounded-none', 'h-12']))
    expect(classes).not.toContain('rounded-md')
    expect(classes).not.toContain('h-9')
  })

  it('lets a root class override defaults', () => {
    const wrapper = mount(DurationInput, { attrs: { class: 'gap-4' } })
    expect(part(wrapper, 'root').classes()).toContain('gap-4')
    expect(part(wrapper, 'root').classes()).not.toContain('gap-1.5')
  })

  it('drops default classes when unstyled', () => {
    const wrapper = mount(DurationInput, { props: { unstyled: true, ui: { field: 'my-field' } } })
    expect(part(wrapper, 'field').classes()).toEqual(['my-field'])
    expect(part(wrapper, 'input').classes()).toEqual([])
    expect(part(wrapper, 'root').classes()).toEqual(['sdi'])
  })

  it('renders leading and trailing slots', () => {
    const wrapper = mount(DurationInput, { slots: { leading: '<i>L</i>', trailing: '<i>T</i>' } })
    expect(part(wrapper, 'leading').text()).toBe('L')
    expect(part(wrapper, 'trailing').text()).toBe('T')
  })

  it('shows the preview only when enabled and different from the text', async () => {
    const wrapper = mount(DurationInput, { props: { preview: true } })
    const input = wrapper.find('input')
    await input.setValue('90 min')
    expect(part(wrapper, 'preview').text()).toBe('= 1h 30min')
    await input.setValue('1h 30min')
    expect(part(wrapper, 'preview').exists()).toBe(false)
    await input.setValue('2 parsecs')
    expect(part(wrapper, 'preview').exists()).toBe(false)

    const off = mount(DurationInput)
    await off.find('input').setValue('90 min')
    expect(part(off, 'preview').exists()).toBe(false)
  })

  it('shows a localized error message linked to the input', async () => {
    const wrapper = mount(DurationInput, { props: { locale: de } })
    const input = wrapper.find('input')
    await input.setValue('45')
    await input.trigger('blur')
    const message = part(wrapper, 'message')
    expect(message.text()).toBe('Gib eine Einheit an, z. B. „45min“ oder „2h“.')
    expect(input.attributes('aria-describedby')).toBe(message.attributes('id'))
    await input.setValue('45min')
    expect(part(wrapper, 'message').exists()).toBe(false)
    expect(input.attributes('aria-describedby')).toBeUndefined()
  })

  it('supports overriding or hiding messages', async () => {
    const custom = mount(DurationInput, { props: { messages: { missing_unit: 'Unit?' } } })
    await custom.find('input').setValue('45')
    await custom.find('input').trigger('blur')
    expect(part(custom, 'message').text()).toBe('Unit?')

    const hidden = mount(DurationInput, { props: { messages: false } })
    await hidden.find('input').setValue('45')
    await hidden.find('input').trigger('blur')
    expect(part(hidden, 'message').exists()).toBe(false)
    expect(hidden.find('input').attributes('aria-invalid')).toBe('true')
  })
})

describe('DurationInput aria-describedby', () => {
  it('keeps the caller\'s description and adds the message', async () => {
    const wrapper = mount(DurationInput, { attrs: { 'aria-describedby': 'hint' } })
    const input = wrapper.find('input')
    expect(input.attributes('aria-describedby')).toBe('hint')
    await input.setValue('2 parsecs')
    await input.trigger('blur')
    const messageId = part(wrapper, 'message').attributes('id')
    expect(input.attributes('aria-describedby')).toBe(`hint ${messageId}`)
  })
})

describe('DurationInput renderless slot', () => {
  it('works with a component through inputProps', async () => {
    let scope: DurationInputSlotProps | undefined
    const wrapper: ReturnType<typeof mount<typeof DurationInput>> = mount(DurationInput, {
      props: {
        modelValue: null,
        'onUpdate:modelValue': (value: number | string | null): unknown => wrapper.setProps({ modelValue: value }),
      },
      slots: {
        default: (props: DurationInputSlotProps) => {
          scope = props
          return h(LibInput, { ...props.inputProps, invalid: props.invalid })
        },
      },
    })
    expect(wrapper.find('[data-slot=root]').exists()).toBe(false)
    const input = wrapper.find('input')
    await input.setValue('189h')
    expect(wrapper.props('modelValue')).toBe(11340)
    await input.trigger('blur')
    expect(input.element.value).toBe('7d 21h')
    await input.setValue('2 parsecs')
    await input.trigger('blur')
    expect(wrapper.find('.lib-input').attributes('data-invalid')).toBe('true')
    expect(scope?.message).toBe('Unknown unit "parsecs". Use minutes, hours, days or weeks.')
  })

  it('works with a native input through nativeInputProps', async () => {
    const wrapper = mount(DurationInput, {
      props: { modelValue: null },
      slots: { default: (props: DurationInputSlotProps) => h('input', props.nativeInputProps) },
    })
    await wrapper.find('input').setValue('2h')
    expect(wrapper.emitted('update:modelValue')).toEqual([[120]])
  })
})

describe('DurationInput as', () => {
  it('renders the given component with invalidProps and forwarded slots', async () => {
    const wrapper = mount(DurationInput, {
      props: { modelValue: 30, as: LibInput, invalidProps: ({ invalid }) => ({ invalid }) },
      attrs: { class: 'custom' },
      slots: { leading: '<i class="icon">L</i>' },
    })
    expect(wrapper.find('.lib-input').classes()).toContain('custom')
    expect(wrapper.find('.icon').exists()).toBe(true)
    expect(wrapper.find('input').element.value).toBe('30min')
    await wrapper.find('input').setValue('2 parsecs')
    await wrapper.find('input').trigger('blur')
    expect(wrapper.find('.lib-input').attributes('data-invalid')).toBe('true')
    await wrapper.find('input').setValue('2h')
    expect(wrapper.emitted('update:modelValue')).toEqual([[120]])
  })

  it('binds native props when as is a tag name', async () => {
    const wrapper = mount(DurationInput, { props: { modelValue: null, as: 'input' } })
    await wrapper.find('input').setValue('1:30')
    expect(wrapper.emitted('update:modelValue')).toEqual([[90]])
  })

  it('keeps the caller\'s listeners next to its own', async () => {
    const calls: string[] = []
    const listeners = {
      onBlur: () => calls.push('blur'),
      onKeydown: () => calls.push('keydown'),
      onInput: () => calls.push('input'),
    }
    const wrapper = mount(DurationInput, { props: { modelValue: null, as: 'input' }, attrs: listeners })
    const input = wrapper.find('input')
    await input.setValue('2h')
    await input.trigger('keydown', { key: 'a' })
    await input.trigger('blur')
    expect(calls).toEqual(['input', 'keydown', 'blur'])
    expect(wrapper.emitted('update:modelValue')).toEqual([[120]])
    expect(input.element.value).toBe('2h')

    const lib = mount(DurationInput, { props: { modelValue: null, as: LibInput }, attrs: { onBlur: () => calls.push('lib blur') } })
    await lib.find('input').setValue('3h')
    await lib.find('input').trigger('blur')
    expect(calls).toContain('lib blur')
    expect(lib.find('input').element.value).toBe('3h')
  })

  it('exposes focus() for components that wrap the input', () => {
    const wrapper = mount(DurationInput, { props: { as: LibInput }, attachTo: document.body })
    ;(wrapper.vm as unknown as { focus: () => void }).focus()
    expect(document.activeElement).toBe(wrapper.find('input').element)
    wrapper.unmount()
  })
})

describe('plugin defaults', () => {
  it('applies app-wide defaults that props can override', () => {
    const global = { plugins: [[plugin, { size: 'sm', unstyled: false, ui: { field: 'rounded-full' } }] as [typeof plugin, object]] }
    const wrapper = mount(DurationInput, { global })
    expect(part(wrapper, 'field').classes()).toEqual(expect.arrayContaining(['h-8', 'rounded-full']))

    const overridden = mount(DurationInput, { global, props: { size: 'lg', ui: { field: 'rounded-none' } } })
    expect(part(overridden, 'field').classes()).toEqual(expect.arrayContaining(['h-11', 'rounded-none']))
    expect(part(overridden, 'field').classes()).not.toContain('rounded-full')
  })

  it('can set as globally', () => {
    const wrapper = mount(DurationInput, { global: { plugins: [[plugin, { as: LibInput }] as [typeof plugin, object]] } })
    expect(wrapper.find('.lib-input').exists()).toBe(true)
  })
})

describe('DurationInput as: size and variant', () => {
  it('passes size and variant on to the as component', () => {
    const wrapper = mount(DurationInput, { props: { as: 'input', size: 'large', variant: 'outlined' } })
    expect(wrapper.find('input').attributes()).toMatchObject({ size: 'large', variant: 'outlined' })
  })
})
