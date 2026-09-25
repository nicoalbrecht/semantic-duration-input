<script setup lang="ts">
import { computed, inject, mergeProps, nextTick, onBeforeUnmount, ref, useAttrs, useId, watch, watchEffect, type Ref } from 'vue'
import { cx, type ClassValue } from 'tailwind-variants'
import type { InvalidState } from '../adapters'
import { useDurationInput } from '../composables/useDurationInput'
import { formatErrorMessage } from '../core/messages'
import type { ParseErrorCode, ParseFailure } from '../core/parse'
import { resolveAmount } from '../core/value'
import { DURATION_INPUT_DEFAULTS, type DurationInputProps } from '../config'
import { durationInputTheme, type DurationInputPart, type DurationInputSize, type DurationInputVariant } from '../theme'

defineOptions({ inheritAttrs: false })

// Props that accept booleans default to `undefined` (Vue would cast them to `false`),
// so app-wide defaults can fill them in.
const props = withDefaults(defineProps<DurationInputProps>(), {
  unstyled: undefined,
  preview: undefined,
  messages: undefined,
  implicitUnits: undefined,
  snapToStep: undefined,
  clamp: undefined,
  step: undefined,
})

/** The duration, stored as set by `valueFormat` (minutes by default). `null` when empty. */
const model = defineModel<number | string | null>({ default: null })

const emit = defineEmits<{
  /** The shown error changed (see `validateOn`). `null` when it was cleared. */
  error: [code: ParseErrorCode | null]
}>()

/** A resolved entry of `presets`. */
export interface DurationPresetItem {
  /** Element id of the option, for `aria-activedescendant`. */
  id: string
  /** Text shown in the menu. */
  label: string
  /** Value in seconds. */
  seconds: number
}

/** Props of the default (renderless) slot. */
export interface DurationInputSlotProps {
  /** Bind to a component with a `modelValue`/`update:modelValue` contract. Includes `$attrs`. */
  inputProps: Record<string, unknown>
  /** Bind to a native `<input>` (`value`/`onInput`). Includes `$attrs`. */
  nativeInputProps: Record<string, unknown>
  /** Bind to an `<input type="hidden">` for native form submission. `null` without a `name` attribute. */
  hiddenInputProps: Record<string, unknown> | null
  /** The text in the field. */
  text: string
  /** The model value. */
  value: number | string | null
  /** The shown error (see `validateOn`). */
  error: ParseErrorCode | null
  /** The shown failure, with `token`, `index` and `suggestion`. */
  errorDetail: ParseFailure | null
  /** The current error, shown or not. */
  rawError: ParseErrorCode | null
  /** The current failure, shown or not, with `token`, `index` and `suggestion`. */
  rawErrorDetail: ParseFailure | null
  /** Whether an error is shown. */
  invalid: boolean
  /** Localized text of the shown error, or `null`. */
  message: string | null
  /** Id to give your error element, for `aria-describedby`. */
  messageId: string
  /** Normalized form of the text (or `formatPreview`'s output) while it differs from what was typed, else `null`. */
  preview: string | null
  /** The resolved `presets`, to render your own suggestions. */
  presets: DurationPresetItem[]
  /** Writes a preset's value and normalizes the text. */
  selectPreset: (preset: DurationPresetItem) => void
  /** Normalizes the text, like blur. */
  onBlur: () => void
  /** Keyboard handling: arrow/page stepping, Enter to commit, Escape to revert. */
  onKeydown: (event: KeyboardEvent) => void
  /** Normalizes the text, shows any error and writes the value. Returns whether it was valid. */
  commit: () => boolean
  /** Shows the current error and returns whether the text is valid. */
  validate: () => boolean
  /** Goes back to the last committed state. Returns whether anything changed. */
  revert: () => boolean
  /** Moves by `direction` steps of `size` seconds (default: `step`). */
  stepBy: (direction: number, size?: number) => void
}

