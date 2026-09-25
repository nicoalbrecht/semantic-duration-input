---
aside: false
---

# Playground

Try the options together. Press <kbd>↑</kbd>/<kbd>↓</kbd> to step, <kbd>Alt</kbd>+<kbd>↓</kbd> for presets, <kbd>Enter</kbd> to submit.

<script setup>
import { computed, ref } from 'vue'
import { de, en } from '../src'

const valueFormat = ref('minutes')
const precision = ref('minute')
const validateOn = ref('eager')
const localeCode = ref('en')
const displayStyle = ref('short')
const size = ref('md')
const variant = ref('outline')
const preview = ref(true)
const clamp = ref(false)
const snapToStep = ref(false)
const required = ref(false)

const locale = computed(() => (localeCode.value === 'de' ? de : en))
const presets = ['15m', '30m', '45m', '1h', '1h 30m', '2h', { label: 'Half a day (4h)', value: '4h' }]
// Remount when the model's type changes, so the old value isn't read in the new format.
const key = computed(() => `${valueFormat.value}-${precision.value}`)
</script>

<div class="demo-controls vp-raw">
  <label>valueFormat <select v-model="valueFormat"><option>minutes</option><option>seconds</option><option>ms</option><option>iso</option></select></label>
  <label>precision <select v-model="precision"><option>minute</option><option>second</option></select></label>
  <label>validateOn <select v-model="validateOn"><option>eager</option><option>blur</option><option>input</option></select></label>
  <label>locale <select v-model="localeCode"><option>en</option><option>de</option></select></label>
  <label>displayStyle <select v-model="displayStyle"><option>short</option><option>long</option></select></label>
  <label>size <select v-model="size"><option>sm</option><option>md</option><option>lg</option></select></label>
  <label>variant <select v-model="variant"><option>outline</option><option>soft</option><option>ghost</option></select></label>
  <label><input v-model="preview" type="checkbox"> preview</label>
  <label><input v-model="clamp" type="checkbox"> clamp</label>
  <label><input v-model="snapToStep" type="checkbox"> snapToStep</label>
  <label><input v-model="required" type="checkbox"> required</label>
</div>

<Demo
  :key="key"
  name="estimate"
  placeholder="e.g. 1h30"
  max="1w"
  :presets="presets"
  :value-format="valueFormat"
  :precision="precision"
  :validate-on="validateOn"
  :locale="locale"
  :display-style="displayStyle"
  :size="size"
  :variant="variant"
  :preview="preview"
  :clamp="clamp"
  :snap-to-step="snapToStep"
  :required="required"
/>

`max` is set to one week.

A version with PrimeVue, Vuetify and shadcn-vue lives in the repository: run `npm run dev`.
