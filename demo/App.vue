<script setup lang="ts">
import { ref, watch, watchEffect } from 'vue'
import InputText from 'primevue/inputtext'
import { VTextField } from 'vuetify/components'
import ShadcnInput from './shadcn/Input.vue'
import {
  de,
  DurationInput,
  en,
  parseDuration,
  primevue,
  vuetify,
  type FormatStyle,
  type ParseErrorCode,
  type Precision,
  type ValidateOn,
  type ValueFormat,
} from '../src'

const minutes = ref<number | null>(null)
const error = ref<ParseErrorCode | null>(null)
const localeCode = ref<'en' | 'de'>('en')
const displayStyle = ref<FormatStyle>('short')
const dark = ref(window.matchMedia('(prefers-color-scheme: dark)').matches)
watchEffect(() => document.documentElement.classList.toggle('dark', dark.value))

const examples = [
  '2h',
  '3days',
  '189h',
  '10 hours',
  '59 min',
  '1h 30m',
  '2d4h',
  '1.5h',
  '0,5 Tage',
  '1:30',
  '2 Stunden 15 Minuten',
  '1h30',
  'PT1H30M',
  '45',
  '5 huors',
  '5 parsecs',
]

const input = ref<InstanceType<typeof DurationInput>>()

function pick(example: string) {
  const result = parseDuration(example)
  minutes.value = result.ok ? result.minutes : null
  input.value?.focus()
}

const sizes = ['sm', 'md', 'lg'] as const
const presets = ['15m', '30m', '45m', '1h', '1h 30m', '2h', { label: 'Half a day (4h)', value: '4h' }]
const valueFormat = ref<Exclude<ValueFormat, object>>('minutes')
const precision = ref<Precision>('minute')
const validateOn = ref<ValidateOn>('eager')
const playground = ref<number | string | null>(90)
watch([valueFormat, precision], () => (playground.value = null))
const submitted = ref<string | null>(null)
function onSubmit(event: Event) {
  submitted.value = JSON.stringify(Object.fromEntries(new FormData(event.target as HTMLFormElement)))
}
const variants = ['outline', 'soft', 'ghost'] as const
const shared = ref<number | null>(90)
</script>