const slots = defineSlots<{
  /** Renderless mode: render your own input with the given props. */
  default?: (props: DurationInputSlotProps) => unknown
  /** Content before the input, e.g. an icon. */
  leading?: () => unknown
  /** Content after the input, e.g. a unit hint or a clear button. */
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
const presets = setting('presets')
const formatPreview = setting('formatPreview')

const options = computed(() => ({
  locales: props.locales ?? defaults.locales,
  locale: props.locale ?? defaults.locale,
  displayStyle: props.displayStyle ?? defaults.displayStyle,
  displayUnits: props.displayUnits ?? defaults.displayUnits,
  valueFormat: props.valueFormat ?? defaults.valueFormat,
  precision: props.precision ?? defaults.precision,
  implicitUnits: props.implicitUnits ?? defaults.implicitUnits,
  defaultUnit: props.defaultUnit ?? defaults.defaultUnit,
  step: props.step ?? defaults.step,
  snapToStep: props.snapToStep ?? defaults.snapToStep,
  clamp: props.clamp ?? defaults.clamp,
  validateOn: props.validateOn ?? defaults.validateOn,
  min: props.min,
  max: props.max,
  required: props.required,
  readonly: props.readonly,
  formatPreview: formatPreview.value,
}))

const duration = useDurationInput(model as Ref<unknown>, options)
const { text, error, errorDetail, rawError, rawErrorDetail, preview, settings, onBlur, commit, validate, revert, stepBy } =
  duration

/** A custom `formatPreview` controls the whole text, so the "= " only goes in front of the default preview. */
const previewText = computed(() => (preview.value === null || formatPreview.value ? preview.value : `= ${preview.value}`))

watch(error, (code) => emit('error', code))

const invalid = computed(() => error.value !== null)
function messageFor(failure: ParseFailure) {
  const { locale, min, max, displayUnits } = settings.value
  const overrides = messages.value === false ? undefined : messages.value
  return formatErrorMessage(failure, { locale, min, max, units: displayUnits, overrides })
}
const message = computed(() => (errorDetail.value === null || messages.value === false ? null : messageFor(errorDetail.value)))
const baseId = `sdi-${useId()}`
const messageId = `${baseId}-message`
const listId = `${baseId}-list`

// --- Presets menu (a combobox listbox) ---

const presetItems = computed<DurationPresetItem[]>(() =>
  (presets.value ?? []).flatMap((preset, i) => {
    const { label, value } = typeof preset === 'object' ? preset : { label: undefined, value: preset }
    const seconds = resolveAmount(value, settings.value.valueFormat, settings.value)
    if (seconds === undefined) return []
    return [{ id: `${baseId}-option-${i}`, label: label ?? duration.format(seconds), seconds }]
  }),
)
const hasMenu = computed(() => presetItems.value.length > 0 && !as.value && !slots.default)
const menuOpen = ref(false)
const filtering = ref(false)
const activeIndex = ref(-1)

const visibleItems = computed(() => {
  const query = text.value.trim().toLowerCase()
  if (!filtering.value || query === '') return presetItems.value
  return presetItems.value.filter((item) => item.label.toLowerCase().includes(query))
})
const menuVisible = computed(
  () => hasMenu.value && menuOpen.value && !props.disabled && !props.readonly && visibleItems.value.length > 0,
)
const activeItem = computed(() => (menuVisible.value ? visibleItems.value[activeIndex.value] : undefined))

function openMenu(filter: boolean) {
  menuOpen.value = true
  filtering.value = filter
  activeIndex.value = -1
}
function closeMenu() {
  menuOpen.value = false
  activeIndex.value = -1
}

function selectPreset(item: DurationPresetItem) {
  duration.onInput(duration.format(item.seconds))
  commit()
  closeMenu()
}

watch(activeItem, async (item) => {
  if (!item) return
  await nextTick()
  document.getElementById(item.id)?.scrollIntoView?.({ block: 'nearest' })
})

function onInput(event: Event | string | null) {
  duration.onInput(event)
  if (hasMenu.value) openMenu(true)
}

function onFieldBlur() {
  closeMenu()
  onBlur()
}

function onFocusOrClick() {
  if (hasMenu.value && !props.readonly && !menuOpen.value && text.value.trim() === '') openMenu(false)
}

const MENU_CLOSING_KEYS = new Set(['Enter', 'Tab', 'Escape', 'ArrowUp', 'ArrowDown', 'PageUp', 'PageDown'])

function onKeydown(event: KeyboardEvent) {
  if (menuVisible.value) {
    const count = visibleItems.value.length
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      const delta = event.key === 'ArrowDown' ? 1 : -1
      activeIndex.value = activeIndex.value === -1 && delta < 0 ? count - 1 : (activeIndex.value + delta + count) % count
      return
    }
    if (event.key === 'Enter' && activeItem.value) {
      event.preventDefault()
      selectPreset(activeItem.value)
      return
    }
    if (event.key === 'Escape') {
      event.preventDefault()
      event.stopPropagation()
      closeMenu()
      return
    }
  } else if (hasMenu.value && event.altKey && event.key === 'ArrowDown') {
    event.preventDefault()
    openMenu(false)
    return
  }
  // Also when the menu is open but hidden (nothing matched): committing or stepping changes the text,
  // which could match a preset and pop the menu up again.
  if (MENU_CLOSING_KEYS.has(event.key)) closeMenu()
  duration.onKeydown(event)
}

