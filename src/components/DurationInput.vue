<script setup lang="ts">
import { ref, watch } from 'vue'
import { useDurationInput } from '../composables/useDurationInput'
import type { FormatStyle } from '../core/format'
import type { ParseErrorCode } from '../core/parse'
import type { Locale, UnitAliases, UnitKey } from '../core/units'

const props = defineProps<{
  /** Built-in locales whose unit names are accepted. Defaults to English and German. */
  locales?: Locale[]
  /** Extra unit aliases, e.g. `{ hour: ['óra'] }`. */
  customAliases?: UnitAliases
  /** Language of the normalized text shown on blur (only matters for `displayStyle: 'long'`). */
  displayLocale?: Locale
  displayStyle?: FormatStyle
  displayUnits?: UnitKey[]
  min?: number
  max?: number
  required?: boolean
  placeholder?: string
  disabled?: boolean
  id?: string
  name?: string
}>()

const model = defineModel<number | null>({ default: null })

const emit = defineEmits<{
  error: [code: ParseErrorCode | null]
}>()

const { text, error, onInput, onBlur } = useDurationInput(model, () => props)

watch(error, (code) => emit('error', code))

const input = ref<HTMLInputElement>()
defineExpose({
  focus: () => input.value?.focus(),
  blur: () => input.value?.blur(),
})
</script>

<template>
  <input
    :id="id"
    ref="input"
    type="text"
    inputmode="text"
    autocomplete="off"
    spellcheck="false"
    class="sdi"
    :class="{ 'sdi--invalid': error }"
    :name="name"
    :value="text"
    :placeholder="placeholder"
    :disabled="disabled"
    :required="required"
    :aria-invalid="error ? 'true' : undefined"
    :data-error="error ?? undefined"
    @input="onInput"
    @blur="onBlur"
  />
</template>

<style>
:where(.sdi--invalid) {
  border-color: var(--sdi-invalid-color, #d93025);
  outline-color: var(--sdi-invalid-color, #d93025);
}
</style>
