import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import PrimeVue from 'primevue/config'
import InputText from 'primevue/inputtext'
import { createVuetify } from 'vuetify'
import { VTextField } from 'vuetify/components'
import DurationInput from '../src/components/DurationInput.vue'
import { primevue, vuetify } from '../src/adapters'
import type { InvalidPropsFn } from '../src/adapters'
import type { Component } from 'vue'

/** Mounts `<DurationInput :as>` with a working v-model. */
function mountAs(as: Component, invalidProps: InvalidPropsFn, plugins: unknown[]) {
  const wrapper = mount(DurationInput, {
    props: {
      as,
      invalidProps,
      modelValue: null,
      'onUpdate:modelValue': (value: number | null) => wrapper.setProps({ modelValue: value }),
    },
    global: { plugins: plugins as never },
    attachTo: document.body,
  })
  return wrapper
}

describe('PrimeVue InputText', () => {
  it('parses, normalizes on blur and marks invalid input', async () => {
    const wrapper = mountAs(InputText, primevue, [[PrimeVue, { unstyled: true }]])
    const input = wrapper.find('input')
    await input.setValue('189h')
    expect(wrapper.props('modelValue')).toBe(11340)
    await input.trigger('blur')
    expect(input.element.value).toBe('7d 21h')
    await input.setValue('2 parsecs')
    expect(input.attributes('aria-invalid')).toBe('true')
    expect(wrapper.findComponent(InputText).props('invalid')).toBe(true)
    wrapper.unmount()
  })
})

describe('Vuetify VTextField', () => {
  it('parses, normalizes on blur and shows the error message', async () => {
    const wrapper = mountAs(VTextField, vuetify, [createVuetify()])
    const input = wrapper.find('input')
    await input.setValue('189h')
    expect(wrapper.props('modelValue')).toBe(11340)
    await input.trigger('focus')
    await input.trigger('blur')
    expect(input.element.value).toBe('7d 21h')
    await input.setValue('45')
    const field = wrapper.findComponent(VTextField)
    expect(field.props('error')).toBe(true)
    expect(field.props('errorMessages')).toBe('Add a unit, e.g. "45min" or "2h".')
    expect(wrapper.text()).toContain('Add a unit')
    wrapper.unmount()
  })

  it('treats the clear button (null) as empty', async () => {
    const wrapper = mountAs(VTextField, vuetify, [createVuetify()])
    await wrapper.find('input').setValue('2h')
    wrapper.findComponent(VTextField).vm.$emit('update:modelValue', null)
    await wrapper.vm.$nextTick()
    expect(wrapper.props('modelValue')).toBe(null)
    wrapper.unmount()
  })
})