// --- Screen reader announcement of the preview, debounced so it doesn't read every keystroke ---

const announcement = ref('')
let announceTimer: ReturnType<typeof setTimeout> | undefined
watch(previewText, (value) => {
  clearTimeout(announceTimer)
  if (!value) announcement.value = ''
  else announceTimer = setTimeout(() => (announcement.value = value), 600)
})
onBeforeUnmount(() => clearTimeout(announceTimer))

// --- Attributes and props for each render mode ---

/** With a `name`, the form gets the model value from a hidden input instead of the raw text. */
const name = computed(() => attrs.name as string | undefined)
const hiddenInputProps = computed(() =>
  name.value
    ? { type: 'hidden', name: name.value, value: model.value === null ? '' : String(model.value), disabled: props.disabled }
    : null,
)

function passthroughAttrs(includeClass: boolean) {
  const { class: _class, style: _style, name: _name, 'aria-describedby': _describedBy, ...rest } = attrs
  return includeClass ? { ...rest, class: _class, style: _style } : rest
}

/** The caller's `aria-describedby` (e.g. a hint), plus the message of the built-in field. */
const describedBy = computed(() => {
  const ownMessage = message.value && !slots.default && !as.value ? messageId : undefined
  return [attrs['aria-describedby'], ownMessage].filter(Boolean).join(' ') || undefined
})

function stateProps() {
  return {
    disabled: props.disabled,
    readonly: props.readonly,
    required: props.required,
    'aria-describedby': describedBy.value,
    'aria-invalid': invalid.value ? ('true' as const) : undefined,
    'data-error': error.value ?? undefined,
  }
}

// `mergeProps` chains listeners, so the caller's `@blur`, `@keydown` or `@input` still fire next to ours.
const inputProps = computed(() =>
  mergeProps(passthroughAttrs(true), stateProps(), {
    modelValue: text.value,
    'onUpdate:modelValue': onInput,
    onBlur,
    onKeydown,
  }),
)

const nativeInputProps = computed(() =>
  mergeProps(passthroughAttrs(true), stateProps(), { value: text.value, onInput, onBlur, onKeydown }),
)

const asProps = computed(() => {
  const base = typeof as.value === 'string' ? nativeInputProps.value : inputProps.value
  const state: InvalidState = { invalid: invalid.value, error: error.value, message: message.value, onBlur }
  // `size` and `variant` are declared props here, but most libraries have them too: pass them on.
  return mergeProps(base, { size: size.value, variant: variant.value }, invalidProps.value?.(state) ?? {})
})

const comboboxProps = computed(() =>
  hasMenu.value
    ? {
        role: 'combobox',
        'aria-autocomplete': 'list' as const,
        'aria-expanded': menuVisible.value ? ('true' as const) : ('false' as const),
        'aria-controls': listId,
        'aria-activedescendant': activeItem.value?.id,
      }
    : {},
)

