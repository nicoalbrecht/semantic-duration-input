<script setup lang="ts">
import { computed, inject, ref, useAttrs, useId, watch } from 'vue'
import { cx, type ClassValue } from 'tailwind-variants'
import type { InvalidState } from '../adapters'
import { useDurationInput } from '../composables/useDurationInput'
import { formatErrorMessage } from '../core/messages'
import type { ParseErrorCode } from '../core/parse'
import { DURATION_INPUT_DEFAULTS, type DurationInputProps } from '../config'
import { durationInputTheme, type DurationInputPart, type DurationInputSize, type DurationInputVariant } from '../theme'

defineOptions({ inheritAttrs: false })

// Props that accept booleans default to `undefined` (Vue would cast them to `false`),
// so app-wide defaults can fill them in.
const props = withDefaults(defineProps<DurationInputProps>(), {
  unstyled: undefined,
  preview: undefined,
  messages: undefined,
})

const model = defineModel<number | null>({ default: null })

const emit = defineEmits<{
  error: [code: ParseErrorCode | null]
}>()

export interface DurationInputSlotProps {
  /** Bind to a component with a `modelValue`/`update:modelValue` contract. Includes `$attrs`. */
  inputProps: Record<string, unknown>
  /** Bind to a native `<input>` (`value`/`onInput`). Includes `$attrs`. */
  nativeInputProps: Record<string, unknown>
  text: string
  minutes: number | null
  error: ParseErrorCode | null
  invalid: boolean
  message: string | null
  /** Id to give your error element, for `aria-describedby`. */
  messageId: string
  preview: string | null
  onBlur: () => void
}

const slots = defineSlots<{
  /** Renderless mode: render your own input with the given props. */
  default?: (props: DurationInputSlotProps) => unknown
  leading?: () => unknown
  trailing?: () => unknown
  [name: string]: ((scope: any) => unknown) | undefined
}>()

const attrs = useAttrs()
const defaults = inject(DURATION_INPUT_DEFAULTS, {})

/** A prop, falling back to the app-wide default. */
function setting<K extends keyof typeof defaults>(key: K) {
  return computed(() => props[key] ?? defaults[key])
}
const as = setting('as')
const invalidProps = setting('invalidProps')
const unstyled = setting('unstyled')
const size = setting('size')
const variant = setting('variant')
const showPreview = setting('preview')
const messages = setting('messages')
const displayLocale = setting('displayLocale')

const options = computed(() => ({
  locales: props.locales ?? defaults.locales,
  customAliases: props.customAliases ?? defaults.customAliases,
  displayLocale: displayLocale.value,
  displayStyle: props.displayStyle ?? defaults.displayStyle,
  displayUnits: props.displayUnits ?? defaults.displayUnits,
  min: props.min,
  max: props.max,
  required: props.required,
}))

const { text, error, preview, onInput, onBlur } = useDurationInput(model, options)

watch(error, (code) => emit('error', code))

const invalid = computed(() => error.value !== null)
const message = computed(() => {
  if (error.value === null || messages.value === false) return null
  return formatErrorMessage(error.value, {
    locale: displayLocale.value,
    min: props.min,
    max: props.max,
    overrides: messages.value,
  })
})
const messageId = `sdi-${useId()}-message`

function passthroughAttrs(includeClass: boolean) {
  if (includeClass) return attrs
  const { class: _class, style: _style, ...rest } = attrs
  return rest
}

function stateProps() {
  return {
    disabled: props.disabled,
    required: props.required,
    'aria-invalid': invalid.value ? 'true' : undefined,
    'data-error': error.value ?? undefined,
  }
}

const inputProps = computed(() => ({
  ...passthroughAttrs(true),
  ...stateProps(),
  modelValue: text.value,
  'onUpdate:modelValue': onInput,
  onBlur,
}))

const nativeInputProps = computed(() => ({
  ...passthroughAttrs(true),
  ...stateProps(),
  value: text.value,
  onInput,
  onBlur,
}))

const asProps = computed(() => {
  const base = typeof as.value === 'string' ? nativeInputProps.value : inputProps.value
  const state: InvalidState = { invalid: invalid.value, error: error.value, message: message.value, onBlur }
  // `size` and `variant` are declared props here, but most libraries have them too: pass them on.
  return { ...base, size: size.value, variant: variant.value, ...invalidProps.value?.(state) }
})

const slotProps = computed<DurationInputSlotProps>(() => ({
  inputProps: inputProps.value,
  nativeInputProps: nativeInputProps.value,
  text: text.value,
  minutes: model.value,
  error: error.value,
  invalid: invalid.value,
  message: message.value,
  messageId,
  preview: preview.value,
  onBlur,
}))

/** Slots handed on to the `as` component, so its own slot names (e.g. `#leading`) keep working. */
const forwardedSlots = computed(() => Object.keys(slots).filter((name) => name !== 'default'))

const theme = computed(() =>
  unstyled.value
    ? null
    : durationInputTheme({
        size: size.value as DurationInputSize | undefined,
        variant: variant.value as DurationInputVariant | undefined,
        invalid: invalid.value,
        disabled: props.disabled,
      }),
)

function classFor(part: DurationInputPart) {
  const extra = cx(defaults.ui?.[part], props.ui?.[part], part === 'root' ? (attrs.class as ClassValue) : undefined)
  return theme.value ? theme.value[part]({ class: extra }) : extra
}

// The native input, or the `as` component instance (whose root may wrap the actual input).
const input = ref<HTMLInputElement | { $el?: unknown }>()
function inputElement() {
  const el = input.value instanceof HTMLElement ? input.value : input.value?.$el
  if (!(el instanceof HTMLElement)) return undefined
  return el instanceof HTMLInputElement ? el : (el.querySelector('input') ?? undefined)
}
defineExpose({
  focus: () => inputElement()?.focus(),
  blur: () => inputElement()?.blur(),
})
</script>

<template>
  <slot v-if="slots.default" v-bind="slotProps" />

  <component :is="as" v-else-if="as" ref="input" v-bind="asProps">
    <template v-for="name in forwardedSlots" #[name]="scope">
      <slot :name="name" v-bind="scope ?? {}" />
    </template>
  </component>

  <div
    v-else
    :class="['sdi', classFor('root')]"
    :style="attrs.style as any"
    data-slot="root"
    :data-invalid="invalid || undefined"
    :data-disabled="disabled || undefined"
    :data-size="size ?? 'md'"
    :data-variant="variant ?? 'outline'"
  >
    <div :class="classFor('field')" data-slot="field">
      <span v-if="slots.leading" :class="classFor('leading')" data-slot="leading"><slot name="leading" /></span>
      <input
        ref="input"
        type="text"
        inputmode="text"
        autocomplete="off"
        spellcheck="false"
        :class="classFor('input')"
        data-slot="input"
        v-bind="passthroughAttrs(false)"
        :value="text"
        :disabled="disabled"
        :required="required"
        :aria-invalid="invalid ? 'true' : undefined"
        :aria-describedby="message ? messageId : undefined"
        :data-error="error ?? undefined"
        @input="onInput"
        @blur="onBlur"
      />
      <span v-if="showPreview && preview" :class="classFor('preview')" data-slot="preview" aria-hidden="true">= {{ preview }}</span>
      <span v-if="slots.trailing" :class="classFor('trailing')" data-slot="trailing"><slot name="trailing" /></span>
    </div>
    <p v-if="message" :id="messageId" :class="classFor('message')" data-slot="message">{{ message }}</p>
  </div>
</template>