<template>
  <div class="min-h-screen bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
    <main class="mx-auto max-w-2xl space-y-12 px-4 py-12">
      <header class="flex items-start justify-between gap-4">
        <div>
          <h1 class="text-3xl font-semibold tracking-tight">Semantic Duration Input</h1>
          <p class="mt-2 text-zinc-500">
            Type a duration like <code>2h</code>, <code>1h 30m</code>, <code>1:30</code> or <code>3 Tage</code>, then
            leave the field.
          </p>
        </div>
        <label class="flex shrink-0 items-center gap-2 text-sm">
          <input v-model="dark" type="checkbox" /> Dark
        </label>
      </header>

      <section class="space-y-4">
        <label for="duration" class="block text-sm font-medium">Duration</label>
        <DurationInput
          id="duration"
          ref="input"
          v-model="minutes"
          size="lg"
          preview
          :locale="localeCode === 'de' ? de : en"
          :display-style="displayStyle"
          placeholder="e.g. 1h 30m"
          @error="error = $event"
        >
          <template #leading>⏱</template>
        </DurationInput>

        <dl class="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-1 text-sm">
          <dt class="font-medium">v-model</dt>
          <dd data-testid="minutes" class="font-mono">{{ minutes === null ? 'null' : `${minutes} min` }}</dd>
          <dt class="font-medium">error</dt>
          <dd data-testid="error" class="font-mono">{{ error ?? '–' }}</dd>
        </dl>

        <fieldset class="flex flex-wrap gap-4 rounded-lg border border-zinc-500/30 p-3 text-sm">
          <legend class="px-1">Display</legend>
          <label><input v-model="displayStyle" type="radio" value="short" /> short</label>
          <label><input v-model="displayStyle" type="radio" value="long" /> long</label>
          <label><input v-model="localeCode" type="radio" value="en" /> English</label>
          <label><input v-model="localeCode" type="radio" value="de" /> Deutsch</label>
        </fieldset>

        <ul class="grid gap-1 text-sm">
          <li v-for="example in examples" :key="example" class="flex items-center gap-2">
            <button
              type="button"
              class="w-48 rounded border border-zinc-500/30 px-2 py-0.5 text-left font-mono hover:bg-zinc-500/10"
              @click="pick(example)"
            >
              {{ example }}
            </button>
            <span class="text-zinc-500">→ {{ (r => (r.ok ? `${r.minutes} min` : r.error))(parseDuration(example)) }}</span>
          </li>
        </ul>
      </section>

      <section class="space-y-4">
        <h2 class="text-xl font-semibold">Keyboard, presets &amp; forms</h2>
        <p class="text-sm text-zinc-500">
          <kbd>↑</kbd>/<kbd>↓</kbd> step 15min, with <kbd>Shift</kbd> 1h, <kbd>PgUp</kbd>/<kbd>PgDn</kbd> 1d.
          <kbd>Enter</kbd> normalizes, <kbd>Esc</kbd> reverts. Presets open on focus while empty or with
          <kbd>Alt</kbd>+<kbd>↓</kbd>.
        </p>
        <fieldset class="flex flex-wrap gap-x-4 gap-y-2 rounded-lg border border-zinc-500/30 p-3 text-sm">
          <legend class="px-1">Options</legend>
          <label>
            valueFormat
            <select v-model="valueFormat" class="rounded border border-zinc-500/30 bg-transparent">
              <option v-for="f in ['minutes', 'seconds', 'ms', 'iso']" :key="f" :value="f">{{ f }}</option>
            </select>
          </label>
          <label>
            precision
            <select v-model="precision" class="rounded border border-zinc-500/30 bg-transparent">
              <option value="minute">minute</option>
              <option value="second">second</option>
            </select>
          </label>
          <label>
            validateOn
            <select v-model="validateOn" class="rounded border border-zinc-500/30 bg-transparent">
              <option v-for="v in ['eager', 'blur', 'input']" :key="v" :value="v">{{ v }}</option>
            </select>
          </label>
        </fieldset>
        <form class="space-y-2" @submit.prevent="onSubmit">
          <label for="playground" class="block text-sm font-medium">Estimate</label>
          <DurationInput
            id="playground"
            v-model="playground"
            name="estimate"
            :presets="presets"
            :value-format="valueFormat"
            :precision="precision"
            :validate-on="validateOn"
            max="1w"
            preview
            placeholder="e.g. 1h30"
          />
          <div class="flex items-center gap-3 text-sm">
            <button type="submit" class="rounded border border-zinc-500/30 px-3 py-1 hover:bg-zinc-500/10">Submit</button>
            <span class="font-mono">v-model: {{ JSON.stringify(playground) }}</span>
            <span v-if="submitted" class="font-mono text-zinc-500">FormData: {{ submitted }}</span>
          </div>
        </form>
      </section>

      <section class="space-y-4">
        <h2 class="text-xl font-semibold">Sizes &amp; variants</h2>
        <div class="grid gap-3 sm:grid-cols-3">
          <template v-for="variant in variants" :key="variant">
            <DurationInput
              v-for="size in sizes"
              :key="size"
              v-model="shared"
              :size="size"
              :variant="variant"
              :placeholder="`${variant} / ${size}`"
            />
          </template>
        </div>
        <div class="grid gap-3 sm:grid-cols-2">
          <DurationInput v-model="shared" disabled />
          <DurationInput :model-value="null" required min="30m" max="8h" placeholder="30min – 8h, required" preview>
            <template #trailing>
              <span class="text-xs">max 8h</span>
            </template>
          </DurationInput>
        </div>
      </section>

      <section class="space-y-4">
        <h2 class="text-xl font-semibold">Customizing</h2>
        <p class="text-sm text-zinc-500"><code>ui</code> overrides (merged with tailwind-merge)</p>
        <DurationInput
          v-model="shared"
          preview
          :ui="{
            field: 'rounded-full border-2 border-violet-500/50 px-5 focus-within:border-violet-500 focus-within:ring-violet-500/30',
            preview: 'rounded-full bg-violet-500/10 px-2 text-violet-600 dark:text-violet-300',
          }"
        />
        <p class="text-sm text-zinc-500"><code>--sdi-*</code> tokens</p>
        <DurationInput
          v-model="shared"
          class="[--sdi-border:var(--color-emerald-500)] [--sdi-ring:var(--color-emerald-500)] [--sdi-invalid:var(--color-orange-500)]"
        />
        <p class="text-sm text-zinc-500"><code>unstyled</code> + <code>data-*</code> hooks</p>
        <DurationInput
          v-model="shared"
          unstyled
          :ui="{
            root: 'group',
            field: 'border-b-2 border-zinc-400 py-1 group-data-invalid:border-red-500',
            input: 'w-full bg-transparent outline-none',
            message: 'mt-1 text-xs text-red-500',
          }"
        />
      </section>

      <section class="space-y-4">
        <h2 class="text-xl font-semibold">Design systems</h2>

        <div class="theme-shadcn space-y-2 rounded-lg bg-(--background) p-4 text-(--foreground)">
          <p class="text-sm font-medium">shadcn-vue theme — built-in field picks up the tokens</p>
          <DurationInput v-model="shared" preview />
          <p class="text-sm font-medium">shadcn-vue <code>&lt;Input&gt;</code> via <code>as</code></p>
          <DurationInput v-model="shared" :as="ShadcnInput" placeholder="e.g. 1h 30m" />
        </div>

        <div class="space-y-2">
          <p class="text-sm font-medium">PrimeVue <code>InputText</code> via <code>as</code></p>
          <DurationInput v-model="shared" :as="InputText" :invalid-props="primevue" fluid />
        </div>

        <div class="space-y-2">
          <p class="text-sm font-medium">Vuetify <code>v-text-field</code> via the slot</p>
          <DurationInput v-slot="{ inputProps, invalid, message }" v-model="shared">
            <VTextField v-bind="inputProps" label="Duration" :error="invalid" :error-messages="message ?? []" />
          </DurationInput>
          <p class="text-sm font-medium">…or via <code>as</code> with the <code>vuetify</code> preset</p>
          <DurationInput v-model="shared" :as="VTextField" :invalid-props="vuetify" label="Duration" variant="outlined" />
        </div>
      </section>
    </main>
  </div>
</template>
