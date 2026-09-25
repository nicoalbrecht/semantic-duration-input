<script setup lang="ts">
import { ref } from 'vue'
import { parseDuration, type ParseErrorCode } from '../../../src'

/** A live `<DurationInput>` with a readout of its model. Other attributes and slots go to the input. */
defineOptions({ inheritAttrs: false })

const props = defineProps<{
  /** Initial model value. */
  initial?: number | string | null
  /** Clickable example inputs, written to the model as minutes. */
  examples?: string[]
}>()

const value = ref<number | string | null>(props.initial ?? null)
const error = ref<ParseErrorCode | null>(null)
const input = ref<{ focus: () => void; commit: () => boolean }>()
const submitted = ref<string | null>(null)

function pick(example: string) {
  const result = parseDuration(example)
  value.value = result.ok ? result.minutes : null
  input.value?.focus()
}

function onSubmit(event: Event) {
  submitted.value = JSON.stringify(Object.fromEntries(new FormData(event.target as HTMLFormElement)))
}
</script>

<template>
  <form class="demo vp-raw" @submit.prevent="onSubmit">
    <DurationInput ref="input" v-model="value" v-bind="$attrs" @error="error = $event">
      <template v-for="(_, name) in $slots" #[name]="scope">
        <slot :name="name" v-bind="scope ?? {}" />
      </template>
    </DurationInput>
    <div v-if="examples" class="demo-examples">
      <button v-for="example in examples" :key="example" type="button" @click="pick(example)">{{ example }}</button>
    </div>
    <div class="demo-readout">
      <span data-testid="model">v-model: {{ JSON.stringify(value) }}</span>
      <span v-if="error">error: {{ error }}</span>
      <span v-if="submitted && submitted !== '{}'">FormData: {{ submitted }}</span>
    </div>
  </form>
</template>