const slotProps = computed<DurationInputSlotProps>(() => ({
  inputProps: inputProps.value,
  nativeInputProps: nativeInputProps.value,
  hiddenInputProps: hiddenInputProps.value,
  text: text.value,
  value: model.value,
  error: error.value,
  errorDetail: errorDetail.value,
  rawError: rawError.value,
  rawErrorDetail: rawErrorDetail.value,
  invalid: invalid.value,
  message: message.value,
  messageId,
  preview: preview.value,
  presets: presetItems.value,
  selectPreset,
  onBlur,
  onKeydown,
  commit,
  validate,
  /** Goes back to the last committed state. Returns whether anything changed. */
  revert,
  /** Moves by `direction` steps of `size` seconds (default: `step`), e.g. `stepBy(1)`. */
  stepBy,
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

const visuallyHidden = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  whiteSpace: 'nowrap',
} as const

// The native input, or the `as` component instance (whose root may wrap the actual input).
const input = ref<HTMLInputElement | { $el?: unknown }>()
function inputElement() {
  const el = input.value instanceof HTMLElement ? input.value : input.value?.$el
  if (!(el instanceof HTMLElement)) return undefined
  return el instanceof HTMLInputElement ? el : (el.querySelector('input') ?? undefined)
}
// Tell the browser about invalid text, so a native form isn't submitted with the last valid value.
// It uses the current failure, shown or not, like native `required` does. With `messages: false`,
// the browser's tooltip still gets the locale's default text.
watchEffect(
  () => {
    const failure = rawErrorDetail.value
    inputElement()?.setCustomValidity?.(failure === null ? '' : messageFor(failure))
  },
  { flush: 'post' },
)

defineExpose({
  /** Focuses the input. */
  focus: () => inputElement()?.focus(),
  /** Blurs the input, which normalizes the text. */
  blur: () => inputElement()?.blur(),
  /** Normalizes the text and writes the value, like blur. */
  commit,
  /** Shows the current error (e.g. on submit) and returns whether the input is valid. */
  validate,
  revert,
  stepBy,
})
</script>

<template>
  <slot v-if="slots.default" v-bind="slotProps" />

  <template v-else-if="as">
    <component :is="as" ref="input" v-bind="asProps">
      <template v-for="name in forwardedSlots" #[name]="scope">
        <slot :name="name" v-bind="scope ?? {}" />
      </template>
    </component>
    <input v-if="hiddenInputProps" v-bind="hiddenInputProps" />
  </template>

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
        v-bind="{ ...passthroughAttrs(false), ...comboboxProps, ...stateProps() }"
        :value="text"
        @input="onInput"
        @blur="onFieldBlur"
        @focus="onFocusOrClick"
        @click="onFocusOrClick"
        @keydown="onKeydown"
      />
      <span v-if="showPreview && previewText" :class="classFor('preview')" data-slot="preview" aria-hidden="true">{{ previewText }}</span>
      <span v-if="slots.trailing" :class="classFor('trailing')" data-slot="trailing"><slot name="trailing" /></span>
      <ul v-if="hasMenu" v-show="menuVisible" :id="listId" role="listbox" :class="classFor('menu')" data-slot="menu">
        <li
          v-for="(item, i) in visibleItems"
          :id="item.id"
          :key="item.id"
          role="option"
          :aria-selected="activeItem === item ? 'true' : 'false'"
          :data-active="activeItem === item || undefined"
          :class="classFor('option')"
          data-slot="option"
          @mousedown.prevent
          @mousemove="activeIndex = i"
          @click="selectPreset(item)"
        >
          {{ item.label }}
        </li>
      </ul>
    </div>
    <span v-if="showPreview" :style="visuallyHidden" aria-live="polite" data-slot="announcer">{{ announcement }}</span>
    <input v-if="hiddenInputProps" v-bind="hiddenInputProps" />
    <p v-if="message" :id="messageId" :class="classFor('message')" data-slot="message">{{ message }}</p>
  </div>
</template>
